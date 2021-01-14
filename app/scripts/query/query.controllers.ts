module ngApp.query.controllers {
  import IFacet = ngApp.core.models.IFacet;
  import IFilesService = ngApp.files.services.IFilesService;
  import IParticipantsService = ngApp.participants.services.IParticipantsService;
  import ICoreService = ngApp.core.services.ICoreService;
  import IQueryState = ngApp.query.services.IQueryState;
  import ICartService = ngApp.cart.services.ICartService;
  import ILocationService = ngApp.components.location.services.ILocationService;
  import IUserService = ngApp.components.user.services.IUserService;
  import ISearchService = ngApp.search.services.ISearchService;
  import TableiciousConfig = ngApp.components.tables.directives.tableicious.TableiciousConfig;

  export interface IQueryController {
    files: any;
    participants: any;
    QState: IQueryState;
    CartService: ICartService;
    addFilesKeyPress(event: any, type: string): void;
    setState(tab: string, next: string): void;
    select(section: string, tab: string): void;
    removeFiles(files: any[]): void;
    isUserProject(file: any): boolean;
    tabSwitch: boolean;
    query: string;
    projectIdChartConfig: any;
    primarySiteChartConfig: any;
  }

  interface IQueryScope extends ng.IScope {
    fileTableConfig:TableiciousConfig;
    participantTableConfig:TableiciousConfig;
  }

  class QueryController implements IQueryController {
    files: any;
    participants: any;
    participantsLoading: boolean = true;
    filesLoading: boolean = true;
    query: string = "";
    tabSwitch: boolean = false;
    projectIdChartConfig: any;
    primarySiteChartConfig: any;
    chartConfigs: any;
    summary: any;
    queryConfig: any;

    /* @ngInject */
    constructor(private $scope: IQueryScope,
                private $rootScope: IRootScope,
                private $state: ng.ui.IStateService,
                public QState: IQueryState,
                public CartService: ICartService,
                public SearchService: ISearchService,
                public FilesService: IFilesService,
                public ParticipantsService: IParticipantsService,
                private LocationService: ILocationService,
                private UserService: IUserService,
                private CoreService: ICoreService,
                private SearchFilesTableService: TableiciousConfig,
                private SearchCasesTableService: TableiciousConfig,
                SearchChartConfigs) {
      var data = $state.current.data || {};
      this.QState.setActive(data.tab, "active");
      CoreService.setPageTitle("Query");

      $scope.$on("$locationChangeSuccess", (event, next: string) => {
        if (next.indexOf("query") !== -1) {
          this.refresh();
        }
      });
      $scope.$on("gdc-user-reset", () => {
        this.refresh();
      });

      $scope.$on("$stateChangeSuccess", (event, toState: any, toParams: any, fromState: any) => {
        if (fromState.name.indexOf("query") === -1) {
          document.body.scrollTop = 0;
          document.documentElement.scrollTop = 0;
        }
      });

      //TODO Currently gets 'search' configuration (NOTE ONLY PIE CHARTS ARE IMPLEMENTED)
      this.queryConfig = this.CoreService.getComponentFromConfig("search");
      $scope.participantTableConfig = this.SearchCasesTableService.model(this.queryConfig);

	  var cartTable = false;
      $scope.fileTableConfig = this.SearchFilesTableService.model(cartTable);
      
      this.refresh();
      this.chartConfigs = SearchChartConfigs;

      // Create placeholders for charts to allow spinners to display
      // Essentially we're setting buckets to an empty array to trigger the spinners, and also passing piechart config settings now
      this.summary = { 'charts': this.SearchService.createChartPlaceholders(SearchChartConfigs) };
    }

    refresh() {
      if (this.tabSwitch) {
        if (this.QState.tabs.participants.active) {
          this.QState.setActive("participants", "hasLoadedOnce");
        }

        if (this.QState.tabs.files.active) {
          this.QState.setActive("files", "hasLoadedOnce");
        }
        this.tabSwitch = false;
        return;
      }

      this.$rootScope.$emit('ShowLoadingScreen');
      this.participantsLoading = true;
      this.filesLoading = true;

      this.SearchService.getSummary().then((data) => {
        
        // Add chartConfigs to summaries
        for (var i = 0, len = data['charts'].length; i < len; i++) {
          var chart_name = 'chart' + String(i)
          data['charts'][i]['piechart-config'] = this.chartConfigs[chart_name];
          data['charts'][i]['results-status'] = 'complete'; 
        }
        this.summary = data;
      });

      var casesTableModel = this.SearchCasesTableService.model(this.queryConfig);

	  var cartTable = false;
      var fileOptions = {
        fields: this.SearchFilesTableService.model(cartTable).fields
      };


      var participantOptions = {
        fields: casesTableModel.fields,
        expand: casesTableModel.expand,
      };

      this.FilesService.getFiles(fileOptions).then((data: any) => {
        this.filesLoading = false;

        if (!this.participantsLoading && !this.filesLoading) {
          this.$rootScope.$emit('ClearLoadingScreen');
        }

        // this.files = this.files || {};
        this.files = this.files || data; //NOTE: fixes semantic error from line above
        this.files.aggregations = data.aggregations;
        this.files.pagination = data.pagination;

        if (!_.isEqual(this.files.hits, data.hits)) {
          this.files.hits = data.hits;
          this.tabSwitch = false;
          if (this.QState.tabs.files.active) {
            this.QState.setActive("files", "hasLoadedOnce");
          }

          for (var i = 0; i < this.files.hits.length; i++) {
            this.files.hits[i].related_ids = _.map(this.files.hits[i].related_files, "file_id");
          }
        }
      });

      this.ParticipantsService.getParticipants(participantOptions).then((data: any) => {
        this.participantsLoading = false;

        if (!this.participantsLoading && !this.filesLoading) {
          this.$rootScope.$emit('ClearLoadingScreen');
        }

        // this.participants = this.participants || {};
        this.participants = this.participants || data; //NOTE: fixes semantic error from line above
        this.participants.aggregations = data.aggregations;
        this.participants.pagination = data.pagination

        if (!_.isEqual(this.participants.hits, data.hits)) {
          this.participants.hits = data.hits;
          this.tabSwitch = false;
          if (this.QState.tabs.participants.active) {
            this.QState.setActive("participants", "hasLoadedOnce");
          }
        }
      });
    }

    // TODO Load data lazily based on active tab
    setState(tab: string) {
      // Changing tabs and then navigating to another page
      // will cause this to fire.
      if (tab && (this.$state.current.name.match("query."))) {
        this.tabSwitch = true;
        this.$state.go('query.' + tab, this.LocationService.search(), {inherit: false});
      }
    }

    isUserProject(file: any): boolean {
      return this.UserService.isUserProject(file);
    }


    select(tab: string) {
      this.QState.setActive(tab, "active");
      this.setState(tab);
    }

    addFilesKeyPress(event: any, type: string) {
      if (event.which === 13) {
        if (type === "all") {
          // TODO add filtered list of files
          this.CartService.addFiles(this.files.hits);
        } else {
          this.CartService.addFiles(this.files.hits);
        }
      }
    }

    addToCart(files: any[]): void {
      this.CartService.addFiles(files);
    }

    removeFiles(files: any[]): void {
      this.CartService.remove(files);
    }
  }
  angular
      .module("query.controller", [
        "query.services",
        "search.services",
        "location.services",
        "cart.services",
        "core.services",
        "participants.services",
        "search.files.table.service",
        "search.cases.table.service",
        "files.services"
      ])
      .controller("QueryController", QueryController);
}
