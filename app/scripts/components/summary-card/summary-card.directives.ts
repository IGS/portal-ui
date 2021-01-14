module ngApp.components.summaryCard.directives {
  import ILocationFilters = ngApp.components.location.IFilters; //NOTE added to resolve TS errors
  import ILocationService = ngApp.components.location.services.ILocationService;
  import IProjectsService = ngApp.projects.services.IProjectsService;

  interface ISummaryCardScope extends ng.IScope {  //NOTE added to resolve TS errors
    ProjectsService: IProjectsService,
    config: any,
    mode: string,
    activeFilters: boolean,
    tableData: any,
    resultsStatus: string,
    setContainerHeight: any;
  }


  function SummaryCard(LocationService: ILocationService): ng.IDirective {
    return {
      restrict: "E",
      templateUrl: "components/summary-card/templates/summary-card.html",
      controller: "SummaryCardController as sc",
      replace: true,
      scope: {
        data: "=",
        height: "@",
        config: "=",
        title: "@",
        mode: "@",
        tableId: "@",
        groupingTitle: "@",
        showCases: "=",
        resultsStatus: "="
      },
      link: function($scope: ISummaryCardScope) {
        var config = $scope.config;
        $scope.mode = $scope.mode || "graph";

        function checkFilters() {
          if (LocationService.path().indexOf('/query') === 0) {
            return;
          }
          
          var filters: ILocationFilters = LocationService.filters();
          $scope.activeFilters = _.some(filters.content, (filter) => {
            return filter.content && filter.content.field === config['filter-key'];
          });
        }

        checkFilters();

        $scope.$on("$locationChangeSuccess", () => {
          checkFilters();
        });

        $scope.$watch("data", (newVal:any[]) => {
          if (newVal) {
            if (config['sort-key']) {
              newVal = _.orderBy(newVal, config['sort-key'], "desc");
            }
            var coloredSortedData = [];
            var color = d3.scale.category20();
            _.forEach(newVal, (item, index) => {
              coloredSortedData.push({ "color": color(String(index)), "data": item })
            });
            $scope.tableData = coloredSortedData;
          }
        });

        // Set the height of the placeholder div.no-results until the piechart renders
        $scope.setContainerHeight = () => {
          var height = Number($scope['height']) + 40;
          return { 'height': height + 'px' };
        }
      }
    };
  }

  function CaseSummaryCard(LocationService: ILocationService): ng.IDirective {
    return {
      restrict: "E",
      templateUrl: "components/summary-card/templates/case-summary-card.html",
      controller: "SummaryCardController as sc",
      replace: true,
      scope: {
        data: "=",
        height: "@",
        config: "=",
        title: "@",
        mode: "@",
        tableId: "@",
        groupingTitle: "@",
        showCases: "=",
        resultsStatus: "="
      },
      link: function($scope: ISummaryCardScope) {
        var config = $scope.config;
        $scope.mode = $scope.mode || "graph";

        function checkFilters() {
          if (LocationService.path().indexOf('/query') === 0) {
            return;
          }

          var filters: ILocationFilters = LocationService.filters();
          $scope.activeFilters = _.some(filters.content, (filter) => {
            return filter.content && filter.content.field === config['filter-key'];
          });
        }

        checkFilters();

        $scope.$on("$locationChangeSuccess", () => {
          checkFilters();
        });

        $scope.$watch("data", function(newVal: any){
          if (newVal) {
            // Ensure pie chart data is always sorted highest to lowest
            // for tables
            if (config['sort-data']) {
              newVal.sort(function(a, b) {
                if (a[config['sort-key']] > b[config['sort-key']]) {
                  return -1;
                }

                if (b[config['sort-key']] > a[config['sort-key']]) {
                  return 1;
                }

                return 0;
              });
            }

            var color = d3.scale.category20();
            _.forEach(newVal, (item, index) => {
              item['color'] = color(index);
            });

            $scope.tableData = config.blacklist
              ? newVal.filter(x =>
                  !config.blacklist.some(y =>
                    y.toLowerCase() === x.data_category.toLowerCase()
                  )
                )
              : newVal;
          }
        });
      }
    };
  }

  function ProjectSummaryCard(LocationService: ILocationService): ng.IDirective {
    return {
      restrict: "E",
      templateUrl: "components/summary-card/templates/project-summary-card.html",
      controller: "SummaryCardController as sc",
      replace: true,
      scope: {
        data: "=",
        height: "@",
        config: "=",
        title: "@",
        mode: "@",
        tableId: "@",
        groupingTitle: "@",
        showCases: "=",
        resultsStatus: "="
      },
      link: function($scope: ISummaryCardScope) {
        var config = $scope.config;
        $scope.mode = $scope.mode || "graph";

        function checkFilters() {
          if (LocationService.path().indexOf('/query') === 0) {
            return;
          }

          var filters: ILocationFilters = LocationService.filters();
          $scope.activeFilters = _.some(filters.content, (filter) => {
            return filter.content && filter.content.field === config['filter-key'];
          });
        }

        checkFilters();

        $scope.$on("$locationChangeSuccess", () => {
          checkFilters();
        });

        $scope.$watch("data", function(newVal: any){
          if (newVal) {
            // Ensure pie chart data is always sorted highest to lowest
            // for tables
            if (config['sort-data']) {
              newVal.sort(function(a, b) {
                if (a[config['sort-key']] > b[config['sort-key']]) {
                  return -1;
                }

                if (b[config['sort-key']] > a[config['sort-key']]) {
                  return 1;
                }

                return 0;
              });
            }

            var color = d3.scale.category20();
            _.forEach(newVal, (item, index) => {
              item['color'] = color(index);
            });

            $scope.tableData = config.blacklist
              ? newVal.filter(x =>
                  !config.blacklist.some(y =>
                    y.toLowerCase() === x.data_category.toLowerCase()
                  )
                )
              : newVal;
          }
        });
      }
    };
  }

  angular
    .module("summaryCard.directives", [
      "location.services"
    ])
    .directive("summaryCard", SummaryCard)
    .directive("caseSummaryCard", CaseSummaryCard)
    .directive("projectSummaryCard", ProjectSummaryCard);
}
