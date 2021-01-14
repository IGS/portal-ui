module ngApp.components.tables.directives.tableicious {

  import ILocationService = ngApp.components.location.ILocationService;   

  /* @ngInject */
  function Tableicious(): ng.IDirective {
    /* 
    * Setting 'bindToController' to true to prevent multi-directive error with ng-table. 
    * This binds the scope properties to the controller, and also allows both scopes 
    * (tablecious & ng-table) to exist and not collide/overwrite one another.
    * The scope props (above) get attached to the controller, so are accessible:
    * controller['property'] or this['property']  
    */ 
    return {
      restrict: "E",
      scope: {
        rowId: "@",
        data: "=",
        paging: "=",
        headings: "=",
        title: "@",
        saved: "=",
        page: "@",
        update: "=",
        tableModelConfig: "="
      },
      bindToController: true, 
      replace: true,
      templateUrl: "components/tables/templates/tableicious.html",
      controller: "TableiciousController as tc"
    }
  }

  function TableiciousCustomHeader(): ng.IDirective {
    // This directive overrides the native ngTable directive ngTableSorterRow
    return {
      restrict: "E",
      scope: {
        tableParams: "=",
        headings: "=",
        paging: "=",
        page: "=",
        data: "="
      },
      replace: true,
      templateUrl: "components/tables/templates/tableicious-custom-header.html",
      controller: "TableiciousSortController",
      controllerAs: "tsc",
    }
  }

  export interface IConfig { //TODO is this TableiciousConfig?!
      title: string;
      order: string[];
      rowId: string;
      headings: IHeading[];
      render(row: any): string;
  }

  export interface IHeading {
      //NOTE: all made optional to resolve TS error LINE 57
      th?: string;
      id?: string;
      td?(row:any, filter: ngApp.components.ui.string.ICustomFilterService): string;
      sortable?: any;
      show?: boolean;
  }

  // NOTE: added to resolve TS errors for no export TableiciousConfig.
  //      TableiciousConfig is in essence IHeading and IConfig.
  export interface TableiciousConfig extends IConfig {
    headings: IHeading[];
    fields?: any;
    facets?: any;
    model?: any;
    push?: any;
  }

  interface ICellJqueryElement extends ng.IAugmentedJQuery {
      accessKey: string;
  }

  /* @ngInject */
  function Cell($compile: ng.ICompileService): ICell {
      return {
          restrict: "A",
          scope: {
              cell: "=",
              row: "=",
              data: "=",
              paging: "="
          },
          link: function ($scope: ICellScope, element: ICellJqueryElement) {
            $scope.$watch('cell', function(value: any) {
                element.html(value);
                $compile(<any>element.contents())($scope);
              }
            );
          }

      }
  }

  interface ICell extends ng.IDirective {
      link(scope: ICellScope, element: ng.IAugmentedJQuery): void;
  }

  interface ICellScope extends ng.IScope {
      cell: string;
  }

  angular.module("tableicious.directive", ["ngTable"])
  .directive("tableicious", Tableicious)
  .directive("cell", Cell)
  .directive("tableiciousCustomHeader", TableiciousCustomHeader)
}
