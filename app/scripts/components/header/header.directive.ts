module ngApp.components.header.directives {

  import IHeaderController = ngApp.components.header.controllers.IHeaderController;
  import ICartService = ngApp.cart.services.ICartService;

  interface IHeaderScope extends ng.IScope { //NOTE: added to resolve TS error
    cartSize: number;
  }


  /* @ngInject */
  function header(CartService: ICartService, $rootScope: ngApp.IRootScope): ng.IDirective {
    return {
      restrict: "E",
      templateUrl: "components/header/templates/header.html",
      controller: "HeaderController as hc",
      link: ($scope: IHeaderScope) => {
        $scope.cartSize = CartService.files.length;
        $rootScope.$on('cart-update', () => {
          $scope.cartSize = CartService.files.length;
          $scope.$evalAsync();
        });
      }
    };
  }

  angular
      .module("header.directives", [])
      .directive("ngaHeader", header);
}
