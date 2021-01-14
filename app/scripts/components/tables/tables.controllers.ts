module ngApp.components.tables.controllers {
  import ILocationService = ngApp.components.location.services.ILocationService;
  import ITableColumn = ngApp.components.tables.models.ITableColumn;
  import IPagination = ngApp.components.tables.pagination.models.IPagination;
  import IUserService = ngApp.components.user.services.IUserService;
  import IGDCConfig = ngApp.IGDCConfig;
  import IGDCWindowService = ngApp.core.models.IGDCWindowService;

  export interface IHeading {
    th?: any;
    field?: string;
    title?: string;
    td?(row: any, filter: ngApp.components.ui.string.ICustomFilterService): string;
    sortable?: boolean;
    show?: boolean;
  }

  interface ITableiciousScope extends ng.IScope {
    data: any[];
    headings: IHeading[];
    rowId: string;
    $filter: ngApp.components.ui.string.ICustomFilterService;
    UserService: IUserService;
    LocationService: ILocationService;
    saved: any;
    update: any;
    paging: any;
    page: any;
    tableModelConfig: any;
  }

  class TableiciousController {
    /* 
     *  This controller initializes and updates the <tableicious> element and runs
     *  on ng-table npm module. Works with TableciousSortController to manage tables:
     *    studies, cases, files, & cart
     * 
     *  Receives data, headings, pagination from GDCTable.
     *  Passes headings to TableiciousSortController
    */

    rowId: string;
    data: any;
    page: string;
    paging: IPagination;
    headings: IHeading[];
    tableModelConfig: any; //tableModel from projects,cases,files table.model
    tableParams: any; //ng-table params object

    /* @ngInject */
    constructor(
      private $scope: ITableiciousScope,
      $filter: ngApp.components.ui.string.ICustomFilterService,
      private LocationService: ILocationService,
      UserService: IUserService,
      $window: ng.IWindowService,
      NgTableParams: any,
      ngTableDefaults: any,
      ngTableEventsChannel
      ) {
      $scope.$filter = $filter;
      $scope.UserService = UserService;
      $scope.LocationService = LocationService;

      // Apply $scope properties to the controller even though we are binding them to the controller in the directive
      // access 'bindToController' properties with square brackets ...angularJS is confusing
      this.rowId = this['rowId'];
      this.paging = this['paging'] ? this['paging'] : {total: 20};
      this.page = this['page'];
      this.data = this['data'];
      this.tableModelConfig = this['tableModelConfig'];
      this.headings = this['headings'];

      // Sets default setting for ng-table directive
      ngTableDefaults.settings.counts = []; //this hides ng-table's 'show x entries'
        
      //Initialize ng-table without data.
      this['tableParams'] = new NgTableParams({}, {});

      // Watch for new data. Use 'tc.data' 
      //  1. because is bound to the controller, and 
      //  2. The controller is aliased as 'tc' in the Tableicious directive so this is how $scope labels it
      $scope.$watch("tc.data", (newVal, oldVal) => {
        this.refreshTable();
      });
    }

    refreshTable() {
      // Updates the table with new data, sorting, # of rows to display

      // Set the sorting column. Use from URL if present, else use the default from the config
      var sorting = {};
      var pagination = this.LocationService.pagination();
      var sortString = pagination[this.page] ? pagination[this.page]['sort'] : this.tableModelConfig.defaultSort;

      // Process the sort string. Handles multi-column sorting
      var sortList = sortString.split(",");
      _.forEach(sortList, (sortKeyVal: string) => {
        if (sortKeyVal.length) {
          var kvList = sortKeyVal.split(":");
          sorting[kvList[0]] = kvList[1];
        }
      });

      // Update the table sorting and the number of rows to display
      this.tableParams.parameters({
        count: this['paging'] ? this['paging']['size'] : 20,
        sorting: sorting
      });

      // Assigns new data to ng-table for display
      this.tableParams.settings({
        dataset: this['data']
      });
    }

    getCell(h, d) {
      return h.td(d, this.$scope);
    }

    getTooltipText(h, d) {
      return h.tooltipText ? h.tooltipText(d) : '';
    };
  } // end TableiciousController

  class TableiciousSortController {
    /*
    * This controller manages the headings of the Tableicious table, and 
    * handles the sorting for the table.
    * 
    * Please note the sorting logic within sortByCol() is derived from ng-table's native sorting 
    * function. Overriding the ng-table sorting allows us to query the API only when more than 1 page exists
    * 
    * Receives headings, paging, and ng-table's ngTableParams from TableiciousController 
    * Updates UI via URL updates (LocationService)
    */
    headings: IHeading[];
    tableParams: any;
    paging: IPagination;
    page: any;
    data: any;

    /* @ngInject */
    constructor(
      private $scope: ITableiciousScope,
      private $interpolate: any, 
      private LocationService: ILocationService,
      NgTableParams
      ) {
      $scope.LocationService = LocationService;
      this.headings = $scope.headings;
      this.tableParams = $scope['tableParams'];
      this.page = $scope.page;
      this.paging = $scope.paging;
    
      // Watch for changes in headings. These come from the arrange columns controller
      $scope.$watch("headings", (newVal: IHeading[], oldVal: IHeading[]) => {
        this.headings = newVal;
      }, true);
     
      // Watch for changes in pagination. These come from the paging under the table or from URL changes
      $scope.$watch('paging', (newVal, oldVal) => {
        this.paging = newVal;
      });
    }

    getHeaderCell(h) {
      return h.th ? h.th : h.title;
    }

    sortByCol(heading, event) {
      // Taken from native sortBy function in node_modules/ng-table/src/browser/ngTableSorterRowController.js.
      // Added logic allows us to fetch new data if more than 1 pages of data exist

      // Get the column being sorted on. value = heading.field || false
      var parsedSortable = heading.sortable;
      if (!parsedSortable || typeof parsedSortable !== 'string') {
        // Sorting is disabled for this column
        return;
      }
      else {
        var defaultSort = this.tableParams.defaultSettings.defaultSort;
        var inverseSort = (defaultSort === 'asc' ? 'desc' : 'asc');
        var sorting = this.tableParams.sorting() && this.tableParams.sorting()[parsedSortable] && (this.tableParams.sorting()[parsedSortable] === defaultSort);
        var sortingParams = (event.ctrlKey || event.metaKey) ? this.tableParams.sorting() : {};
        sortingParams[parsedSortable] = (sorting ? inverseSort : defaultSort);

        if (this.paging.pages == 1) { 
          // If only 1 page, there's no need to fetch data. Just update sorting on client side
          this.tableParams.parameters({
            sorting: sortingParams
          });
        } else {
          // Fetch data from API
          this.updateSorting(sortingParams);
        }
      }
    }

    updateSorting(sortingParams) {
      // Update 'sort' parameter in URL. This triggers the page's main components (project/search/cart) to update 
      // themselves and, through parent->child inheritance (blah-blah-blah), update the TableiciousController & 
      // TableiciousSortController 
      var pagination = this.LocationService.pagination();

      // Get paging from URL if present (means user is traversing the table). Use inherited (this.paging) as backup 
      var updatedPaging = !_.isEmpty(pagination[this.page]) ? pagination[this.page] : this.paging;
 
      var sortString = "";
      _.forOwn(sortingParams, (val, key) => {
        sortString += key + ":" + val + ","
      })
      updatedPaging['sort'] = sortString;

      pagination[this.page] = updatedPaging;
      this.$scope.LocationService.setPaging(pagination);
    }
  } // end TableiciousSortController

  interface IGDCTableScope extends ng.IScope {
    heading: string;
    data: any[];
    config: any;
    paging: IPagination;
    page: string;
    sortColumns: any;
    id: string;
    saved: string[];
    clientSide: any; //
  }

  interface IGDCTableController {
    setDisplayedData(newPaging?: any): void;
    sortingHeadings: any[];
    displayedData: any[];
  }

  class GDCTableController implements IGDCTableController {
    sortingHeadings: any[] = [];
    displayedData: any[];
    defaultHeadings: any[] = [];
    displayedHeadings: any[] = [];

    /* @ngInject */
    constructor(private $scope: IGDCTableScope,
                private LocalStorageService: ILocalStorageService) {
      this.displayedHeadings = _.cloneDeep($scope.config['headings']);
      this.defaultHeadings = _.cloneDeep($scope.config['headings']);

      this.sortingHeadings = _.filter(this.displayedHeadings, (heading: any) => {
        return heading && heading['sortable'];
      });

      $scope.$watch("data", () => {
        this.setDisplayedData();
      }, true);

      this.setDisplayedData();
      $scope.saved = this.LocalStorageService.getItem($scope.config['title'] + '-col', []);
    }

    setDisplayedData(newPaging: any = this.$scope.paging) {
      if (this.$scope.clientSide) {
        this.$scope.paging.from = newPaging.from;
        this.$scope.paging.size = newPaging.size;
        this.$scope.paging.pages = Math.ceil(this.$scope.data.length /
                                             this.$scope.paging.size);
        this.$scope.paging.total = this.$scope.data.length;

        // Used to check if files are deleted and the overall count can't reach the page
        // we are on.
        while (this.$scope.paging.from > this.$scope.paging.total) {
          this.$scope.paging.page--;
          this.$scope.paging.from -= this.$scope.paging.size;
        }

        // Safe fallback
        if (this.$scope.paging.page < 0 || this.$scope.paging.from < 1) {
          this.$scope.paging.page = 1;
          this.$scope.paging.from = 1;
        }

        this.displayedData = (<any>_).assign([], this.$scope.data)
                              .splice(this.$scope.paging.from - 1, this.$scope.paging.size);
      } else {
        this.displayedData = this.$scope.data;
      }
      if (this.$scope.paging) {
        this.$scope.paging.count = this.displayedData && this.displayedData.length;
      }
    }
  }

  interface IExportScope extends ng.IScope {
    endpoint: string;
    size: number;
    fields: string[];
    text: string;
    expand: string[];
    downloadInProgress: boolean;

    headings: any;
  }

  interface IExportTableController {
    exportTable(fileType: string, download): void;
  }

  class ExportTableController implements IExportTableController {

    /* @ngInject */
    constructor(private $scope: IExportScope, private LocationService: ILocationService, private config: IGDCConfig,
                private $uibModal: any, private $q: ng.IQService, private Restangular: Restangular.IProvider,
                private $window: ng.IWindowService, private UserService: IUserService, private $timeout: ng.ITimeoutService) {
      $scope.downloadInProgress = false;
    }

    exportTable(fileType: string, download): void {
      var projectsKeys = {
        "files": "cases.project.project_id",
        "cases": "project.project_id",
        "projects": "project_id"
      };

      var filters: Object = this.LocationService.filters();
      var fieldsAndExpand = _.reduce(this.$scope.headings, (result, field) => {
                              if(!(<any>_).get(field, 'hidden', false)) {
                                if((<any>_).get(field, 'children')) {
                                  result.expand.push(field['id']);
                                } else {
                                  result.fields.push(field['id']);
                                }
                              }
                              return result;
                            }, {'fields': [], 'expand': []});
      var url = this.LocationService.getHref();
      var abort = this.$q.defer();
      var modalInstance;

      if (projectsKeys[this.$scope.endpoint]) {
        filters = this.UserService.addMyProjectsFilter(filters, projectsKeys[this.$scope.endpoint]);
      }

      var params = {
        filters: filters,
        fields: fieldsAndExpand.fields.concat(this.$scope.fields || []).join(),
        expand: fieldsAndExpand.expand.concat(this.$scope.expand || []).join(),
        attachment: true,
        format: fileType,
        flatten: true,
        pretty: true,
        size: this.$scope.size
      };

      const inProgress = (state) => (() => { this.$scope.downloadInProgress = state; }).bind(this);

      const checkProgress = download(params, '' + this.config['auth-api'] + '/' + this.$scope.endpoint, (e) => e.parent());
      checkProgress(inProgress(true), inProgress(false));
    }

  }

  class ExportTableModalController {

    /* @ngInject */
    constructor(private $uibModalInstance) {}
    cancel(): void {
      this.$uibModalInstance.close({
        cancel: true
      });
    }
  }

  angular.module("tables.controllers", ["ngTable", "location.services", "user.services", "ngApp.core"])
      .controller("TableiciousController", TableiciousController)
      .controller("TableiciousSortController", TableiciousSortController)
      .controller("GDCTableController", GDCTableController)
      .controller("ExportTableModalController", ExportTableModalController)
      .controller("ExportTableController", ExportTableController);
}
