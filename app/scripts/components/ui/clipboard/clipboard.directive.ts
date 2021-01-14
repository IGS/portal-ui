module ngApp.components.ui.clipboard.directive {

  function CopyToClipboard(): ng.IDirective {
    return {
      restrict: 'AE',
      controller: function($window, $scope, $element) {
        this.$onInit = function() {
          $element.on('click', () => {
            //Create a hidden input element
            var textarea: any = angular.element('<textarea/>');
            textarea.css({
              position: 'fixed',
              opacity: 0
            });

            // apply manifest_id to hidden input
            var target_id = $element.attr('data-copy-selector');
            var element = document.getElementById(target_id);
            var manifest_id = element.innerHTML;
            textarea.val(manifest_id);

            // add input to browser
            // document.body.append(textarea);
            var body = angular.element($window.document.body);
            body.append(textarea);
            textarea[0].select();

            // copy manifest_id
            try {
              var successful = document.execCommand('copy');
              var msg = successful ? 'successful' : 'failed';
              console.log("Copy to Clipboard: " + msg);
            } catch(err) {
              console.log(err);
            }
            textarea.remove();
          });
        }; //end $onInit
      }
    };
  };

  angular.module("clipboard.directive", [])
    .directive("copyToClipboard", CopyToClipboard);
}
