module ngApp.components.ui.search.controllers {
  import ILocationService = ngApp.components.location.services.ILocationService;
  import IUserService = ngApp.components.user.services.IUserService;

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
                private UserService: IUserService,
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
        templateUrl: "core/templates/show-history.html",
        controller: "HistoryController",
        controllerAs: "wc",
        backdrop: "static",
        keyboard: false,
        backdropClass: "warning-backdrop",
        animation: false,
        size: "lg",
        resolve: {
          queries: () => this.UserService.currentUser.queries,
          hrefs: () => this.UserService.currentUser.hrefs,
          scounts: () => this.UserService.currentUser.scounts,
          fcounts: () => this.UserService.currentUser.fcounts,
          comments: () => "test"
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
    constructor(private $uibModalInstance, 
                private LocationService: ILocationService,
                private $uibModalStack, 
                private $window, 
                private queries, 
                private hrefs, 
                private scounts,
                private comments,
                private UserService: IUserService, 
                private fcounts) {}

    redoHistory(path: string): void {
      this.$uibModalStack.dismissAll();
      this.$window.location.href = path;
    }

    acceptWarning(): void {
      this.$uibModalInstance.close();
    }

    refresh(): void {
      this.UserService.login();
      this.queries = this.UserService.currentUser.queries;
      this.hrefs = this.UserService.currentUser.hrefs;
      this.scounts = this.UserService.currentUser.scounts;
      this.fcounts = this.UserService.currentUser.fcounts;
      this.comments = this.UserService.currentUser.comments;
    }

    addComment(query: string, comment: string): void {
      if (comment.length) {
        this.LocationService.setSearch({
            query: query,
            filters: angular.toJson({"query": query}),
            comment: comment
        });
      } else {
          this.LocationService.setSearch({});
      }
    }

  }

  angular.module("ui.search.controllers", [])
      .controller("HistoryController", HistoryController)
      .controller("SearchBarController", SearchBarController);
}
