module ngApp.files.directives {
  import IUserService = ngApp.components.user.services.IUserService;
  import ICartService = ngApp.cart.services.ICartService;
  import IScope = ng.IScope; //
  import IRestangular = Restangular.IService;

  export interface FileScope extends IScope {//NOTE added to resolve typescript errors.
    active: boolean;
    reportStatus: any;
    filename: any;
    download: any;
    files: any;
    open: any
    projectId: any;
    size: any;
  }

  // const hasControlledFiles = (files) => files.some((f) => f.access !== 'open');
  const hasControlledFiles = (files) => files.some((f) => false);

  function DownloadMetadataButton(): ng.IDirective {
    return {
      restrict: "E",
      replace: true,
      scope: {
        files: "=",
        filename: '@',
        textNormal: '@',
        textInProgress: '@',
        styleClass: '@',
        icon: '@'
      },
      template: '<button tabindex="0" data-ng-class="[styleClass || \'btn btn-primary\']" data-downloader ng-click="ctrl.onClick()"> \
              <i class="fa {{icon || \'fa-download\'}}" ng-class="{\'fa-spinner\': active, \'fa-pulse\': active}" /> \
              <span ng-if="textNormal"><span ng-if="! active">&nbsp;{{ ::textNormal }}</span> \
              <span ng-if="active">&nbsp;{{ ::textInProgress }}</span></span></button>',
      controllerAs: 'ctrl',
      // controller: function($scope: ng.IScope, $attrs, $element, $uibModal, CartService: ICartService, UserService: IUserService, config: IGDCConfig) {
      controller: function($scope: FileScope, $attrs, $element, $uibModal, CartService: ICartService, UserService: IUserService, config: IGDCConfig, Restangular: IRestangular, notify: ng.cgNotify.INotifyService, $window: ng.IWindowService) {
        this.onClick = () => {
          const url = config['site-wide']['auth-api'] + '/files';

          var fileIds = [];
          if ($scope.filename.indexOf("metadata.cart") != -1) {
            // Downloading from the cart page. 
            fileIds = CartService.getFileIds();
          } else {
            // Downloading from the individual file page
            fileIds.push($scope["files"]["file_id"]);
          }
          const filters = {'content': [{'content': {'field': 'files.file_id', 'value': fileIds}, 'op': 'in'}], 'op': 'and'};

          const reportStatus: any = _.isFunction($scope.reportStatus) //NOTE was $scope.$parent.reportStatus
            ? _.partial($scope.reportStatus, $scope.$id) //NOTE was $scope.$parent.reportStatus
            : () => {};

          const inProgress = () => {
            $scope.active = true;
            reportStatus($scope.active);
            $attrs.$set('disabled', 'disabled');

            // Alert user that large carts may have longer download times
            if (fileIds.length >= 3000) {
              notify.closeAll();
              notify.config({
                startTop: $window.innerHeight / 2 - 100 // vertically center with slight offset
              });
              notify({
                duration: 90000, //DOLLEY 90sec. matches timeoutInterval in downloader.directive
                message: "Larger carts require additional processing time. Please wait while your file is being prepared.",
                templateUrl: 'core/templates/buttonless-cgnotify.html',
                container: "#notification",
                position: "center",
                class: "alert-default",
              });
            }
          };

          const done = () => {
            $scope.active = false;
            reportStatus($scope.active);
            $element.removeAttr('disabled');

            // Dismiss alert for large carts
            if (fileIds.length >= 3000) {
              notify.closeAll();
              notify.config({startTop: 10}); //reset to default vertical position
            }
          };

          const isLoggedIn = UserService.currentUser;
          const authorizedInCart = CartService.getAuthorizedFiles();
          const unauthorizedInCart = CartService.getUnauthorizedFiles();


          const params = _.merge({
            attachment: true,
            filters: filters,
            fields: 'cases.project.project_id',
            expand: [
              'annotations',
              'archive',
              'associated_entities',
              'center',
              'analysis',
              'analysis.input_files',
              'analysis.metadata',
              'analysis.metadata_files',
              'analysis.downstream_analyses',
              'analysis.downstream_analyses.output_files',
              'reference_genome',
              'index_file'
            ],
            format: 'JSON',
            pretty: true,
            size: fileIds.length,
          }, $scope.filename ? {filename: $scope.filename} : {});

          // Download file locally OR save to cloud bucket (controlled by API:config.ini:config.cloudOptions.serviceName)
          if (config['cloud-options']['service-name'].toLowerCase() === 'download' ||
              config['cloud-options']['service-name'].toLowerCase() === 'terra') {
            // ORIGINAL
            const checkProgress = $scope.download(params, url, () => $element, 'POST');
            checkProgress(inProgress, done, true);

          } else {
            var ids = params.filters.content[0].content.value;

            return Restangular.all("status/api/files")
              .post({'ids': ids}, undefined, {'Content-Type': 'application/json'})
              .then((response) => {
                if (response.error) {
                    notify.config({ duration: 60000 });
                    notify.closeAll();
                    notify({
                      message: "",
                      messageTemplate:
                        `<span>
                          Unable to connect to cloud service.
                        </span>`,
                      container: "#notification",
                      classes: "alert-danger"
                    });
                } else {
                  notify.config({ duration: 0, startTop: 200 });
                  notify.closeAll();
                  notify({
                    message: "",
                    messageTemplate:
                    `<h2>Metadata Saved To Cloud</h2>` +
                    `<p>The Metadata ID is provided below. Be sure to save this ID as it is required for accessing the Metadata.</p>` +
                    `<p>Instructions for accessing the Metadata can be found ` +
                    `<a target="_blank" href="` + config['cart']['download-utility-link'] + `">here</a>.` +
                    `</p>` +
                    `<br>` +
                    `<p style="font-weight:bold;">Manifest ID</p>` +
                    `<p id="manifest_id" style="font-weight:bold;">` + response.manifest_id + `</p>` +
                    `<button class="btn btn-info" data-copy-to-clipboard data-copy-selector="manifest_id" title="Copy to clipboard">` +
                    `<i class="fa fa-clipboard"></i> Copy to Clipboard` +
                    `</button>` +
                    `<br>`,
                    container: "#notification"
                  });
                  return response;

                }// end else
            });
          } // end else
        };
        $scope.active = false;
      }

    };
  }

