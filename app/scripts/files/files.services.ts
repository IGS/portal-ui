module ngApp.files.services {
  import ICoreService = ngApp.core.services.ICoreService;
  import ILocationService = ngApp.components.location.services.ILocationService;
  import IUserService = ngApp.components.user.services.IUserService;
  import IRootScope = ngApp.IRootScope;

  export interface IFilesService {
    getFile(id: string, params: Object): ng.IPromise<any>;
    getFiles(params?: Object, method?: string): ng.IPromise<any>;
    downloadManifest(ids: Array<string>, callback: any);
    sliceBAM(fileID: string, bedTSV: string, completeCallback: any, inProgress: any, downloader: any);
  }

  class FilesService implements IFilesService {
    private ds: any;

    /* @ngInject */
    constructor(
      private Restangular: Restangular.IService,
      private LocationService: ILocationService,
      private UserService: IUserService,
      private CoreService: ICoreService,
      private $uibModal: any,
      private $rootScope: IRootScope,
      private $q: ng.IQService,
      private $filter,
      private $window,
      private RestFullResponse: any,
      private AuthRestangular,
      private config: IGDCConfig
    ) {
      this.ds = Restangular.all("files");
    }

    getFile(id: string, params: Object = {}): ng.IPromise<any> {
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

    downloadManifest(_ids, callback: any) {
      this.download("/manifest", _ids, (status)=>{
        if(callback) callback(status);
      });
    }

    downloadFiles(_ids, callback: any) {
      this.download("/data", _ids, (status)=>{
        if(callback) callback(status);
      });
    }

    download(endpoint: string, ids: Array<string>, callback: any) {
      var abort = this.$q.defer();
      var params = { "ids": ids };
      this.RestFullResponse.all(endpoint + "?annotations=true&related_files=true")
        .withHttpConfig({
          timeout: abort.promise,
          responseType: "blob",
          withCredentials: true
        })
        .post(params, undefined, { 'Content-Type': 'application/json' })
        .then((response) => {
          var filename: string = response.headers['content-disposition'].match(/filename=(.*)/i)[1];
          this.$window.saveAs(response.data, filename);
          if (callback) callback(true);
        // }, (response) => { //changed to due 1.7.0
        }).catch((response) => {
          //Download Failed

          this.$uibModal.open({
            templateUrl: 'core/templates/download-failed.html',
            controller: "LoginToDownloadController",
            controllerAs: "wc",
            backdrop: true,
            keyboard: true,
            animation: false,
            size: "lg"
          });
          if(callback) callback(false);
        });
    }

    processBED(bedTSV: string): Object {
      if (bedTSV) {
        var lines = bedTSV.split("\n");
        return {"regions": _.map(lines, (line) => {
          var region = line.split("\t");
          var regionString = region[0];
          if (region.length > 1) {
            regionString += ":" + region[1];
            if (region.length > 2) {
              regionString += "-" + region[2];
            }
          }
          return regionString;
        })};
      }
      return {};
    }

    sliceBAM(fileID: string, bedTSV: string, completeCallback: () => void, inProgress: () => void, downloader) {
      var params = this.processBED(bedTSV);
      params['attachment'] = 'true';

      const url = `${this['config']['auth_api']}/v0/slicing/view/${fileID}`;

      const customMessages = {
        warningHeader: 'BAM Slicing Failed',
        warningPrefix: 'Invalid BED Format (refer to the examples described in the BAM Slicing pop-up): '
      };

      const checkProgress = downloader(params, url, null, 'POST', customMessages);
      checkProgress(inProgress, completeCallback);
    }

    getFiles(
      params: { fields?: any; expand?: any; facets?: any; raw?: any } = {},
      method: string = 'GET'
    ): ng.IPromise<any> {

      var modifiedParams = _.extend({}, params, {
        fields: params.fields && params.fields.join(),
        expand: params.expand && params.expand.join(),
        facets: params.facets && params.facets.join()
      });

      var paging = angular.fromJson(this.LocationService.pagination().files);

      // Testing is expecting these values in URL, so this is needed.
      paging = paging || {
        size: 20,
        from: 1
      };

      var defaults = {
        size: paging.size || 20,
        from: paging.from || 1,
        // sort: paging.sort || "file_name:asc",
        sort: paging.sort || this.config['search']['files-table']['default-sort'],
        filters: this.LocationService.filters(),
        save: this.LocationService.save()
      };

      if (!params.raw) {
        defaults.filters = this.UserService.addMyProjectsFilter(defaults.filters, "cases.project.project_id");
      }

      this.CoreService.setSearchModelState(false);

      var abort = this.$q.defer();
    
      if (method === 'POST') {
        var prom: ng.IPromise<any> = this.ds.withHttpConfig({
          timeout: abort.promise
        }).post(angular.extend(defaults, modifiedParams), undefined, { 'Content-Type': 'application/json' }).then((response): any => {
          this.CoreService.setSearchModelState(true);
          return response.data;
        });
      } else {
        var prom: ng.IPromise<any> = this.ds.withHttpConfig({
          timeout: abort.promise
        }).get("", angular.extend(defaults, modifiedParams)).then((response): any => {
          this.CoreService.setSearchModelState(true);
          return response.data;
        });
      }

      var eventCancel = this.$rootScope.$on("gdc-cancel-request", () => {
        console.log('aborted')
        abort.resolve();
        eventCancel();
        this.CoreService.setSearchModelState(true);
      });

      return prom;
    }
  }

  angular
    .module("files.services", ["restangular", "components.location", "user.services", "core.services"])
    .service("FilesService", FilesService);

}
