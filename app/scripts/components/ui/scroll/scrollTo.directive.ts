module ngApp.components.ui.scrollTo {
  import IGDCWindowService = ngApp.core.models.IGDCWindowService;

  interface IScrollToAttributes extends ng.IAugmentedJQuery {
    href: string;
    scrollto: string;
  }

  //ORIGINAL
  /* @ngInject */
  // function ScrollTo($window: IGDCWindowService): ng.IDirective {
  //   return function ($scope, elm: ng.IAugmentedJQuery, attrs: IScrollToAttributes) {
  //     elm.bind("click", function (e) {
  //       var top;
  //       e.preventDefault();
  //
  //       if (attrs.href) {
  //         attrs.scrollto = attrs.href;
  //       }
  //
  //       top = $window.jQuery(attrs.scrollto).offset().top - 60;
  //       $window.jQuery("body,html").animate({ scrollTop: top }, 800);
  //     });
  //   };
  // }

  // NOTE: resolves above TS error
  function ScrollTo($window: IGDCWindowService): ng.IDirective {
    return {
      controller: ["$elm", function ($scope: ng.IScope, elm: ng.IAugmentedJQuery, attrs: IScrollToAttributes) {
        elm.bind("click", function (e) {
          var top;
          e.preventDefault();

          if (attrs.href) {
            attrs.scrollto = attrs.href;
          }

          top = $window.jQuery(attrs.scrollto).offset().top - 60;
          $window.jQuery("body,html").animate({ scrollTop: top }, 800);
        });
      }]
    };
  }

  angular.module("ui.scroll.scrollTo", [])
      .directive("scrollTo", ScrollTo);
}