  function DownloadButton($log: ng.ILogService, UserService, $uibModal, config: IGDCConfig): ng.IDirective {
    // const hasAccess = (files) => files.every((f) => UserService.isUserProject(f));
    const hasAccess = (files) => files.every((f) => true);

    return {
      restrict: "E",
      replace: true,
      scope: {
        files:"=",
        copy: "@",
        dlcopy: "@",
        classes: "@",
        icon: "@"
      },
      template: "<a ng-class=\"[classes || 'btn btn-primary']\" data-downloader>" +
                "<i class=\"fa {{icon || 'fa-download'}}\" ng-class=\"{'fa-spinner': active, 'fa-pulse': active}\"></i>" +
                "<span ng-if=\"copy\"><span ng-if=\"!active\">&nbsp;{{copy}}</span><span ng-if=\"active\">&nbsp;{{dlcopy}}</span></span></a>",
      link: ($scope: FileScope, $element, $attrs) => {
        $scope.active = false;
        const inProgress = () => {
          $scope.active = true;
          $attrs.$set('disabled', 'disabled');
        };
        const done = () => {
          $scope.active = false;
          $element.removeAttr('disabled');
        };
        const url = config['site-wide']['auth-api'] + '/data?annotations=true&related_files=true';
        const download = (files) => {
          if ((files || []).length > 0) {
            const params = { ids: files.map(f => f.file_id) };
            const checkProgress = $scope.download(params, url, () => $element, 'POST');
            checkProgress(inProgress, done, true);
          }
        };
        const showModal = (template) => {
          return $uibModal.open({
            templateUrl: template,
            controller: 'LoginToDownloadController',
            controllerAs: 'wc',
            backdrop: true,
            keyboard: true,
            animation: false,
            size: 'lg'
          });
        };

        $element.on('click', () => {
          const files = [].concat($scope.files);

          if (hasControlledFiles(files)) {
            if (UserService.currentUser) {
              // Makes sure the user session has not expired.
              UserService.loginPromise().then(() => {
                // Session is still active.
                if (hasAccess(files)) {
                  download(files);
                } else {
                  showModal('core/templates/request-access-to-download-single.html');
                }
              // }, (response) => { //changed to due 1.7.0
              }).catch((response) => {
                $log.log('User session has expired.', response);

                showModal('core/templates/session-expired.html').result.then((a) => {
                  UserService.logout();
                });
              });
            } else {
              showModal('core/templates/login-to-download-single.html');
            }
          } else {
            download(files);
          }
        });
      }
    };
  }

