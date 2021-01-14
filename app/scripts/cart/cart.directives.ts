module ngApp.cart.directives {
  import IUserService = ngApp.components.user.services.IUserService;
  import ICartService = ngApp.cart.services.ICartService;
  import IFilesService = ngApp.files.services.IFilesService;
  import ILocationService = ngApp.components.location.services.ILocationService;
  import TableiciousConfig = ngApp.components.tables.directives.tableicious.TableiciousConfig;

  import IRestangular = Restangular.IService;

  // remove from cart page
  function RemoveSingleCart(): ng.IDirective {
    return {
      restrict: "E",
      replace: true,
      // scope: {},
      // bindToController: {
      //   file: '='
      // },
      scope: {
        file: '='
      },
      bindToController: true,
      templateUrl: "cart/templates/remove-single.html",
      controllerAs: 'ctrl',
      controller: function ($scope: ng.IScope, CartService: ICartService) {
        this.$onInit = function () {
          // disabled: boolean = false;
          this.disabled = false;
          this.remove = function () {
            CartService.remove([this.file]);
            this.disabled = true;
          }
        }; //end $onInit
      }
    };
  }

  // add/remove to cart on file search page
  function AddToCartSingleIcon(): ng.IDirective {
    return {
      restrict: 'E',
      // scope: {},
      // bindToController: {
      //   file: '='
      // },
      scope: {
        file: '='
      },
      bindToController: true,
      templateUrl: 'cart/templates/add-to-cart-button-single.html',
      controller: 'AddToCartSingleCtrl as ctrl'
    };
  }

  // add/remove to cart on file entity page
  function AddToCartSingleLabelled(): ng.IDirective {
    return {
      restrict: 'E',
      replace: true,
      // scope: {},
      // bindToController: {
      //   file: '='
      // },
      scope: {
        file: '=',
        text: '=?'
      },
      bindToController: true,
      templateUrl: 'cart/templates/add-to-cart-button-labelled.html',
      controller: 'AddToCartSingleCtrl as ctrl'
    };
  }


  // add to cart on summary
  function AddToCartAllButton(): ng.IDirective {
    return {
      restrict: 'E',
      // scope: {},
      // bindToController: {
      //   files: '=',
      //   filter: '@',
      //   size: '='
      // },
      scope: {
        files: '=',
        filter: '@',
        size: '='
      },
      bindToController: true,
      templateUrl: "cart/templates/add-to-cart-all-button.html",
      controller: "AddToCartAllCtrl as ctrl"
    };
  }

  // add to cart dropdown on top of file search
  function AddToCartAllDropDown(): ng.IDirective {
    return {
      restrict: 'E',
      // scope: {},
      // bindToController: {
      //   files: '=',
      //   size: '@'
      // },
      scope: {
        files: '=',
        size: '@'
      },
      bindToController: true,
      templateUrl: "cart/templates/add-to-cart-all-dropdown.html",
      controller: "AddToCartAllCtrl as ctrl"
    };
  }

  // add to cart dropdown on cases search table
  function AddToCartFiltered(): ng.IDirective {
    return {
      restrict: "E",
      // scope: {},
      // bindToController: {
      //   row: "="
      // },
      scope: {
        row: "="
      },
      bindToController: true,
      controllerAs: 'ctrl',
      templateUrl: "cart/templates/add-to-cart-button-filtered.html",
      controller: function ($scope: ng.IScope,
        CartService: ICartService,
        //QueryCartService: IQueryCartService,
        LocationService: ILocationService,
        FilesService: IFilesService,
        ParticipantsService) {
        this.$onInit = function () {
          this.files = [];
          this.CartService = CartService;

          function areFiltersApplied(content): boolean {
            return content && _.some(content, (item: any) => {
              var content = item.hasOwnProperty('content') ? item.content : item;
              return content.field.indexOf("files.") === 0;
            });
          }

          function getContent(): any[] {
            var content = LocationService.filters().content;
            return content && !Array.isArray(content) ? [content] : content;
          }

          var content = getContent();
          this.areFiltersApplied = areFiltersApplied(content);

          $scope.$on("$locationChangeSuccess", () => {
            var content = getContent();
            this.areFiltersApplied = areFiltersApplied(content);
          });

          this.getFiles = function () {
            this.retrievingFiles = true;
            var filters = LocationService.filters();
            if (filters.op !== "and") {
              filters = { op: "and", content: [filters] };
            }

            // TODO: mschor: This is the place where the id field is hard-coded as the thing to use for adding to cart
            // console.log("CART DIRECTIVES");
            // console.log(this.row);

            // Was thinking to get the id field from the config.ini, but not sure how to in a directive
            //this.queryConfig = this.CoreService.getComponentFromConfig("files-table");

            var uuid = "";
            var samplesTab = true;
            if ("file_id" in this.row) {
              uuid = this.row.file_id;
              samplesTab = false;
            }
            else {
              uuid = this.row.id;
            }

            filters.content.push({
              content: {
                field: "files.cases.case_id",
                value: [
                  uuid
                ]
              },
              op: "in"
            });

            if (this.areFiltersApplied) {
              FilesService.getFiles({
                fields: ["file_name", "file_id", "cases.project_id", "access"],
                expand: [],
                filters: filters,
                size: CartService.getCartVacancySize()
              }).then((data) => {
                this.retrievingFiles = this.files.length ? false : true;
                this.filteredRelatedFiles = data;
              });
            }

            //TODO: mschor: This is where the add-to-cart button on the files tab winds up. Looks to be a hard-coded set of props
            if (!this.files.length) {

              // for (var file in this.files) {
              //     console.log("file:");
              //     console.log(file);
              // }

              //TODO: mschor: Historically, was calling the participant services here to get the file
              // to be added to the cart when clicking on the button next to an individual file.
              // Both samples and files add-to-cart buttons on the tables link here and so will
              // now determine which one to call instead of always calling the /samples route (ParticipantServices)
              if (samplesTab) {
                ParticipantsService.getParticipant(uuid, {
                  fields: [
                    "case_id",
                    "submitter_id",
                    "annotations.annotation_id",
                    "project.project_id",
                    "project.name",
                    'files.access',
                    'files.file_name',
                    'files.file_id',
                    'files.file_size',
                    'files.data_type',
                    'files.data_format'
                  ]
                }).then((data) => {
                  if (this.areFiltersApplied) {
                    this.retrievingFiles = this.filteredRelatedFiles ? false : true;
                  } else {
                    this.retrievingFiles = false;
                  }

                  var fs = (<any>_).map(data.files, f => {
                    // console.log("F is:");
                    // console.log(f);
                    f.cases = [{
                      case_id: data.case_id //TODO: mschor: instead of hard-coding .id here, should use something from config.ini
                      //project: {
                      //  project_id: data.project.project_id,
                      //  name: data.project.name
                      //}
                    }];
                  });

                  this.files = data.files;
                  this.calculateFileCount();
                });
              }
              else {
                //TODO: mschor: This should be calling FileService.getFile instead of the plural; fix when time permits
                FilesService.getFile(uuid, {
                  fields: ["file_name", "file_id", "cases.project_id", "access"]
                }).then((data) => {
                  if (this.areFiltersApplied) {
                    this.retrievingFiles = this.filteredRelatedFiles ? false : true;
                  } else {
                    this.retrievingFiles = false;
                  }

                  //var f = data;

                  var fs = (<any>_).map(data.files, f => {
                    // console.log("F is:");
                    // console.log(f);

                    f.cases = [{
                      case_id: data.file_id //TODO: mschor: instead of hard-coding .id here, should use something from config.ini
                      //project: {
                      //  project_id: data.project.project_id,
                      //  name: data.project.name
                      //}
                    }];
                  });
                  this.files = data.files;
                  this.calculateFileCount();
                });
              }
            }
          };

          this.addFilteredRelatedFiles = function () {
            var filters = LocationService.filters();
            if (filters.op !== "and") {
              filters = { op: "and", content: [filters] };
            }
            var uuid = this.row.case_id;

            filters.content.push({
              content: {
                field: "files.cases.case_id",
                value: [
                  uuid
                ]
              },
              op: "in"
            });
            CartService.addFiles(this.filteredRelatedFiles.hits);
          };

          this.addRelatedFiles = function () {
            var uuid = this.row.case_id;
            CartService.addFiles(this.files);
          };

          this.removeRelatedFiles = function () {
            CartService.remove(this.inBoth);
          };

          this.calculateFileCount = function () {
            this.inBoth = this.files.reduce((acc, f) => {
              if ((<any>CartService.getFiles()).find(cartF => cartF.file_id === f.file_id)) {
                return acc.concat(f);
              }
              return acc;
            }, []);
          }
        }; //end $onInit()
      }
    }
  }


  /** This directive, which can be placed anywhere, removes any unauthorized files from the cart **/
  function RemoveUnauthorizedFilesButton() {
    return {
      restrict: "AE",
      templateUrl: "cart/templates/remove-unauthorized-files.button.html",
      replace: true,
      controller: function ($scope, $element, UserService, CartService, FilesService) {
        this.$onInit = function () {
          //todo
          $scope.$watch(function () {
            return CartService.getUnauthorizedFiles();
          }, function (f) {
            $scope.files = f;
          }, true);

          $scope.remove = function () {
            CartService.remove($scope.files);
          }
        }; //end $onInit

      }
    }
  }

  function DownloadManifestCart(CartService, $uibModal, config: IGDCConfig, Restangular: IRestangular, notify: ng.cgNotify.INotifyService, $window: ng.IWindowService) {
    return {
      restrict: "AE",
      scope: true,
      link: ($scope, $element, $attrs) => {
        $element.on('click', () => {
          $scope.active = false;
          const files = [].concat(CartService.getFiles());
          const params = { ids: files.map(f => f.file_id) };
          const url = config['site-wide']['auth-api'] + '/manifest?annotations=true&related_files=true';

          const reportStatus = _.isFunction($scope.$parent.reportStatus) ?
            _.partial($scope.$parent.reportStatus, $scope.$id) :
            (status: any) => { };

          const inProgress = () => {
            $scope.active = true;
            reportStatus($scope.active);
            $attrs.$set('disabled', 'disabled');

          // Alert user that large carts may have longer download times
            if (files.length >= 3000) {
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

          // Dismiss large cart alert
            if (files.length >= 3000) {
              notify.closeAll();
              notify.config({startTop: 10}); //reset to default vertical position
            }
          };

          // Download file locally OR save to cloud bucket (controlled by API:config.ini:config.cloud-options.service-name)
          if (config['cloud-options']['service-name'].toLowerCase() === 'download' ||
            config['cloud-options']['service-name'].toLowerCase() === 'terra') {
            // ORIGINAL
            const checkProgress = $scope.download(params, url, () => $element, 'POST');
            checkProgress(inProgress, done);

          } else {
            return Restangular.all("status/api/manifest")
              .post(params, undefined, { 'Content-Type': 'application/json' })
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
                  CartService.notify.config({ duration: 0, startTop: 200 });
                  CartService.notify.closeAll();
                  CartService.notify({
                    messageTemplate:
                      `<h2>Manifest Saved To Cloud</h2>` +
                      `<p>The Manifest ID is provided below. Be sure to save this ID as it is required for accessing the Manifest.</p>` +
                      `<p>Instructions for accessing the Manifest can be found ` +
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

                } //end else
              });
          }
        });
      }
    };
  }

  function DownloadMetadataFiles(CartService, $uibModal, config: IGDCConfig, notify: ng.cgNotify.INotifyService) {
    return {
      restrict: "AE",
      scope: true,
      link: ($scope, $element, $attrs) => {
        $element.on('click', () => {

          $scope.active = false;

          const reportStatus = _.isFunction($scope.$parent.reportStatus)
            ? _.partial($scope.$parent.reportStatus, $scope.$id)
            : (status: any) => { };

          const inProgress = () => {
            $scope.active = true;
            reportStatus($scope.active);
            $attrs.$set('disabled', 'disabled');
          };
          const done = () => {
            $scope.active = false;
            reportStatus($scope.active);
            $element.removeAttr('disabled');
          };
          const files = [].concat(CartService.getFiles());
          const params = { ids: files.map(f => f.file_id) };
          const url = config['site-wide']['auth-api'] + '/data/metadata_files';

          // Download file locally OR save to cloud bucket (controlled by API:config.ini:config.cloud-options.service-name)
          if (config['cloud-options']['service-name'].toLowerCase() === 'download' ||
            config['cloud-options']['service-name'].toLowerCase() === 'terra') {
            // ORIGINAL
            const checkProgress = $scope.download(params, url, () => $element, 'POST');
            checkProgress(inProgress, done);
          }
        });
      }
    };
  }

  function DownloadButtonAllCart(UserService, CartService, $uibModal, config: IGDCConfig, Restangular: IRestangular, notify: ng.cgNotify.INotifyService) {
    return {
      restrict: "AE",
      scope: true,
      link: ($scope, $element, $attrs) => {
        const scope = $scope;
        scope.active = false;

        // const MAX_FILE_SIZE_ALLOWED = 5e+9;
        const MAX_FILE_SIZE_ALLOWED = Number(config['cart']['max-file-size-allowed']) ? config['cart']['max-file-size-allowed'] : 5e+9;

        const reportStatus = _.isFunction(scope.$parent.reportStatus)
          ? _.partial(scope.$parent.reportStatus, scope.$id)
          : (status: any) => { };

        const inProgress = () => {
          scope.active = true;
          reportStatus(scope.active);
          $attrs.$set('disabled', 'disabled');
        };

        const done = (response) => {
          console.log("done() got response!", response);

          scope.active = false;
          reportStatus(scope.active);
          $element.removeAttr('disabled');
        };

        const url = config['site-wide']['auth-api'] + '/data?annotations=true&related_files=true';
        const download = (files) => {

          // Recursive function that calls itself every 5 seconds to check on the cart download status.
          // Used for multifile downloads.
          function getDownloadStatus(token:string) {
            Restangular.all("/check_download_status")
              .post({ "download_token": token }, undefined, { 'Content-Type': 'application/json' })
              .then((response) => {
                if (response.error) {
                  // The API encountered an error while building download file
                  console.log("Error occurred while building download file :", response.error);
                  notify.closeAll();
                  notify.config({ duration: 60000 });
                  notify({
                    message: "",
                    messageTemplate:
                      `<h2>Download Error</h2>` +
                      `<p>An error occurred while preparing the download file.</p>` + 
                      `<br>` +
                      `<p>Please try again, and if the problem persists contact the site administrator.</p>` +
                      `<br>` +
                      `<br>`,
                    container: "#notification",
                    classes: "alert-danger"
                  });
                  
                } else {
                  if (response.data['is_download_complete']) {
                    // Download completed. Update the user with a modal containing the download URL
                    CartService.notify.config({ duration: 0, startTop: 200 });
                    CartService.notify.closeAll();
                    CartService.notify({
                      // templateUrl: 'core/templates/buttonless-cgnotify.html',
                      message: "",
                      messageTemplate:
                        `<h2>Cart Ready For Download</h2>` +
                        `<p>Please click the button below to download the file.</p>` +
                        `<br>` +
                        `<a class="btn btn-primary" href="` + response.data['file_url'] + `" target="_blank">` + 
                        `<i class="fa fa-download"></i> Download</a>` +
                        `<br>` +
                        `<br>`,
                      container: "#notification"
                    });
                  } else {
                    // Download is not ready. Wait 5 seconds then check status again.
                    console.log("Download not ready. Waiting.");
                    setTimeout(() => {
                      getDownloadStatus(token);
                    }, 5000);
                  }
                }
              })
              .catch((response) => {
                // An error occurred while checking on the status of the download
                console.log('response: ', response);
                console.log("Caught an error when checking the cart download status: " + response.error);
                notify.closeAll();
                notify.config({ duration: 60000 });
                notify({
                  message: "",
                  messageTemplate:
                    `<h2>Download Error</h2>` +
                    `<p>An error occurred while checking the status of the download.</p>` +
                    `<br>` +
                    `<p>Please contact the site administrator.</p>` +
                    `<br>` +
                    `<br>`,
                  container: "#notification",
                  classes: "alert-danger"
                });
              });
          } //end getDownloadStatus


          if ((files || []).length > 0) {
            const params = { ids: files.map(f => f.file_id) };
            if (files.length == 1) {
              // Downloading only 1 file
              const checkProgress = scope.download(params, url, () => $element, 'POST');
              checkProgress(inProgress, done, true);

            } else {
              // Downloading multiple files at once. They'll be rolled into a single tarball file to download
              return Restangular.all("/status/api/data?annotations=true&related_files=true")
                .post(params, undefined, { 'Content-Type': 'application/json' })
                .then((response) => {
                  if (response.error) {
                    // An error occurred while submitting the multifile download request
                    notify.config({ duration: 60000 });
                    notify.closeAll();
                    notify({
                      message: "",
                      messageTemplate:
                        `<span>
                          Unable to download cart.
                        </span>`,
                      container: "#notification",
                      classes: "alert-danger"
                    });
                  } else {
                    // Successfully submitted request for a multifile download.
                    // Alert user this process takes time.
                    CartService.notify.config({ duration: 0, startTop: 200 });
                    CartService.notify.closeAll();
                    CartService.notify({
                      // templateUrl: 'core/templates/buttonless-cgnotify.html',
                      messageTemplate:
                        `<h2>Preparing Your Cart</h2>` +
                        `<p>Please wait while we prepare your cart. Larger files greatly increase the preparation time.</p>` +
                        `<br>`,
                      container: "#notification"
                    });

                    return response; //return the response to continue the 'thenable' chain
                  } //end else
                })
                .then((response) => {
                  // After alerting user that we are preparing the download, start the recursive status checking
                  if (response.data['download_token']) {
                    getDownloadStatus(response.data['download_token'])
                  } else {
                    console.log("Error. No download_token received from API.")
                    notify.config({ duration: 60000 });
                    notify.closeAll();
                    notify({
                      message: "",
                      messageTemplate:
                        `<span>
                          Unable to download cart.
                        </span>`,
                      container: "#notification",
                      classes: "alert-danger"
                    });
                  }
                });


            }
          }
        };

        $element.on('click', () => {
          const authorizedInCart = CartService.getAuthorizedFiles()
          const unauthorizedInCart = CartService.getUnauthorizedFiles();
          const files = [].concat(authorizedInCart);
          // "meta" is referenced in the html templates used below.
          scope.meta = {
            unauthorized: unauthorizedInCart,
            authorized: authorizedInCart
          };


          if (unauthorizedInCart.length) {
            if (UserService.currentUser) {
              // Makes sure the user session has not expired.
              UserService.loginPromise().then(() => {
                // Session is still active.

                const modalInstance = $uibModal.open({
                  templateUrl: "core/templates/request-access-to-download.html",
                  controller: "LoginToDownloadController",
                  controllerAs: "wc",
                  backdrop: true,
                  keyboard: true,
                  scope: scope,
                  size: "lg",
                  animation: false
                });

                modalInstance.result.then((a) => {
                  if (a) {
                    download(files);
                  }
                });
                // }, (response) => { //changed to due 1.7.0
              }).catch((response) => {
                console.log('User session has expired.', response);

                const modalInstance = $uibModal.open({
                  templateUrl: "core/templates/session-expired.html",
                  controller: "LoginToDownloadController",
                  controllerAs: "wc",
                  backdrop: true,
                  keyboard: true,
                  scope: scope,
                  size: "lg",
                  animation: false
                });

                modalInstance.result.then(() => UserService.logout());
              });

            } else {
              // User is NOT logged in.

              const modalInstance = $uibModal.open({
                templateUrl: "core/templates/login-to-download.html",
                controller: "LoginToDownloadController",
                controllerAs: "wc",
                backdrop: true,
                keyboard: true,
                scope: scope,
                size: "lg",
                animation: false
              });

              modalInstance.result.then((a) => {
                if (a) {
                  download(files);
                }
              });
            }
          } else if (authorizedInCart.reduce((acc, x) => acc + x.file_size, 0) > MAX_FILE_SIZE_ALLOWED) {
            $uibModal.open({
              templateUrl: 'core/templates/modal.html',
              controller: 'WarningController',
              controllerAs: 'wc',
              backdrop: 'static',
              keyboard: false,
              backdropClass: 'warning-backdrop',
              animation: false,
              size: 'lg',
              resolve: {
                warning: () =>
                  `Your cart contains more than 5GBs of data. <br />
                   Please select the "Download > Manifest" option and use the
                   <a href='` + config['navbar']['apps-datatransfer-tool-link'] + `' target='_blank'>
                     ` + config['site-wide']['project-abbr'] + ` Client
                   </a> to continue.`,
                header: null
              }
            });
          } else {
            download(files);
          }
        });
      }
    };
  }

  function ExportToTerra(CartService, $uibModal, config: IGDCConfig, Restangular: IRestangular, $http: ng.IHttpService, $window: ng.IWindowService) {
    return {
      restrict: "AE",
      scope: true,
      link: ($scope, $element, $attrs) => {
        $element.on('click', () => {
          $scope.active = false;

          const files = [].concat(CartService.getFiles());
          const params = { ids: files.map(f => f.file_id) };

          Restangular.all('/status/api/terra')
            .post(params, undefined, { 'Content-Type': 'application/json' })
            .then((response) => {
              console.log("Terra staging URL: " + response);

              const terra_url = 'https://app.terra.bio/#import-data?format=entitiesJson&url=';
              //URL has to be encoded for Terra
              var encoded_url = encodeURIComponent(encodeURI(response));
              $window.open(terra_url + encoded_url, "_blank");
            })
            .catch((error) => {
              console.log("Caught an error with creating Terra JSON : " + error.data);
            });
        });
      }
    };

  }

  angular.module("cart.directives", [
    "user.services",
    "location.services",
    "files.services",
    "search.files.table.service",
    "cgNotify"
  ])
    .directive("addToCartSingleIcon", AddToCartSingleIcon)
    .directive("addToCartSingleLabelled", AddToCartSingleLabelled)
    .directive("addToCartAllDropdown", AddToCartAllDropDown)
    .directive("downloadMetadataFiles", DownloadMetadataFiles)
    .directive("addToCartAllButton", AddToCartAllButton)
    .directive("addToCartFiltered", AddToCartFiltered)
    .directive("downloadButtonAllCart", DownloadButtonAllCart)
    .directive("downloadManifestCart", DownloadManifestCart)
    .directive("exportToTerra", ExportToTerra)
    .directive("removeUnauthorizedFilesButton", RemoveUnauthorizedFilesButton)
    .directive("removeSingleCart", RemoveSingleCart);
}