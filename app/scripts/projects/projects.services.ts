module ngApp.projects.services {
  import ILocationService = ngApp.components.location.services.ILocationService;
  import IUserService = ngApp.components.user.services.IUserService;
  import ICoreService = ngApp.core.services.ICoreService;
  import IRootScope = ngApp.IRootScope;
  import IGDCConfig = ngApp.IGDCConfig;

  export interface IProjectsService {
    getProject(id: string, params?: Object): ng.IPromise<any>;
    getProjects(params?: Object): ng.IPromise<any>;
    getProjectsGraphData(params?: Object): ng.IPromise<any>;
    createChartPlaceholders(chartConfigs: Object): any;
    projectIdMapping: any;
  }

  class ProjectsService implements IProjectsService {
    private ds: any;
    private projectsConfig: any;
    projectIdMapping: any;

    /* @ngInject */
    constructor(Restangular: Restangular.IService, private LocationService: ILocationService,
                private UserService: IUserService, private CoreService: ICoreService,
                private $rootScope: IRootScope, private $q: ng.IQService,
                config: IGDCConfig) {
      this.projectsConfig = config['projects'];
      // this.ds = Restangular.all("projects");
      this.ds = (APIRoute:string) => {
        return Restangular.all(APIRoute);
      }

    }

    getProject(id: string, params: Object = {}): ng.IPromise<any> {
      if (params.hasOwnProperty("fields")) {
        params["fields"] = params["fields"].join();
      }
      if (params.hasOwnProperty("expand")) {
        params["expand"] = params["expand"].join();
      }

      return this.ds.get(id, params).then((response): any => {
        return response["data"];
      });
    }

    getTableHeading() {
      return "Sample count per Data Category";
    }

    getProjects(params: Object = {}): ng.IPromise<any> {
      var paging = angular.fromJson(this.LocationService.pagination()["projects"]);

      // Testing is expecting these values in URL, so this is needed.
      paging = paging || {
        size: 20,
        from: 1
      };

      var defaults = {
        size: paging.size || 20,
        from: paging.from || 1,
        sort: paging.sort || this.projectsConfig['projects-table']['default-sort'],
      };

      this.CoreService.setSearchModelState(false);

      var abort = this.$q.defer();
      var prom: ng.IPromise<any> = this.ds("projects").withHttpConfig({
        timeout: abort.promise
      })
      .get("", angular.extend(defaults, params)).then((response): any => {
        this.CoreService.setSearchModelState(true);
        return response["data"];
      });

      var eventCancel = this.$rootScope.$on("gdc-cancel-request", () => {
        abort.resolve();
        eventCancel();
        this.CoreService.setSearchModelState(true);
      });

      return prom;
    }

    // Gets projects data for the home page bar graph
    getProjectsGraphData(params: Object = {}): ng.IPromise<any> {
      if (params.hasOwnProperty("graph_type")) {
        params["graph_type"] = params["graph_type"];
      }

      var defaults = {};

      this.CoreService.setSearchModelState(false);

      var abort = this.$q.defer();
      var prom: ng.IPromise<any> = this.ds("projects_graph_data").withHttpConfig({
        timeout: abort.promise
      })
        .get("", angular.extend(defaults, params)).then((response): any => {
          this.CoreService.setSearchModelState(true);
          return response["data"];
        });

      var eventCancel = this.$rootScope.$on("gdc-cancel-request", () => {
        abort.resolve();
        eventCancel();
        this.CoreService.setSearchModelState(true);
      });

      return prom;
    }

    createChartPlaceholders(chartConfigs: Object): any {
      // Creates a placeholder for each piechart. Allows the spinners display until data is returned from getSummary() 
      // This is used to: 
      // 1) pass along the cart config instead of waiting for data to return
      // 2) set buckets to an empty array
      var chartSummaryPlacholders = [];
      var chartNames = _.keys(chartConfigs);
      chartNames.forEach((chart_name, idx) => {
        var placeholder = {
          'results-status': 'pending',
          'buckets': [],
          'id': idx,
          'name': chart_name,
          'piechart-config': chartConfigs[chart_name]
        };
        chartSummaryPlacholders.push(placeholder);
      }, chartConfigs);

      return chartSummaryPlacholders;
    }
  }

  export interface ITab {
    active: boolean;
  }

  export interface ITabs {
    summary: ITab;
    table: ITab;
    graph: ITab;
  }

  export interface IProjectsState {
    tabs: ITabs;
    setActive(section: string, s: string): void;
  }

  class State implements IProjectsState {
    tabs: ITabs = {
      summary: {
        active: false
      },
      table: {
        active: false
      },
      graph: {
        active: false
      }
    };

    setActive(section: string, tab: string) {
      if (section && tab) {
        _.forEach(this[section], function (section: ITab) {
          section.active = false;
        });

        this[section][tab].active = true;
      }
    }
  }

  class ProjectsChartConfigs {
    chart0: any;
    chart1: any;

    /* @ngInject */
    constructor($filter: ngApp.components.ui.string.ICustomFilterService, config: ngApp.IGDCConfig) {
      var chartConfigs = config['projects']['piechart-configs'];
      const chartsCount = chartConfigs.length;
      for (var i = 0; i < chartsCount; i++) {
        var configName = "chart" + String(i);
        const filterKey = chartConfigs[i]["filter-key"];
        const defaultText = chartConfigs[i]["default-text"];
        const pluralDefaultText = chartConfigs[i]["plural-default-text"];
        const fieldFilter = chartConfigs[i]["field-filter"];
        const chartTitle = chartConfigs[i]["chart-title"];
        const groupingTitle = chartConfigs[i]["grouping-title"];
        const sortKey = chartConfigs[i]["sort-key"];
        const displayKey = chartConfigs[i]["display-key"];
        const hoverLabel = chartConfigs[i]["hover-count-label"];

        this[configName] = {
          'chart-title': chartTitle,
          'grouping-title': groupingTitle,
          'filter-key': filterKey,
          'sort-key': sortKey,
          'display-key': displayKey,
          'default-text': defaultText,
          'plural-default-text': pluralDefaultText,
          'hover-count-label': hoverLabel,
          'sort-data': true,
          'filters': {
            "default": {
              params: {
                filters: function (value) {
                  return $filter("makeFilter")([
                    {
                      field: fieldFilter,
                      value: [
                        value
                      ]
                    }
                  ], true);
                }
              }
            }
          }
        };
      } //end for
    } //end constructor
  } //end class

  angular
      .module("projects.services", [
        "restangular",
        "components.location",
        "user.services"
      ])
      .service("ProjectsState", State)
      .service("ProjectsService", ProjectsService)
      .service("ProjectsChartConfigs", ProjectsChartConfigs);
}
