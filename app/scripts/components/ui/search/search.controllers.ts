module ngApp.components.ui.search.controllers {
  import ILocationService = ngApp.components.location.services.ILocationService;
  import IUserService = ngApp.components.user.services.IUserService;
  import ICoreService = ngApp.core.services.ICoreService;

  interface ISearchBarController {
    gql: any;
    query: string;
    validQuery: boolean;
    setQuery(): void;
    sendQuery(): void;
    saveQuery(): void;
    resetQuery(): void;
    showHistory(): void;
  }

  export interface ISearchBarScope extends ng.IScope {
    validQuery: boolean;
    error: ngApp.components.gql.IGqlSyntaxError;
    showError: boolean;
  }

  class SearchBarController implements ISearchBarController {
    gql: any = null;
    query: string = "";
    error: any = null;
    showError: boolean = false;
    validQuery: boolean = true;
    pageConfig: any;

    /* @ngInject */
    constructor(private $scope: ISearchBarScope,
                private LocationService: ILocationService,
                private $uibModal: any,
                private UserService: IUserService,
                private $state: ng.ui.IStateService,
                private CoreService: ICoreService) {
      this.pageConfig = this.CoreService.getComponentFromConfig('search-advanced-query-page');

      $scope.$watch("query", () => {
        if (!this.query) {
          this.LocationService.setQuery();
        }
      });
      this.setQuery();

      // Listen for value change
      // These are changed by components.gql.gqlInput.gqlParse() 
      $scope.$watch("validQuery", () => {
        this.validQuery = this.$scope.validQuery;
        this.showError = this.$scope.showError;
      });
      $scope.$watch("error", () => {
        this.error = this.$scope.error;
        this.showError = this.$scope.showError;
      });
    }

    sendQuery() {
      this.showError = false; //clear old error message
      // Before sending the query, let's check if the query is valid.
      // If not, don't submit and display error.human
      if (!this.validQuery) {
        this.showError = true;
      } else {
        if (this.query.length) {
          var query = this.query.replace("\n", " "); //Remove newLine characters

          // TODO Why in the world is this not using the gl json?!?!
          this.LocationService.setSearch((<any>{
            query: query,
            filters: angular.toJson({"query": query})
          }));
        } else {
          this.LocationService.setSearch((<any>{}));
        }
      }
    }

    saveQuery() {
      if (this.query.length) {
        this.LocationService.setSearch((<any>{
            query: this.query,
            filters: angular.toJson({"query": this.query}),
            save: "yes"
        }));
      } else {
          this.LocationService.setSearch((<any>{}));
      }
      this.UserService.addToQueries(this.query);
      this.UserService.addToHrefs(this.LocationService.getHref());
      this.UserService.addToFcounts("0");
      this.UserService.addToScounts("0");
      this.UserService.addToComments(this.LocationService.comment());
      var ts = new Date();
      this.UserService.addToTimestamps(ts.toLocaleString());
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
          comments: () => this.UserService.currentUser.comments,
          timestamps: () => this.UserService.currentUser.timestamps
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
      this.$scope.error = null;
      this.$scope.showError = false;
      this.$scope.validQuery = true;
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
                private timestamps,
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
      //this.UserService.login();
      this.queries = this.UserService.currentUser.queries;
      this.hrefs = this.UserService.currentUser.hrefs;
      this.scounts = this.UserService.currentUser.scounts;
      this.fcounts = this.UserService.currentUser.fcounts;
      this.comments = this.UserService.currentUser.comments;
      this.timestamps = this.UserService.currentUser.timestamps;
    }

    addComment(query: string, comment: string, idx:number): void {
      if (comment.length) {
        this.LocationService.setSearch((<any>{
            query: query,
            filters: angular.toJson({"query": query}),
            comment: comment
        }));
      } else {
          this.LocationService.setSearch((<any>{}));
      }
      this.UserService.currentUser.comments[idx] = comment;
    }

  }

  angular.module("ui.search.controllers", [])
      .controller("HistoryController", HistoryController)
      .controller("SearchBarController", SearchBarController);
}
