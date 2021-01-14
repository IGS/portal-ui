module ngApp.participants.services {
  import ICoreService = ngApp.core.services.ICoreService;
  import ILocationService = ngApp.components.location.services.ILocationService;
  import IUserService = ngApp.components.user.services.IUserService;
  import IRootScope = ngApp.IRootScope;

  export interface IParticipantsService {
    getParticipant(id: string, params: Object): ng.IPromise<any>;
    getParticipants(params?: Object, method?: string): ng.IPromise<any>;
  }

  class ParticipantsService implements IParticipantsService {
    private ds: any;
    private searchConfig: any;

    /* @ngInject */
    constructor(Restangular: Restangular.IService, private LocationService: ILocationService,
                private UserService: IUserService, private CoreService: ICoreService,
                private $rootScope: IRootScope, private $q: ng.IQService,
                private config: ngApp.IGDCConfig) {
      this.ds = Restangular.all("samples");
      this.searchConfig = config['search'];
    }

    getParticipant(id: string, params: Object = {}): ng.IPromise<any> {
      if (params.hasOwnProperty("fields")) {
        params["fields"] = params["fields"].join();
      }

      if (params.hasOwnProperty("expand")) {
        params["expand"] = params["expand"].join();
      }

      return this.ds.get(id, params).then((response): any => {
        return response["data"];
      });
    }

    getParticipants(params: Object = {}, method: string = 'GET'): ng.IPromise<any> {
      if (params.hasOwnProperty("fields") && params["fields"] != undefined) {
        params["fields"] = params["fields"].join();
      }

      if (params.hasOwnProperty("expand")) {
        params["expand"] = params["expand"].join();
      }

      if (params.hasOwnProperty("facets")) {
        params["facets"] = params["facets"].join();
      }

      var paging = angular.fromJson(this.LocationService.pagination()["cases"]);

      // Testing is expecting these values in URL, so this is needed.
      paging = paging || {
        size: 20,
        from: 1
      };

      var defaults = {
        size: paging.size || 20,
        from: paging.from || 1,
        // sort: paging.sort || 'sample.id:asc',
        sort: paging.sort || this.searchConfig['cases-table']['default-sort'],
        filters: this.LocationService.filters(),
        comment: this.LocationService.comment(),
        save: this.LocationService.save()
      };

      if (!params.hasOwnProperty("raw")) {
        defaults.filters = this.UserService.addMyProjectsFilter(defaults.filters, "cases.project.project_id");
      }
      this.CoreService.setSearchModelState(false);

      var abort = this.$q.defer();
      if (method === 'POST') {
        var prom: ng.IPromise<any> = this.ds.withHttpConfig({
          timeout: abort.promise
        })
          .post(angular.extend(defaults, params), undefined, { 'Content-Type': 'application/json' }).then((response): any => {
          this.CoreService.setSearchModelState(true);
          return response["data"];
        });
      } else {
        var prom: ng.IPromise<any> = this.ds.withHttpConfig({
          timeout: abort.promise
        })
        .get("", angular.extend(defaults, params)).then((response): any => {
          this.CoreService.setSearchModelState(true);
          return response["data"];
        });
      }

      var eventCancel = this.$rootScope.$on("gdc-cancel-request", () => {
        abort.resolve();
        eventCancel();
        this.CoreService.setSearchModelState(true);
      });

      return prom;
    }
  }

  angular
      .module("participants.services", ["restangular", "components.location", "user.services", "core.services"])
      .service("ParticipantsService", ParticipantsService);
}
