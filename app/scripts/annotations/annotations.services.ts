module ngApp.annotations.services {
  import ILocationService = ngApp.components.location.services.ILocationService;
  import ICoreService = ngApp.core.services.ICoreService;
  import IRootScope = ngApp.IRootScope;
  import IUserService = ngApp.components.user.services.IUserService;

  export interface IAnnotationsService {
    getAnnotation(id: string, params?: Object): ng.IPromise<any>;
    getAnnotations(params?: Object): ng.IPromise<any>;
  }

  class AnnotationsService implements IAnnotationsService {
    private ds: any;

    /* @ngInject */
    constructor(Restangular: Restangular.IService, private LocationService: ILocationService,
                private CoreService: ICoreService, private $rootScope: IRootScope,
                private $q: ng.IQService, private UserService: IUserService) {
      this.ds = Restangular.all("annotations");
    }

    getAnnotation(id: string, params: Object = {}): ng.IPromise<any> {
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

    getAnnotations(params: Object = {}): ng.IPromise<any> {
      if (params.hasOwnProperty("fields")) {
        params["fields"] = params["fields"].join();
      }

      if (params.hasOwnProperty("facets")) {
        params["facets"] = params["facets"].join();
      }

      if (params.hasOwnProperty("expand")) {
        params["expand"] = params["expand"].join();
      }

      var paging = angular.fromJson(this.LocationService.pagination()["annotations"]);

      // Testing is expecting these values in URL, so this is needed.
      paging = paging || {
        size: 20,
        from: 1
      };

      var defaults = {
        size: paging.size,
        from: paging.from,
        sort: paging.sort || 'entity_type:asc',
        filters: this.LocationService.filters()
      };

      defaults.filters = this.UserService.addMyProjectsFilter(defaults.filters, "annotations.project.project_id");
      this.CoreService.setSearchModelState(false);

      var abort = this.$q.defer();
      var prom: ng.IPromise<any> = this.ds.withHttpConfig({
        timeout: abort.promise
      })
        .get("", angular.extend(defaults, params)).then((response): any => {
        this.CoreService.setSearchModelState(true);
        return response["data"];
      });

      var eventCancel = this.$rootScope.$on("gdc-cancel-request", () => {
        abort.resolve();
        eventCancel();
        this.CoreService.setSearchModelState(true);
      });

      return prom;
    }
  }

  angular
      .module("annotations.services", [
        "restangular",
        "components.location",
        "user.services",
        "core.services"
      ])
      .service("AnnotationsService", AnnotationsService);
}