  function DownloadManifestButton(FilesService, config: IGDCConfig, LocationService): ng.IDirective {

    return {
      restrict: "E",
      replace: true,
      scope: {
        projectId: "=",
        size: "=",
        copy: "@",
        dlcopy: "@",
        classes: "@",
        icon: "@"
      },
      templateUrl: "files/templates/download-manifest-button.html",
      link: ($scope: FileScope, $element, $attrs) => {

        const togglePopover = shouldBeOpen => $scope.$apply(() => {
          $scope.open = shouldBeOpen;
          if (shouldBeOpen) {
            setTimeout(() => {
              $('.popover').mouseleave(() => {
                $scope.$apply(() => $scope.open = false)
              });
            });
          }
        });

        $element.on('mouseenter', () => togglePopover(true));

        $element.on('mouseleave', _.debounce(() => {
          if ($('.popover#hover').length === 0) togglePopover(false);
        }, 700));

        $scope.active = false;

        const inProgress = () => {
          $scope.active = true;
          $attrs.$set('disabled', 'disabled');
        };

        const done = () => {
          $scope.active = false;
          $element.removeAttr('disabled');
        };

        $element.on('click', () => {
          const url = config['site-wide']['auth-api'] + '/files'

          const params = {
            return_type: 'manifest',
            size: $scope.size,
            attachment: true,
            format: 'TSV',
            fields: [ 'file_id' ],
            filters: $scope.projectId // on project page
              ? {
                  op: 'in',
                  content: {
                    field: 'cases.project.project_id',
                    value: $scope.projectId
                  }
                }
              : LocationService.filters()
          };

          const checkProgress = $scope.download(params, url, () => $element, 'POST');
          checkProgress(inProgress, done);
        });
      }
    };
  }

  function BAMSlicingButton($log: ng.ILogService, UserService, $uibModal): ng.IDirective {
    // const hasAccess = (files) => files.every((f) => UserService.isUserProject(f));
    const hasAccess = (files) => files.every((f) => true);

    return {
      restrict: "E",
      replace: true,
      scope: {
        files:"=",
        copy: "@",
        dlcopy: "@",
        classes: "@",
        icon: "@"
      },
      template: "<a ng-class=\"[classes || 'btn btn-primary']\" data-downloader>" +
                "<i class=\"fa {{icon || 'fa-download'}}\" ng-class=\"{'fa-spinner': active, 'fa-pulse': active}\"></i>" +
                "<span ng-if=\"copy\"><span ng-if=\"!active\">&nbsp;{{copy}}</span><span ng-if=\"active\">&nbsp;{{dlcopy}}</span></span></a>",
      link: function($scope: FileScope, $element, $attrs){
        $scope.active = false;
        const inProgress = () => {
          $scope.active = true;
          $attrs.$set('disabled', 'disabled');
        };
        const done = () => {
          $scope.active = false;
          $element.removeAttr('disabled');
        };
        const bamSlice = (files) => {
          var bamModal = $uibModal.open({
            templateUrl: "files/templates/bam-slicing.html",
            controller: "BAMSlicingController",
            controllerAs: "bamc",
            backdrop: true,
            keyboard: true,
            animation: false,
            size: "lg",
            resolve: {
              file: function() {
                return _.head(files);
              },
              completeCallback: () => done,
              inProgress: () => inProgress,
              downloader: () => $scope.download
            }
          });
        };
        const showModal = (template) => {
          return $uibModal.open({
            templateUrl: template,
            controller: 'LoginToDownloadController',
            controllerAs: 'wc',
            backdrop: true,
            keyboard: true,
            animation: false,
            size: 'lg'
          });
        };

        $element.on("click", (a) => {
          const files = [].concat($scope.files);

          bamSlice(files);

          if (hasControlledFiles(files)) {
            if (UserService.currentUser) {
              // Makes sure the user session has not expired.
              UserService.loginPromise().then(() => {
                // Session is still active.
                if (hasAccess(files)) {
                  bamSlice(files);
                } else {
                  showModal('core/templates/request-access-to-download-single.html');
                }
              // }, (response) => { //changed to due 1.7.0
              }).catch((response) => {
                $log.log('User session has expired.', response);

                showModal('core/templates/session-expired.html').result.then((a) => {
                  UserService.logout();
                });
              });
            } else {
              showModal('core/templates/login-to-download-single.html');
            }
          } else {
            bamSlice(files);
          }
        });
      }
    }
  }

  angular
    .module("files.directives", [
      "restangular", "components.location", "user.services",
      "core.services", "ui.bootstrap", "files.controller", "files.services"
    ])
    .directive("downloadButton", DownloadButton)
    .directive("downloadMetadataButton", DownloadMetadataButton)
    .directive("downloadManifestButton", DownloadManifestButton)
    .directive("bamSlicingButton", BAMSlicingButton);
}
