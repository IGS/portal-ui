module ngApp.search.services {

  import ILocationService = ngApp.components.location.services.ILocationService;
  import IUserService = ngApp.components.user.services.IUserService;

  export interface ITab {
    active: boolean;
    hasLoadedOnce?: boolean;
  }

  export interface ITabs {
    summary?: ITab;
    participants?: ITab;
    files?: ITab;
    items?: ITab; //NOTE Resolved TS error in cart.services. 'items' doesnt exist on 'ITabs'
  }

  export interface ISearchState {
    tabs: ITabs;
    facets: ITabs;
    setActive(section: string, tab: string, key: string): void;
  }

  class State implements ISearchState {
    tabs: ITabs = {
      summary: {
        active: false,
        hasLoadedOnce: false
      },
      participants: {
        active: false,
        hasLoadedOnce: false
      },
      files: {
        active: false,
        hasLoadedOnce: false
      }
    };
    facets: ITabs = {
      participants: {
        active: false
      },
      files: {
        active: false
      }
    };

    setActive(section: string, tab: string, key: string) {
      if (section && tab) {
        if (key === "active") {
          _.forEach(this[section], function (section: ITab) {
            section.active = false;
          });

          if (!(section === "facets" && tab==="summary")) {
            this[section][tab].active = true;
          }
        } else {
          this[section][tab].hasLoadedOnce = true;
        }

      }
    }
  }


  export interface ISearchService {
    getSummary(filters?: Object, ignoreUserProjects?: boolean): ng.IPromise<any>;
    createChartPlaceholders(chartConfigs: Object): any;
  }

  class SearchService implements ISearchService {

    /* @ngInject */
    constructor(private Restangular: Restangular.IService, private LocationService: ILocationService,
                private UserService: IUserService) {
    }

    getSummary(filters: Object = this.LocationService.filters(), ignoreUserProjects: boolean = false): ng.IPromise<any> {
      if (!ignoreUserProjects) {
        filters = this.UserService.addMyProjectsFilter(filters, "cases.project.project_id");
      }

      return this.Restangular.all("ui/search/summary")
      .post({ filters: filters }, undefined, { 'Content-Type': 'application/json' })
      .then((response) => {
        return response;
      });
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

  class SearchChartConfigs {
    chart0: any;
    chart1: any;
    chart2: any;
    chart3: any;
    chart4: any;
    chart5: any;

    /* @ngInject */
    constructor($filter: ngApp.components.ui.string.ICustomFilterService, config: ngApp.IGDCConfig) {
      var chartConfigs = config['search']['piechart-configs'];
      const chartsCount = chartConfigs.length;
      for (var i=0; i<chartsCount; i++) {
        var configName = "chart" + String(i);
        const filterKey = chartConfigs[i]["filter-key"];
        const defaultText = chartConfigs[i]["default-text"];
        const pluralDefaultText = chartConfigs[i]["plural-default-text"];
        const fieldFilter = chartConfigs[i]["field-filter"];
        const chartTitle = chartConfigs[i]["chart-title"];
        const groupingTitle = chartConfigs[i]["grouping-title"];
        const hoverLabel = chartConfigs[i]["hover-count-label"];

        this[configName] = {
          'chart-title': chartTitle,
          'grouping-title': groupingTitle,
          'filter-key': filterKey,
          'sort-key': "doc_count",
          'display-key': "key",
          'default-text': defaultText,
          'plural-default-text': pluralDefaultText,
          'hover-count-label': hoverLabel,
          'sort-data': true,
          'filters': {
            "default": {
              params: {
                filters: function(value) {
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
      .module("search.services", [])
      .service("SearchState", State)
      .service("SearchChartConfigs", SearchChartConfigs)
      .service("SearchService", SearchService);
}
