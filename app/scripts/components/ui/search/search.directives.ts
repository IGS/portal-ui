module ngApp.components.ui.search.directives {
  // import IGDCWindowService = ngApp.models.IGDCWindowService;
  import IGDCWindowService = ngApp.core.models.IGDCWindowService; //NOTE resolves TS error

  /* @ngInject */
  function SearchBar(): ng.IDirective {
    return {
      restrict: "E",
      scope: true,
      templateUrl: "components/ui/search/templates/search-bar.html",
      controller: "SearchBarController as sb"
    };
  }

  angular.module("ui.search.directives", ["ui.search.controllers"])
      .directive("searchBar", SearchBar);
}
