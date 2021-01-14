module ngApp.home.controllers {

  import ICoreService = ngApp.core.services.ICoreService;
  import IParticipantsService = ngApp.participants.services.IParticipantsService;
  import IFilesService = ngApp.files.services.IFilesService;
  import IProjectsService = ngApp.projects.services.IProjectsService;
  import TableiciousConfig = ngApp.components.tables.directives.tableicious.TableiciousConfig; //added to resolve TS error

  export interface IHomeController {
    getChartFilteredData() : any[];
    getChartTooltipFunction(): any;
    setChartDataFilter(): void;
    refresh(): void;
  }

  class HomeController implements IHomeController {

    projectData: any;
    projectChartData: any[];
    numberFilter: any;
    tooltipFn: any;
    exampleSearchQueries: any;
    defaultParams: any;
    homeConfig: Object; //will hold custom configuration for 'home'
    barchartConfig: Object; //hold barchart configuration from config.json
    projectStats: any;

    /* @ngInject */
    constructor(private CoreService: ICoreService,
                private $filter: ng.IFilterService,
                private $sanitize: ng.ISCEService,
                private ParticipantsService: IParticipantsService,
                private FilesService: IFilesService,
                private ProjectsService: IProjectsService) {
      //Get barchart config 
      this.barchartConfig = this.CoreService.getComponentFromConfig('search')['barchart-config'];

      //Sanitize icon HTML as it can be embedded in template
      _.forEach(this.barchartConfig['summary-stat'], (stat, i) => {
        stat['icon'] = $sanitize.trustAsHtml( stat['icon'] );
      })

      this.numberFilter = $filter("number");

      this.tooltipFn = _.bind(function (d) {
        var str = "";

        if (arguments.length === 0) {
          return str;
        }
        var study_name = (parseInt(d.caseCount) === 1) ? "sample" : "samples";
        var file_name = (parseInt(d.fileCount) === 1) ? "file" : "files";

        //ORIGINAL TRUNK
        // //str = "<h4>" + d.projectID + " (" + d.primarySite + ")</h4>\n<p>" +
        // str = "<h4>" + d.barTip + "</h4>\n<p>" +
        //   this.numberFilter(d.caseCount) + " " + study_name +
        //   " (" + this.numberFilter(d.fileCount) + " " + file_name + ")\n" +
        //   "</p>";
        if (this.barchartConfig['data-tooltip-include-project-id']) {
          str += "<h4>" + d._key + " (" + d.barTip + ")</h4>\n<p>"
        } else{
          str += "<h4>" + d.barTip + "</h4>\n<p>"
        }
        str += this.numberFilter(d.caseCount) + " " + study_name +
          " (" + this.numberFilter(d.fileCount) + " " + file_name + ")\n" +
          "</p>";

        return str;
      }, this);


      const yearsToDays = year => year * 365.25;

      this.defaultParams =  {
        size: 0
      };

      // Get custom 'home' config
      this.homeConfig = this.CoreService.getComponentFromConfig('home');
      this.CoreService.setPageTitle(this.homeConfig['page-title']);

      // Add placeholder values to enable spinners
      this.homeConfig['example-queries'].forEach(query => {
        query.case_count = null;
        query.file_count = null;
      });

      // Use the config as placeholder values until the query comes back
      this.exampleSearchQueries = this.homeConfig['example-queries'];

      // Get example query details (description, counts, and href links)
      var promise = this.CoreService.getFromAPI('/home_example_queries');
      promise.then((response) => {
        // Apply data object to controller object and DOM is automatically updated with counts
        this.exampleSearchQueries = response['data'];
      });

      this.refresh();
    }

    transformProjectData(data) {
      var _controller = this,
          hits = (<any>_).get(data, 'hits', false);

      if (! hits) {
        return;
      }

      // allow duplicate project ids, count the number of unique projects
      let bar_segment_tips: any = {};
      let n_unique_bar_segment_tips: number = 0;

      _.map(hits, function(hit: any) {
      	  if (!(hit['bar_segment_tip'] in bar_segment_tips)) {
	           ++n_unique_bar_segment_tips;
      	      bar_segment_tips[hit['bar_segment_tip']] = 1;
          }
      });

      data.pagination.unique_total = n_unique_bar_segment_tips;

      // reduce the array keyed on projectID
      var bars = _.reduce(hits, function(barChartData, singleBar) {
        var x_axis = singleBar['x_axis'];

        if (x_axis) {
          if (! _.isArray(barChartData[x_axis])) {
            barChartData[x_axis] = [];
          }

          barChartData[x_axis].push(singleBar);
        }

        return barChartData;

      }, {});

      var barIDs = _.keys(bars);

      if (barIDs.length === 0) {
        return;
      }


      var firstPassProjectData = _.filter(
        _.map(barIDs, function(pID) {
          var barData = bars[pID],
              caseCount = 0,
              fileCount = 0;

          for (var i = 0; i < barData.length; i++) {
            caseCount += +((<any>_).get(barData[i], 'summary.case_count', 0));
            fileCount += +((<any>_).get(barData[i], 'summary.file_count', 0));
          }

          var _count = _controller.barchartConfig['x-axis-order-by-count'] == 'file_count' ? fileCount : caseCount;

          /* _key and _count are required data properties for the marked bar chart */
          return {_key: pID, values: barData, _count: _count, fileCount: fileCount}
      }), function(d) { return d._count > 0; })
      .sort(function (barDataA, barDataB) {
          return barDataB._count - barDataA._count;
      });

      _controller.projectChartData = _.map(firstPassProjectData, function(barData) {
        var dataStack : any = {};
        var barTotalY: number = 0;

        _.assign(dataStack, barData);

        var sortedProjects = barData.values.sort(function (a, b) { return a.summary[_controller.barchartConfig['x-axis-order-by-count']] - b.summary[_controller.barchartConfig['x-axis-order-by-count']]; });

        dataStack.stacks =  _.map(sortedProjects, function (project) {
          // Make sure previous bar's y1 > y0
          if (barTotalY < 0) {
            barTotalY++;
          }

          var newPrimarySiteTotal: number = barTotalY + project['summary'][_controller.barchartConfig['x-axis-order-by-count']];

          var stack = {
            _key: barData._key,
            barTip: project['bar_segment_tip'],
            y0: barTotalY,
            y1: newPrimarySiteTotal,
            caseCount: project['summary']['case_count'],
            fileCount: project['summary']['file_count']
          };

          barTotalY = newPrimarySiteTotal;

          return stack;
        });

        dataStack._maxY = barTotalY;

        return dataStack;

      });
    }


    getChartFilteredData() {
      return this.projectChartData;
    }

    getChartTooltipFunction() {
      return this.tooltipFn;
    }

    setChartDataFilter() {

    }

    getProjectStats() {
      return this.projectStats;
    }

    fetchAllStatsData() {
      var _controller = this;

      this.FilesService.getFiles({size: 0}).then((d) => {
        this['fileData'] = d;
      });

      this.ParticipantsService.getParticipants({size: 0}).then((d) => {
        this['caseData'] = d;
      });
      this.ProjectsService.getProjectsGraphData({
        graph_type: 'bar_graph'
      })
        .then((projectData) => {
          _controller['projectData'] = projectData;
          _controller['projectData']['aggregations']['x_labels']['buckets'] = projectData['aggregations']['x_labels']['buckets'].filter(x => !(x.key === '_missing'));
          _controller['chartData'] = _controller.transformProjectData(projectData);
        })
    }

    refresh() {
      this.fetchAllStatsData();
    }
  }

  angular
      .module("home.controller", [
        "ngApp.core",
        "participants.services",
        "files.services"
        ])
      .controller("HomeController", HomeController);
}
