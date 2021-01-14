module ngApp.cart.controllers {
  import ICartService = ngApp.cart.services.ICartService;
  import ICoreService = ngApp.core.services.ICoreService;
  import IUserService = ngApp.components.user.services.IUserService;
  import ISearchService = ngApp.search.services.ISearchService;
  import IParticipantsService = ngApp.participants.services.IParticipantsService;
  import IFilesService = ngApp.files.services.IFilesService;
  import TableiciousConfig = ngApp.components.tables.directives.tableicious.TableiciousConfig;
  
  import ILocationService = ngApp.components.location.services.ILocationService;

  export interface ICartController {
    files: any;
    getTotalSize(): number;
    getFileIds(): string[];
    getRelatedFileIds(): string[];
    cartTableConfig: any;
    fileCountChartData: any[];
  }

  class CartController implements ICartController {
    displayedFiles: any;
    numberFilesGraph: any;
    sizeFilesGraph: any;
    cartTableConfig: any;
    fileCountChartData: Object[];
    helpHidden: boolean = false;
    // participantCount: number;

    lastModified: any;
    clinicalDataExportFilters: any;
    biospecimenDataExportFilters: any;
    clinicalDataExportExpands: Object[];
    clinicalDataExportFileName: string;
    biospecimenDataExportExpands: Object[];
    biospecimenDataExportFileName: string;
    summary: any;
    cartConfig: any;

    defaultFiles: any = {
      hits: [],
      pagination: {
        count: 0,
        total: 0,
        size: 0,
        from: 0,
        page: 0,
        pages: 0,
        sort: '',
      }
    };

    /* @ngInject */
    constructor(private $scope: ng.IScope,
                private $state: ng.ui.IStateService,
                private $filter: ng.IFilterService,
                public files: any,
                private CoreService: ICoreService,
                private CartService: ICartService,
                private UserService: IUserService,
                public SearchFilesTableService: TableiciousConfig,
                private Restangular,
                private SearchService: ISearchService,
                private FilesService: IFilesService,
                private ParticipantsService: IParticipantsService,
                private CartState,
                private config, 
                SearchChartConfigs) {
      this.cartConfig = this.CoreService.getComponentFromConfig('cart');

      var data = $state.current.data || {};
      this.CartState.setActive("tabs", data.tab);
      this.lastModified = this.CartService.lastModified;
      var cartTable = true;
      this.cartTableConfig = this.SearchFilesTableService.model(cartTable);
      this.cartTableConfig['title'] = 'Cart'; //changes 'Files' to 'Cart'. Allowing for cart table to have its own arrangement saved in cookie

      this.CartService.reloadFromLocalStorage();
      this.refresh();

      // Create placeholders for charts to allow spinners to display
      // Essentially we're setting buckets to an empty array to trigger the spinners, and also passing piechart config settings now
      var chartPlaceholders = this.SearchService.createChartPlaceholders(SearchChartConfigs);

      // Remove the charts that are not used by the cart
      var cartChartPlaceholders = _.remove(chartPlaceholders, (chart) => this.cartConfig['piechart-order'].indexOf(chart['name']) != -1);

      this.summary = {'charts': cartChartPlaceholders};

      $scope.$on("$locationChangeSuccess", (event, next: string) => {
        if (next.indexOf("cart") !== -1) {
          this.refresh();
        }
      });

      $scope.$on("cart-update", (event) => {
          this.refresh();
      });

      $scope.$on("gdc-user-reset", () => {
        this.refresh();
      });

      this.clinicalDataExportFilters = this.biospecimenDataExportFilters = {
        'file.id': this.CartService.getFileIds()
      };
      this.clinicalDataExportExpands = ['demographic', 'diagnoses', 'family_histories', 'exposures'];
      this.clinicalDataExportFileName = 'clinical.cart';

      this.biospecimenDataExportExpands =
        ['samples','samples.portions','samples.portions.analytes','samples.portions.analytes.aliquots',
        'samples.portions.analytes.aliquots.annotations','samples.portions.analytes.annotations',
        'samples.portions.submitter_id','samples.portions.slides','samples.portions.annotations',
        'samples.portions.center'];
      this.biospecimenDataExportFileName = 'biospecimen.cart';
    }

    getSummary() {
      var filters = {
        op: "and",
        content: [
          {
            op: "in",
            content: {
              field: "file.id",
              value: this.CartService.getFileIds()
            }
          }
        ]
      };

      this.SearchService.getSummary(filters, true).then((data) => {

        //Only keep the piecharts we're interested in
        data.charts = _.filter(data.charts, chart => _.includes(this.cartConfig['piechart-order'], chart['name']));

        // Add chartConfigs to summaries
        for (var i = 0, len = data.charts.length; i < len; i++) {
          data['charts'][i]['piechart-config'] = this.cartConfig['piechart-configs'][i];
          data['charts'][i]['piechart-config']["text-value"] = "file_size";
          data['charts'][i]['piechart-config']["text-filter"] = "size";
          data['charts'][i]['piechart-config']["label"] = "file";
          data['charts'][i]['piechart-config']["sort-key"] = "doc_count";
          data['charts'][i]['piechart-config']["display-key"] = "key";
          data['charts'][i]['piechart-config']["sort-data"] = true;
          data['charts'][i]['results-status'] = "complete";
        }

        this.summary = data;
      });

      var UserService = this.UserService;
      var authCountAndFileSizes = _.reduce(this.CartService.getFiles(), (result, file) => {
        var canDownloadKey = UserService.userCanDownloadFile(file) ? 'authorized' : 'unauthorized';
        result[canDownloadKey].count += 1;
        result[canDownloadKey].file_size += file.file_size;
        return result;
      }, { 'authorized': { 'count': 0, 'file_size': 0 }, 'unauthorized': {'count': 0, 'file_size': 0 } });

      this.fileCountChartData = _.filter([
        {
          key: 'authorized',
          doc_count: authCountAndFileSizes.authorized.count || 0,
          file_size: authCountAndFileSizes.authorized.file_size
        },
        {
          key: 'unauthorized',
          doc_count: authCountAndFileSizes.unauthorized.count || 0,
          file_size: authCountAndFileSizes.unauthorized.file_size
        }
      ], (i) => i.doc_count);
    }

    refresh(): void {
      const fileIds = this.CartService.getFileIds();
      var pageTitle = "";
      if (this.cartConfig['page-title'].indexOf("|") != -1 ) {
        pageTitle = this.cartConfig['page-title'].split("|")[0] + " (" + fileIds.length + ") | " + this.cartConfig['page-title'].split("|")[1];
      } else {
        pageTitle = this.cartConfig['page-title'] + " (" + fileIds.length + ")";
      }

      this.CoreService.setPageTitle(pageTitle);
      // in the event that our cart is empty
      if (fileIds.length < 1) {
        this.files = {'hits': [], 'pagination': {}}; 
        return;
      }
      var filters = {'content': [{'content': {'field': 'file.id', 'value': fileIds}, 'op': 'in'}], 'op': 'and'};
      // TODO: important: this needs to be cleaned up
      var fileOptions = {
        filters: filters,
        fields: [
          'access',
          'file_name',
          'file_id',
          'data_type',
          'data_format',
          'file_size',
          'annotations.annotation_id',
          'cases.case_id',
          'cases.project.project_id',
          'cases.project.name'
        ],
      };
      this.FilesService.getFiles(fileOptions, 'POST').then((data: any) => {
        this.files = this.files || {'hits': [], 'pagination': {}};
        if (!_.isEqual(this.files.hits, data.hits)) {
          this.files = data;
          // DOLLEY - Removed this because 'data' has always been undefined and given an error in the browser console
          // This also looks like it is not used. Removing it allows for pagination on the cart table to work. Leaving it for now.
          // this.ParticipantsService.getParticipants({filters: filters, size: 0}, 'POST')
          //   .then((data: any) => {
          //     console.log('participants data: ', data);
          //     this.participantCount = data.pagination.total;
          //   });
        }
      }).finally(() => this.getSummary());
    }

    getTotalSize(): number {
      return _.reduce(this.files.hits, function (sum: number, hit: any) { //NOTE: Resolved TS error. added '.hits'
        return sum + hit.file_size;
      }, 0);
    }

    getFileIds(): string[] {
      return _.map(this.files.hits, "file_id"); //NOTE: Resolved TS error. added '.hits'
    }

    getRelatedFileIds(): string[] {
      return _.reduce(this.files.hits, function (ids, file) { //NOTE: Resolved TS error. added '.hits'
        return ids.concat(file.related_ids);
      }, []);
    }

    removeAll() {
      // edge case where there is only 1 file in the cart,
      // need to pass the file to CartService.remove because CartService
      // does not store file names and the file name is displayed in
      // remove notification
      if (this.files.pagination.count === 1) {
        this.CartService.remove(this.files.hits);
      } else {
        this.CartService.removeAll();
      }
      this.lastModified = this.CartService.lastModified;
      // this.files = {};
      this.files = {'hits': [], 'pagination': {}};
    }

    getManifest(selectedOnly: boolean = false) {
      this.FilesService.downloadManifest(_.map(this.CartService.getFiles(), "file_id"), (complete) => {
        if(complete) {
          return true;
        }
      });
    }

  }

  class LoginToDownloadController {
    /* @ngInject */
    constructor (private $uibModalInstance) {}

    cancel() :void {
      this.$uibModalInstance.close(false);
    }

    goAuth() :void {
      this.$uibModalInstance.close(true);
    }
  }

  class AddToCartSingleCtrl {
    /* @ngInject */
    constructor(private CartService: ICartService) {}

    addToCart(file: any): void {
      if (this.CartService.getCartVacancySize() < 1) {
        this.CartService.sizeWarning();
        return;
      }
      this.CartService.addFiles([this['file']], true);
    }

    removeFromCart(file: any): void {
      this.CartService.remove([this['file']]);
    }
  }

  class AddToCartAllCtrl {
    /* @ngInject */
    constructor(
      private CartService: ICartService, 
      private UserService: IUserService,
      public LocationService: ILocationService,
      public FilesService: IFilesService,
      public $timeout: ng.ITimeoutService,
      public notify: INotifyService
    ) {
      this.CartService = CartService;
    }

    removeAll(): void {
      // Query ES using the current filter and the file uuids in the Cart
      // If an id is in the result, then it is both in the Cart and in the current Search query
      // var filters = this.filter || this.LocationService.filters();
      var filters = this['filter'] || this.LocationService.filters(); //NOTE: Resolved TS error
      var size: number = this.CartService.getFiles().length;

      if (!filters.content) {
        filters.op = "and";
        filters.content = [];
      }

      filters.content.push({
        content: {
          field: "file.id",
          value: _.map(this.CartService.getFiles(), "id")
        },
        op: "in"
      });

      this.FilesService.getFiles({
        fields: [ "id", "file_name" ],
        filters: filters,
        size: size,
        from: 0
      }, 'POST').then((data) => {
        this.CartService.remove(data.hits);
      });
    }

    getFiles() {
      // var filters = (this.filter ? JSON.parse(this.filter) : undefined) || this.LocationService.filters();
      var filters = (this['filter'] ? JSON.parse(this['filter']) : undefined) || this.LocationService.filters(); //NOTE Resolved TS error
      filters = this.UserService.addMyProjectsFilter(filters, "cases.project.project_id");

      return this.FilesService.getFiles({
        fields: [
          "access",
          "file_id",
          "file_size",
          "cases.project.project_id",
        ],
        filters: filters,
        sort: "",
        // size: this.size,
        size: this['size'], //NOTE: Resolved TS error
        from: 0
      });
    }

    addAll(files = []): void {
      if (files.length) {
        if (files.length > this.CartService.getCartVacancySize()) {
          this.CartService.sizeWarning();
        } else {
          this.CartService.addFiles(files, false);
        }
      } else {
        // if (this.size > this.CartService.getCartVacancySize()) {
        if (this['size'] > this.CartService.getCartVacancySize()) { //NOTE: Resolved TS error
          this.CartService.sizeWarning();
        } else {

          var addingMsgPromise = this.$timeout(() => {
            this.notify({
              message: "",
              // messageTemplate: "<span data-translate>Adding <strong>" + this.size + "</strong> files to cart</span>",
              messageTemplate: "<span data-translate>Adding <strong>" + this['size'] + "</strong> files to cart</span>", //NOTE: Resolved TS error
              container: "#notification",
              classes: "alert-info"
            });
          }, 1000);

          this.getFiles().then(data => {
            this.CartService.addFiles(data.hits, false);
            this.$timeout.cancel(addingMsgPromise);
          }).catch(e => console.log(e));
        }
      }
    }
  }

  angular
      .module("cart.controller", [
        "cart.services",
        "core.services",
        "user.services",
        "search.files.table.service",
        "search.services"
      ])
      .controller("LoginToDownloadController", LoginToDownloadController )
      .controller("AddToCartAllCtrl", AddToCartAllCtrl)
      .controller("AddToCartSingleCtrl", AddToCartSingleCtrl)
      .controller("CartController", CartController);
}
