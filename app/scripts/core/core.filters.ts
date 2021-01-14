module ngApp.core.filters {

  function MakeDownloadLink($rootScope: ngApp.IRootScope) {
    return function (ids: string[],
                    annotations : boolean = true,
                    relatedFiles: boolean = true
                    ) {
      var baseUrl: string = $rootScope['config']['site-wide']['auth-api'];
      ids = _.compact(ids);
      var url :string = baseUrl + "/data/" + ids.join(",");
      var flags: string[] = [];
      if (annotations) {
        flags.push("annotations=1");
      }
      if (relatedFiles) {
        flags.push("related_files=1");
      }
      if (flags.length) {
        url += "?";
      }
      return url + flags.join("&");
    };
  }

  function MakeManifestLink($rootScope: ngApp.IRootScope) {
    return function (ids: string[],
                    baseUrl: string = $rootScope['config']['site-wide']['auth-api']) {
      return baseUrl + "/manifest/" + ids.join(",");
    };
  }

  angular.module("core.filters", [])
    .filter("makeManifestLink", MakeManifestLink)
    .filter("makeDownloadLink", MakeDownloadLink)
    .filter("unsafe", function($sce, $compile) { return $sce.trustAsHtml; });
}
