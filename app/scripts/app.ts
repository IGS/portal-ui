/// <reference path="./types.ts"/>

declare module ngApp {
  export interface IGDCConfig {
    // version: string;
    // tag: string;
    // ident: string;
    // api: string;
    // auth: string;
    // apiVersion: string;
    // apiCommitHash: string;
    // apiCommitLink: string;
    // apiTag: string;
    // supportedAPI: string;
    // apiIsMismatched: boolean;
    home: any; //holds config for home component
    search: any; //holds config for search component
    projects: any; //holds config for projects component
  }

  export interface IRootScope extends ng.IScope {
    // pageTitle: string;
    // loaded: boolean;
    // modelLoaded: boolean;
    config: IGDCConfig;
    undoClicked(action: string): void;
    cancelRequest(): void;
    // isCustomLoaded: boolean;
  }
}

import ICoreService = ngApp.core.services.ICoreService;
import IRootScope = ngApp.IRootScope;
import IGDCConfig = ngApp.IGDCConfig;
import INotifyService = ng.cgNotify.INotifyService;
import IUserService = ngApp.components.user.services.IUserService;
import ILocalStorageService = ngApp.core.services.ILocalStorageService;


function displayError(message: string, notify: INotifyService) {
  notify.config({ duration: 60000 });
  notify.closeAll();
  notify({
    message: "",
    messageTemplate:
      `<span>` +
        message +
      `</span>`,
    container: "#notification",
    classes: "alert-danger"
  });
}

// Cross-Site Request Forgery (CSRF) Prevention
// https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)_Prevention_Cheat_Sheet#General_Recommendation:_Synchronizer_Token_Pattern
function addTokenToRequest (element, operation, route, url, headers, params, httpConfig) {
  var csrftoken = document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  return {
    element: element,
    headers: _.extend(headers, { 'X-CSRFToken': csrftoken }),
    params: params,
    httpConfig: httpConfig
  };
}

/* @ngInject */
function appConfig(
  $urlRouterProvider: ng.ui.IUrlRouterProvider,
  $locationProvider: ng.ILocationProvider,
  RestangularProvider: Restangular.IProvider,
  config: IGDCConfig,
  $compileProvider: ng.ICompileService,
  $httpProvider: ng.IHttpProvider
) {

  $compileProvider['debugInfoEnabled'](!config['site-wide']['production']);
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise("/404");
  RestangularProvider.setBaseUrl(config['site-wide']['api']);
  RestangularProvider.setDefaultHttpFields({
    cache: true
  });

  /**
  The regex is from https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie in Example #2.
  Cookies are stored in document.cookie as "cookieName1=cookieValue; cookieName2=cookieValue"
  so the capturing group after the "csrftoken=" captures the value and places it into var csrftoken.
  Unable to use $cookies because services can't be injected in config step
  **/
  var csrftoken = document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  $httpProvider.defaults.headers.common['X-CSRFToken'] = csrftoken;
}

/* @ngInject */
function appRun(gettextCatalog: any,
                Restangular: Restangular.IProvider,
                $state: ng.ui.IStateService,
                CoreService: ICoreService,
                $rootScope: IRootScope,
                config: IGDCConfig,
                notify: INotifyService,
                $cookies: ng.cookies.ICookiesService,
                UserService: IUserService,
                $window: ng.IWindowService,
                $uibModalStack,
                LocalStorageService: ILocalStorageService,
                $location: ng.ILocationService
                ) {
  if (navigator.cookieEnabled && $cookies.get("GDC-Portal-Sha") !== config['site-wide']['ident']) {
    $cookies.put("GDC-Portal-Sha", config['site-wide']['ident']);
    [ "Projects-col", "Annotations-col", "Files-col", "Cases-col",
      "Cart-col", "gdc-cart-items", "gdc-cart-updated", "gdc-facet-config"
    ].forEach(item => LocalStorageService.removeItem(item))
  }
  gettextCatalog.debug = true;

  $rootScope.config = config;
  Restangular.addFullRequestInterceptor(addTokenToRequest);
  Restangular.addResponseInterceptor((data, operation: string, model: string, url, response: any, deferred) => {
    // Ajax
    CoreService.xhrDone();
    if (response.headers('content-disposition')) {
      return deferred.resolve({ 'data': data, 'headers': response.headers()});
    } else {
      return deferred.resolve(data);
    }

  });

  (<any>Restangular).all('status').get('').then(function(data){

    //TODO: Does this do anything?
    if (+data.version !== +config['site-wide']['supported-api']) {
      config['site-wide']['api-is-mismatched'] = true;
    }
  // }, function(response) { //changed to due 1.7.0
  }).catch(function(response) {
    var message: string = 'Unable to connect to the API.';
    displayError(message, notify);
  });

  UserService.login();
      
  // Start up Google Analytics
  if (config['site-wide']['google-analytics-enabled']) {
    // Load GA javascript 
    loadGoogleAnalytics();
    
    // Instantiate GA tracker object
    $window.ga('create', config['site-wide']['google-analytics-id'], 'auto');
  }

  $rootScope.$on("$stateChangeStart", () => {
    // Page change
    //CoreService.setLoadedState(false);
    // Close all notifcation windows
    notify.closeAll();
  });

  $rootScope.$on("$stateChangeSuccess", () => {
    // Page change
    CoreService.setLoadedState(true);

    // Submit Google Analytics pageview
    if (config['site-wide']['google-analytics-enabled']) {
      $window.ga('send', 'pageview', $location.absUrl());
    }
  });

  $rootScope.$on("$stateChangeError", () => {
    $state.go("404", {}, { location: "replace" });
  });
}

