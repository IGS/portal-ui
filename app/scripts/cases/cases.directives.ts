module ngApp.cases.directives {

  interface ICasesScope extends ng.IScope {
    filterKeyValues: any,
    fields: any,
    expands: any,
    size: any,
    filename: string,
    fileType: string,
    textNormal: string,
    textInProgress: string,
    styleClass: string,
    icon: string,
    ngDisabled: any,
    active: boolean,
    download: any
  }

  const ExportCasesButton = (config: IGDCConfig): ng.IDirective => ({
    restrict: 'E',
    replace: true,
    scope: {
      filterKeyValues: '=',
      fields: '=',
      expands: '=',
      size: '=',
      filename: '=',
      fileType: '@',
      textNormal: '@',
      textInProgress: '@',
      styleClass: '@',
      icon: '@',
      ngDisabled: '='
    },
    template: '<button tabindex="0" ng-class="[styleClass || \'btn btn-primary\']" data-downloader> \
              <i class="fa {{icon || \'fa-download\'}}" ng-class="{\'fa-spinner\': active, \'fa-pulse\': active}" /> \
              <span ng-if="textNormal"><span ng-if="! active">&nbsp;{{ textNormal }}</span> \
                <span ng-if="active">&nbsp;{{ ::textInProgress }}</span></span></button>',
    link: (scope: ICasesScope, $element, $attrs) => {
      $element.on('click', () => {
        if (!scope.ngDisabled) {
          const reportStatus = _.isFunction(scope.$parent['reportStatus'])
            ? _.partial(scope.$parent['reportStatus'], scope.$id)
            : (_isActive: boolean) => {};

          const inProgress = () => {
            scope.active = true;
            reportStatus(scope.active);
            $attrs.$set('disabled', 'disabled');
          };

          const done = () => {
            scope.active = false;
            reportStatus(scope.active);
            $element.removeAttr('disabled');
          };

          const url = config['auth-api'] + '/samples';

          const filters = {
            op: 'and',
            content: _.values(_.mapValues(scope.filterKeyValues, (value, key) => ({
              op: 'in',
              content: {
                field: key,
                value: [].concat(value)
              }
            })))
          };

          const params = _.merge({
            attachment: true,
            filters: filters,
            fields: ['case_id'].concat(scope.fields || []).join(),
            expand: [].concat(scope.expands || []).join(),
            format: scope.fileType || 'JSON',
            pretty: true,
            size: scope.size || 10000
          }, scope.filename ? {filename: scope.filename} : {});

          const checkProgress = scope.download(params, url, () => $element, 'POST');

          checkProgress(inProgress, done);
        }
      });
      scope.active = false;
    }
  });

  angular.module('cases.directives', [])
    .directive('exportCasesButton', ExportCasesButton);
}
