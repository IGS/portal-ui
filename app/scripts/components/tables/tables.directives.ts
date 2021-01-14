module ngApp.components.tables.directives {

  import IGDCWindowService = ngApp.core.models.IGDCWindowService;

  interface ITableDirectiveScope extends ng.IScope {
     filtersRevealed:boolean;

     //NOTE: all here were added to resolve TS errors
     UserService: any; //UserService import?!
     headings: any;
     defaultHeadings: any;
     title: string;
     saved: any;
     restoreDefaults: any;
     toggleVisibility: any;
     sortOptions: any;
  }

  /* @ngInject */
  function ArrangeColumns($window, UserService): ng.IDirective {

    return {
      restrict: "EA",
      scope: {
        title: "@",
        headings:"=",
        defaultHeadings: "=",
        saved: "="
      },
      replace: true,
      templateUrl: "components/tables/templates/arrange-columns.html",
      link:function($scope: ITableDirectiveScope) {
        $scope.UserService = UserService;

        function saveSettings() {
          var save = _.map($scope.headings, h => _.pick(h, 'field', 'show', 'sort', 'order'));
          $window.localStorage.setItem($scope.title + '-col', angular.toJson(save));
        }

        var defaults = $scope.defaultHeadings;

        $scope.headings = ($scope.saved || []).length ?
          _.map($scope.saved, s => _.merge(_.find($scope.headings, {field: s['field']}), s)) :
          $scope.headings;

        $scope.restoreDefaults = function() {
          $scope.headings = _.cloneDeep(defaults);
          saveSettings();
        }

        $scope.toggleVisibility = function (item) {
          item.show = !item.show;
          saveSettings();
        };

        $scope.sortOptions = {
          orderChanged: saveSettings
        };
      }
    };
  }

  function ExportTable(): ng.IDirective {
    return {
      restrict: "EA",
      scope: {
        text: "@",
        size: "@",
        headings: "=",
        endpoint: "@",
        expand: "="
      },
      replace: true,
      templateUrl: "components/tables/templates/export-table.html",
      controller: "ExportTableController as etc"
    };
  }

  function ReportsExportTable(): ng.IDirective {
    return {
      restrict: "EA",
      scope: {
        text: "@",
        size: "@",
        headings: "=",
        endpoint: "@",
        expand: "="
      },
      replace: true,
      templateUrl: "components/tables/templates/reports-export-table.html",
      controller: "ExportTableController as etc"
    };
  }

  function GDCTable(): ng.IDirective {
    return {
      restrict: "E",
      scope: {
        heading: "@",
        data: "=",
        config: "=",
        paging: "=",
        page: "@",
        sortColumns: "=",
        id: "@",
        endpoint: "@",
        clientSide: "="
      },
      replace: true,
      templateUrl: "components/tables/templates/gdc-table.html",
      controller: "GDCTableController as gtc"
    }
  }

  angular.module("tables.directives", ["tables.controllers"])
      .directive("exportTable", ExportTable)
      .directive("reportsExportTable", ReportsExportTable)
      .directive("gdcTable", GDCTable)
      .directive("arrangeColumns", ArrangeColumns);
}
