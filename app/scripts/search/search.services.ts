module ngApp.search.services {

  import ILocationService = ngApp.components.location.services.ILocationService;

  export interface ITab {
    active: boolean;
  }

  export interface ITabs {
    participants: ITab;
    files: ITab;
  }

  export interface ISearchState {
    tabs: ITabs;
    facets: ITabs;
    setActive(section: string, tab: string, key: string): void;
  }

  class State implements ISearchState {
    tabs: ITabs = {
      summary: {
        active: false,
        hasLoadedOnce: false
      },
      participants: {
        active: false,
        hasLoadedOnce: false
      },
      files: {
        active: false,
        hasLoadedOnce: false
      }
    };
    facets: ITabs = {
      participants: {
        active: false
      },
      files: {
        active: false
      }
    };

    setActive(section: string, tab: string, key: string) {
      if (section && tab) {
        if (key === "active") {
          _.each(this[section], function (section: ITab) {
            section.active = false;
          });

          if (!(section === "facets" && tab==="summary")) {
            this[section][tab].active = true;
          }
        } else {
          this[section][tab].hasLoadedOnce = true;
        }

      }
    }
  }


  export interface ISearchService {
    getSummary(filters?: Object): ng.IPromise<any>;
  }

  class SearchService implements ISearchService {

    /* @ngInject */
    constructor(private Restangular: restangular.IService, private LocationService: ILocationService) {
    }

    getSummary(filters: Object = this.LocationService.filters()) {
      return this.Restangular.all("ui/search/summary")
      .post({ filters: filters }, undefined, { 'Content-Type': 'application/json' })
      .then((response) => {
        return response;
      });
    }
  }

  angular
      .module("search.services", [])
      .service("SearchState", State)
      .service("SearchService", SearchService);
}
