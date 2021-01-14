module ngApp.components.location.services {

  export interface ILocationService {
    path(): string;
    search(): any;
    setSearch(search: Object): any;
    clear(): any;
    filters(): any;
    setFilters(filters: Object): any;
    save(): string;
    comment(): string;
    query(): string;
    setQuery(query?: string): any;
    pagination(): any;
    setPaging(pagination: Object): any;
    setHref(href: string): void;
    getHref(): string;
    filter2query(f: Object): string;
  }

  class LocationService implements ILocationService {
    /* @ngInject */
    constructor(
      private $location: ng.ILocationService,
      private $window: ngApp.core.models.IGDCWindowService
    ) {}

    path(): string {
      return this.$location.path();
    }

    search(): ISearch {
      return this.$location.search();
    }

    setSearch(search: ISearch): ng.ILocationService {
      var propsWithValues = _.pickBy(search, function(v) {
        return !_.isEmpty(v) && v !== "{}"
      });
      return this.$location.search(propsWithValues);
    }

    clear(): ng.ILocationService {
      return this.$location.search({});
    }

    filters(): IFilters {
      // TODO error handling
      var f = this.search().filters;
      return f ? angular.fromJson(f) : {};
    }

    setFilters(filters: IFilters): ng.ILocationService {
      var search: ISearch = this.search();
      if (filters) {
        search.filters = angular.toJson(filters);
      } else {
        delete search.filters;
      }

      //move the user back to pg1
      var paging = this.pagination();
      if (paging) {
        _.forEach(paging, (page) => {
          page['from'] = 0;
        });
        search['pagination'] = angular.toJson(paging);
      }
      return this.setSearch(search);
    }

    save(): string {
      // TODO error handling
      var s = this.search().save;
      return s ? s : "";
    }

    comment(): string {
      // TODO error handling
      var c = this.search().comment;
      return c ? c : "";
    }

    query(): string {
      // TODO error handling
      var q = this.search().query;
      return q ? q : "";
    }

    setQuery(query?: string): ng.ILocationService {
      var search: ISearch = this.search();
      if (query) {
        search.query = query;
      } else {
        delete search.query;
      }
      return this.setSearch(search);
    }

    pagination(): any {
      var f = (<any>_).get(this.search(), "pagination", "{}");
      return angular.fromJson(f);
    }

    setPaging(pagination: {[key: string]: string}): ng.ILocationService {
      var search: ISearch = this.search();

      if (pagination) {
        search.pagination = angular.toJson(pagination);
      } else if (_.isEmpty(search.pagination)) {
        delete search.pagination;
      }

      return this.setSearch(search);
    }

    setHref(href: string): void {
      this.$window.location.href = href;
    }

    getHref(): string {
      return this.$window.location.href;
    }

    filter2query(f: IFilters): string {
      var q: string[] = _.map(f.content, (ftr: IFilter) => {
        var c: IFilterValue = ftr.content;
        var o = ftr.op;
        var v = ftr.op === "in" ? angular.toJson(c.value) : c.value
        return [c.field, o, v].join(" ");
      });

      return q.join(" and ");
    }

  }

  angular
      .module("location.services", [])
      .service("LocationService", LocationService);
}
