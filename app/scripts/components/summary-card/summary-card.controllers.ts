module ngApp.components.summaryCard.controllers {

  import IFacetService = ngApp.components.facets.services.IFacetService;
  import ILocationService = ngApp.components.location.services.ILocationService;
  import ILocationFilters = ngApp.components.location.IFilters; //NOTE added to resolve TS errors

  interface ISummaryCardController {
    addFilters(item: any): void;
    clearFilters(): void;
  }

  class SummaryCardController implements ISummaryCardController {

    /* @ngInject */
    constructor(
      private $scope,
      private LocationService: ILocationService,
      private FacetService: IFacetService
    ) {}

    addFilters(item: any) {
      var config = this.$scope.config;
      var filters = this.FacetService.ensurePath(this.LocationService.filters());

      if (!config.filters ||
        (!config.filters[item[config['display-key']]] && !config.filters.default)) {
        return;
      }

      var params = config.filters[item[config['display-key']]]
        ? config.filters[item[config['display-key']]].params
        : { filters: config.filters.default.params.filters(item[config['display-key']]) };

      var newFilter = JSON.parse(params.filters).content[0]; // there is always just one

      filters.content = (filters.content || []).some(filter => _.isEqual(filter, newFilter))
        ? filters.content
        : filters.content.concat(newFilter);

      if (this.LocationService.path().indexOf('/projects') === 0 && filters.content.length) {
        this.LocationService.setHref("search/s?filters=" + angular.toJson(filters));
      } else {
          this.LocationService.setFilters(filters.content.length ? filters : null);
          
      }
    }

    clearFilters(): void {
      var filters: ILocationFilters = this.LocationService.filters();

      filters.content = _.reject(filters.content, (filter) => {
        return filter.content.field === this.$scope.config['filter-key'];
      });

      if (filters.content.length) {
        this.LocationService.setFilters(filters);
        return;
      }

      this.LocationService.clear();
    }
  }

  angular
      .module("summaryCard.controller", [
        "location.services"
      ])
      .controller("SummaryCardController", SummaryCardController);
}
