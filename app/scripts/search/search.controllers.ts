module ngApp.search.controllers {
  import IFacet = ngApp.core.models.IFacet;
  import IFilesService = ngApp.files.services.IFilesService;
  import IParticipantsService = ngApp.participants.services.IParticipantsService;
  import ICoreService = ngApp.core.services.ICoreService;
  import ICartService = ngApp.cart.services.ICartService;
  import ILocationService = ngApp.components.location.services.ILocationService;
  import IUserService = ngApp.components.user.services.IUserService;
  import ISearchService = ngApp.search.services.ISearchService;
  import ISearchState = ngApp.search.services.ISearchState;
  import TableiciousConfig = ngApp.components.tables.directives.tableicious.TableiciousConfig;
  import IFacetsConfigService = ngApp.components.facets.services.IFacetsConfigService;

  export interface ISearchController {
    files: any;
    participants: any;
    summary: any;
    SearchState: ISearchState;
    CartService: ICartService;
    addFilesKeyPress(event: any, type: string): void;
    setState(tab: string, next: string): void;
    select(section: string, tab: string): void;
    removeFiles(files: any[]): void;
    tabSwitch: boolean;
    projectIdChartConfig: any;
    primarySiteChartConfig: any;
    SearchCasesModel: any;
    SearchFilesModel: any;
    chartConfigs: any;
  }

  interface ISearchScope extends ng.IScope {
    fileTableConfig:TableiciousConfig;
    participantTableConfig:TableiciousConfig;
  }

  class SearchController implements ISearchController {
    files: any;
    participants: any;
    participantsLoading: boolean = true;
    filesLoading: boolean = true;
    summary: any;
    tabSwitch: boolean = false;
    projectIdChartConfig: any;
    primarySiteChartConfig: any;
    facetsCollapsed: boolean = false;
    firstLoad: boolean = true;
    facetTab: number;
    SearchCasesModel: any;
    SearchFilesModel: any;
    chartConfigs: any;
    searchConfig: any; //will hold custom configuration for 'search'

    /* @ngInject */
    constructor(
      private $scope: ISearchScope,
      private $rootScope: IRootScope,
      private $state: ng.ui.IStateService,
      private $stateParams,
      private $location,
      public SearchState: ISearchState,
      public CartService: ICartService,
      public SearchService: ISearchService,
      public FilesService: IFilesService,
      public ParticipantsService: IParticipantsService,
      private LocationService: ILocationService,
      private UserService: IUserService,
      public CoreService: ICoreService,
      public SearchCasesTableService: TableiciousConfig,
      public SearchFilesTableService: TableiciousConfig,
      private FacetsConfigService: IFacetsConfigService,
      public FacetService,
      SearchChartConfigs
    ) {

      // ui-bootstrap calls the tab select callback on page load
      // and we don't want that, so we're using a flag to track the first load
      this.firstLoad = true;

      if (!this.$stateParams.facetTab) {
        this.$location.search(`facetTab`, `cases`);
      }

      this.facetTab = this.$stateParams.facetTab === `files` ? 1 : 0;

      var data = $state.current.data || {};
      this.SearchState.setActive("tabs", data.tab, "active");
      this.SearchState.setActive("facets", data.tab, "active");

      $scope.$on("$locationChangeSuccess", (event, next: string) => {
        if (next.indexOf("search") !== -1) {
          this.refresh();
        }
      });

      $scope.$on("$stateChangeSuccess", (event, toState: any, toParams: any, fromState: any) => {
        if (toState.name.indexOf("search") !== -1) {
          this.SearchState.setActive("tabs", toState.name.split(".")[1], "active");
        }
        if (fromState.name.indexOf("search") === -1) {
          document.body.scrollTop = 0;
          document.documentElement.scrollTop = 0;
        }
      });

      $scope.$on("gdc-user-reset", () => {
        this.refresh();
      });

      this.searchConfig = this.CoreService.getComponentFromConfig("search");
      this.CoreService.setPageTitle(this.searchConfig['page-title']);
      this.SearchCasesModel = this.SearchCasesTableService.model();
      var cartTable = false;
      this.SearchFilesModel = this.SearchFilesTableService.model(cartTable);

      $scope.fileTableConfig = this.SearchFilesModel;
      $scope.participantTableConfig = this.SearchCasesModel;
      
      this.FacetsConfigService.setFields('files', this.SearchFilesModel.facets);
      this.FacetsConfigService.setFields('cases', this.SearchCasesModel.facets);
      this.refresh();
      this.chartConfigs = SearchChartConfigs; //NOTE: SearchChartConfigs now creates pie chartConfigs from custom config.

      // Create placeholders for charts to allow spinners to display
      // Essentially we're setting buckets to an empty array to trigger the spinners, and also passing piechart config settings now
      this.summary = { 'charts': this.SearchService.createChartPlaceholders(SearchChartConfigs) };
    } //end SearchController constructor
    
    refresh() {
      if (this.tabSwitch) {
        if (this.SearchState.tabs.participants.active) {
          this.SearchState.setActive("tabs", "participants", "hasLoadedOnce");
        }

        if (this.SearchState.tabs.files.active) {
          this.SearchState.setActive("tabs", "files", "hasLoadedOnce");
        }
        this.tabSwitch = false;
        return;
      }
      const casesTableModel = this.SearchCasesModel;
      const filesTableModel = this.SearchFilesModel;

      this.$rootScope.$emit('ShowLoadingScreen');
      this.filesLoading = true;
      this.participantsLoading = true;

      // Get pie chart summaries
      this.SearchService.getSummary().then((data) => {
        // Add chartConfigs to summaries
        for (var i=0, len=data['charts'].length; i<len; i++){
          var chart_name = 'chart' + String(i)
          data['charts'][i]['piechart-config'] = this.chartConfigs[chart_name];
          data['charts'][i]['results-status'] = 'complete';
        }
        
        this.summary = data;
        this.tabSwitch = false;
      });

      var fileOptions = {
        fields: filesTableModel.fields,
        expand: filesTableModel.expand,
        facets: this.FacetService.filterFacets(this.FacetsConfigService.fieldsMap['files'])
      };

      var participantOptions = {
        fields: casesTableModel.fields,
        expand: casesTableModel.expand,
        facets: this.FacetService.filterFacets(this.FacetsConfigService.fieldsMap['cases'])
      };
      
      this.FilesService.getFiles(fileOptions).then((data: any) => {
        this.filesLoading = false;

        if (!this.participantsLoading && !this.filesLoading) {
          this.$rootScope.$emit('ClearLoadingScreen');
        }

        this.files = this.files || data;
        this.files.aggregations = data.aggregations;
        this.files.pagination = data.pagination;

        if (!_.isEqual(this.files.hits, data.hits)) {
          this.files.hits = data.hits;
          this.tabSwitch = false;
          if (this.SearchState.tabs.files.active) {
            this.SearchState.setActive("tabs", "files", "hasLoadedOnce");
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

        this.participants = this.participants || data; 
        this.participants.aggregations = data.aggregations;        
        this.participants.pagination = data.pagination;

        if (!_.isEqual(this.participants.hits, data.hits)) {
          this.participants.hits = data.hits;
          this.tabSwitch = false;
          if (this.SearchState.tabs.participants.active) {
            this.SearchState.setActive("tabs", "participants", "hasLoadedOnce");
          }
        }
      });
    }

    setFacetTab(tab: string) {
      // only change tab if user selects, not when the controller boots up
      if (!this.firstLoad) {
        this.$location.search(`facetTab`, tab);
      } else {
        this.firstLoad = false;
      }
    }

    setState(tab: string) {
      // Changing tabs and then navigating to another page
      // will cause this to fire.
      if (tab && (this.$state.current.name.match("search."))) {
        this.tabSwitch = true;
        this.$state.go("search." + tab, this.LocationService.search(), {inherit: false});
      }
    }

    select(section: string, tab: string) {
      this.SearchState.setActive(section, tab, "active");
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

    gotoQuery() {
      var stateParams = {};
      var f = this.LocationService.filters();
      var q = this.LocationService.filter2query(f);
      var toTab = this.$state.current.name.split(".")[1];

      if (q) {
        stateParams = {
          query: q,
          filters: angular.toJson(f)
        };
      }

      this.$state.go("query." + toTab, stateParams, { inherit: true });
    }

    toggleFacets(shouldCollapse) {
      this.facetsCollapsed = shouldCollapse;
      this.$rootScope.$emit("toggleFacets");
    }

  }

  angular
      .module("search.controller", [
        "search.services",
        "location.services",
        "cart.services",
        "core.services",
        "participants.services",
        "search.files.table.service",
        "search.cases.table.service",
        "files.services",
        "facets.services"
      ])
      .controller("SearchController", SearchController);
}
