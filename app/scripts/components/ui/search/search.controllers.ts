module ngApp.components.ui.search.controllers {
  import ILocationService = ngApp.components.location.services.ILocationService;

  interface ISearchBarController {
    gql: any;
    query: string;
    setQuery(): void;
    sendQuery(): void;
    saveQuery(): void;
    resetQuery(): void;
    showHistory(): void;
  }

  class SearchBarController implements ISearchBarController {
    gql: any = null;
    query: string = "";
    Error: any = null;

    /* @ngInject */
    constructor(private $scope: ng.IScope,
                private LocationService: ILocationService,
                private $uibModal: any,
                private $state: ng.ui.IStateService) {

      $scope.$watch("query", () => {
        if (!this.query) {
          this.LocationService.setQuery();
        }
      });
      this.setQuery();
    }

    sendQuery() {
      if (this.query.length) {
        this.LocationService.setSearch({
            query: this.query,
            filters: angular.toJson({"query": this.query})
        });
      } else {
          this.LocationService.setSearch({});
      }
    }

    saveQuery() {
      if (this.query.length) {
        this.LocationService.setSearch({
            query: this.query,
            filters: angular.toJson({"query": this.query}),
            save: "yes"
        });
      } else {
          this.LocationService.setSearch({});
      }
    }

    showHistory() {
      var showHistoryModal = this.$uibModal.open({
        templateUrl: "core/templates/login-failed-warning.html",
        controller: "HistoryController",
        controllerAs: "wc",
        backdrop: "static",
        keyboard: false,
        backdropClass: "warning-backdrop",
        animation: false,
        size: "lg",
        resolve: {
          warning: null,
          header: null
        }
      });
    }

    setQuery() {
      var currentQuery = this.LocationService.query();

      if (typeof currentQuery === "string") {
        this.query = currentQuery;
      }
    }

    resetQuery() {
      this.LocationService.clear();
      this.query = "";
      this.gql = null;
      this.Error = null;
    }
  }

  class HistoryController {
    /* @ngInject */
    constructor(private $uibModalInstance, private warning, private header) {}

    acceptWarning(): void {
      this.$uibModalInstance.close();
    }
  }

  angular.module("ui.search.controllers", [])
      .controller("HistoryController", HistoryController)
      .controller("SearchBarController", SearchBarController);
}
