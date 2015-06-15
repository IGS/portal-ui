module ngApp.components.quickSearch.directives {
  enum KeyCode {
    Space = 32,
    Enter = 13,
    Esc = 27,
    Left = 37,
    Right = 39,
    Up = 38,
    Down = 40,
    Tab = 9
  }

  /* @ngInject */
  function QuickSearch($modal: any, $window: ng.IWindowService, $modalStack): ng.IDirective {
    return {
      restrict: "A",
      controller: function($scope) {
        var modalInstance;

        $scope.$on("$stateChangeStart", () => {
          if (modalInstance) {
            modalInstance.close();
          }
        });

        this.openModal = () => {
          // Modal stack is a helper service. Used to figure out if one is currently
          // open already.
          if ($modalStack.getTop()) {
            return;
          }

          modalInstance = $modal.open({
            templateUrl: "components/quick-search/templates/quick-search-modal.html",
            backdrop: true,
            keyboard: true,
            animation: false,
            size: "lg"
          });
        };
      },
      link: function($scope, $element, attrs, ctrl) {
        $element.on("click", function() {
          ctrl.openModal();
        });

        angular.element($window.document).on("keypress", (e) => {
          var validSpaceKeys = [
            0, // Webkit
            96 // Firefox
          ];

          if (e.ctrlKey && validSpaceKeys.indexOf(e.which) !== -1) {
            e.preventDefault();
            ctrl.openModal();
          }
        });
      }
    };
  }

  /* @ngInject */
  function QuickSearchDropdown(): ng.IDirective {
    return {
      restrict: "E",
      templateUrl: "components/quick-search/templates/quick-search-dropdown.html",
      scope: true
    };
  }

  /* @ngInject */
  function QuickSearchInput(QuickSearchService: IQuickSearchService, FacetService,
                            $compile: ng.ICompileService, $modalStack): ng.IDirective {
    return {
      restrict: "E",
      replace: true,
      templateUrl: "components/quick-search/templates/quick-search-input.html",
      link: function($scope, element) {
        $scope.results = [];

        $scope.keyboardListener = function(e: any) {
          function selectItem(dir) {
            var newIndex;

            _.forEach($scope.results.hits, (elem, index) => {
              if (_.isEqual(elem, $scope.selectedItem)) {
                if (dir === "down" && index + 1 < $scope.results.hits.length) {

                  newIndex = index + 1;
                } else if (dir === "up" && index - 1 >= 0) {
                  newIndex = index - 1;
                } else {
                  newIndex = index;
                }
              }
            });

            $scope.selectedItem.selected = false;
            $scope.results.hits[newIndex].selected = true;
            $scope.selectedItem = $scope.results.hits[newIndex];
            QuickSearchService.getDetails($scope.selectedItem._type, $scope.selectedItem._id)
              .then((data) => {
                $scope.displayItem = data;
              });
          }

          var key = e.which || e.keyCode
          
          switch (key) {
            case KeyCode.Enter:
              e.preventDefault();
              if (!$scope.selectedItem) {
                return;
              }

              QuickSearchService.goTo($scope.selectedItem._type, $scope.selectedItem._id);
              break;
            case KeyCode.Up:
              e.preventDefault();
              selectItem("up");
              break;
            case KeyCode.Down:
              e.preventDefault();
              selectItem("down");
              break;
            case KeyCode.Esc:
              $modalStack.dismissAll();
              break;
            case KeyCode.Tab:
              e.preventDefault();
              break;
          }
        };

        $scope.itemHover = function(item: any) {
          $scope.selectedItem.selected = false;
          item.selected = true;
          $scope.selectedItem = item;
          QuickSearchService.getDetails($scope.selectedItem._type, $scope.selectedItem._id)
            .then((data) => {
              $scope.displayItem = data;
            });
        };

        $scope.search = function() {
          $scope.searchQuery = $scope.searchQuery.trim();

          if (!$scope.searchQuery || $scope.searchQuery.length < 2) {
            $scope.results = [];
            $scope.selectedItem = null;
            $scope.displayItem = null;
            return;
          }

          FacetService.searchAll($scope.searchQuery)
          .then((data) => {
            if (!data.length) {
              $scope.selectedItem = null;
            }

            $scope.results = _.assign({}, data);

            if (!$scope.results.hits.length) {
              return;
            }

            $scope.results.hits[0].selected = true;
            $scope.selectedItem = $scope.results.hits[0];

            QuickSearchService.getDetails($scope.selectedItem._type, $scope.selectedItem._id)
              .then((data) => {
                $scope.displayItem = data;
              });
          });
        };

        element.after($compile("<quick-search-dropdown></quick-search-dropdown>")($scope));
      }
    };
  }

  class Highlight {
    constructor($rootScope: ng.IScope) {
      return function (value: string, query: string) {
        if (!value) {
          return "";
        }

        var regex = new RegExp("[" + query.replace(/\-/g, "\\-") + "]{" + query.length + "}", "gi");

        var matchedText = value.match(regex);

        if (!matchedText) {
          return "";
        }

        matchedText = matchedText[0];
        var boldedQuery = "<span class='bolded'>" + matchedText + "</span>";
        value = value.replace(regex, boldedQuery);

        return value;
      };
    }
  }

  angular
    .module("quickSearch.directives", [
      "ui.bootstrap.modal",
      "facets.services",
      "quickSearch.services"
    ])
    .filter("highlight", Highlight)
    .directive("quickSearchDropdown", QuickSearchDropdown)
    .directive("quickSearchInput", QuickSearchInput)
    .directive("quickSearch", QuickSearch);
}
