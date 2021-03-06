module ngApp.search {
  "use strict";

  /* @ngInject */
  function searchConfig($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) {

    $urlRouterProvider.when("/search", "/search/f");

    $stateProvider.state("search", {
      url: "/search?{filters:any}&pagination&{facetTab:string}",
      controller: "SearchController as sc",
      templateUrl: "search/templates/search.html",
      reloadOnSearch: false
    });

    $stateProvider.state("search.summary", {
      url: "/s",
      data: {
        tab: "summary"
      },
      reloadOnSearch: false
    });

    $stateProvider.state("search.participants", {
      url: "/c",
      data: {
        tab: "participants"
      },
      reloadOnSearch: false
    });

    $stateProvider.state("search.files", {
      url: "/f",
      data: {
        tab: "files"
      },
      reloadOnSearch: false
    });
  }

  angular
      .module("ngApp.search", [
        "search.controller",
        "ui.router.state"
      ])
      .config(searchConfig);
}