angular
  .module("ngApp", [
    "cgNotify",
    "ngProgressLite",
    "ngAnimate",
    "ngAria",
    "ngCookies",
    "ngSanitize",
    "ngApp.config",
    "ui.router.state",
    "ui.bootstrap",
    "restangular",
    "gettext",
    "ngTagsInput",
    "ui.sortable",
    "ngTable",

    "ngApp.core",
    "ngApp.search",
    "ngApp.query",
    "ngApp.participants",
    "ngApp.files",
    "ngApp.annotations",
    "ngApp.home",
    "ngApp.projects",
    "ngApp.cases",
    "ngApp.components",
    "ngApp.cart",
    "ngApp.notFound",
    "ngApp.reports",
    "templates"
  ])
  .config(appConfig)
  .factory('RestFullResponse', function(Restangular: Restangular.IService) {
    return (<any>Restangular).withConfig(function(RestangularConfigurer: Restangular.IProvider) {
      RestangularConfigurer.setFullResponse(true);
    })
    .addFullRequestInterceptor(addTokenToRequest);
  })
  .run(appRun)
  .factory('AuthRestangular', function(Restangular: Restangular.IService, config: IGDCConfig, CoreService: ICoreService) {
    return (<any>Restangular).withConfig(function (RestangularConfigurer: Restangular.IProvider) {
      RestangularConfigurer.setBaseUrl(config['site-wide']['auth'])
    })
      .addFullRequestInterceptor(addTokenToRequest)
      .addResponseInterceptor((data, operation: string, model: string, url, response, deferred) => {
        // Ajax
        CoreService.xhrDone();
        if (response.headers('content-disposition')) {
          return deferred.resolve({ 'data': data, 'headers': response.headers() });
        } else {
          return deferred.resolve(data);
        }
      });
  });

// Imports the Google Analytics script
// Attaches GA to the $window object. Access it using: $window.ga()
function loadGoogleAnalytics() {
  (function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
      (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * <any>new Date(); a = s.createElement(o),
      m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
  })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
}

//Gets customized configuration for UI and adds it to ngApp config
function fetch_config() {
  // Returns the GET so it can be 'thenable' for manually bootstrapping angular in app.ts
  return $.get('/api/custom', function (data) {
    console.log('fetching config');

    var config_data = {
      'config': data
    };

    // Creates the config module
    var config_module = angular.module('ngApp.config', []);

    // Adds the config values to angular module
    angular.forEach(config_data, function (value, key) {
      config_module.constant(key, value);
    });
  });
}

//Loads customConfig, then manually bootstraps AngularJS
angular.element(function(){
  fetch_config()
  .then(function(data){
    if (data.error) {
      // Was able to connect to API, but API encountered an error
      angular.module('ngApp', ['cgNotify'])
        .run(function(notify: ng.cgNotify.INotifyService){
          var message: string = 'Unable to retrieve configuration from the API.';
          displayError(message, notify);
        });
      angular.bootstrap(document, ['ngApp']);
    } 
    else {

      // successfully retrieved config from API
      // manually initialize angularjs
      console.log('bootstrapping now');
      angular.bootstrap(document, ['ngApp']);

    }
  })
  .fail(function(data){
    // Unable to connect to API
    angular.module('ngApp', ['cgNotify'])
      .run(function(notify: ng.cgNotify.INotifyService){
        var message: string = 'Unable to connect to the API.';
        displayError(message, notify);
      });
    angular.bootstrap(document, ['ngApp']);
  });
});
