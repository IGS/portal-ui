/* global module */

// The paths here are expressed from <ROOT>/node_modules/

var css = [
    'angular-ui-bootstrap/dist/ui-bootstrap-csp.css',
    'bootstrap/dist/css',
    'c3/c3.min.css',
    '@cgross/angular-notify/dist/angular-notify.min.css',
    'ngprogress-lite/ngprogress-lite.css',
    'ng-sortable/dist/ng-sortable.min.css',
    'ng-sortable/dist/ng-sortable.style.min.css',
    'ng-table/bundles/ng-table.min.css',
    'ng-tags-input/build/ng-tags-input.bootstrap.min.css',
    'ng-tags-input/build/ng-tags-input.min.css',
    // Font-awesome has both css and font files. It insists on looking for the
    // fonts in a "fonts" directory one level up from the main .css file like so:
    // ../fonts/<fontfile>. So, this forces our hand to deploy fonts in the CSS
    // directory.
    'font-awesome/css/font-awesome.min.css',
    'font-awesome/fonts'
];

var fonts = [
    'bootstrap/dist/fonts',
    'bootcards/dist/fonts/icomoon.eot',
    'bootcards/dist/fonts/icomoon.svg',
    'bootcards/dist/fonts/icomoon.ttf',
    'bootcards/dist/fonts/icomoon.woff'
];

var js = [
    'angular/angular.min.js',
    'angular-animate/angular-animate.min.js',
    'angular-aria/angular-aria.min.js',
    'angular-cache/dist/angular-cache.min.js',
    'angular-cookies/angular-cookies.min.js',
    'angular-drag-and-drop-lists/angular-drag-and-drop-lists.min.js',
    'angular-gettext/dist/angular-gettext.min.js',
    'angular-loader/angular-loader.min.js',
    'angular-sanitize/angular-sanitize.min.js',
    'angular-ui-bootstrap/dist/ui-bootstrap.js',
    'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
    '@uirouter/angularjs/release/angular-ui-router.min.js',
    'bootcards/dist/js/bootcards.min.js',
    'bootstrap/dist/js/bootstrap.min.js',
    'bowser//bowser.min.js',
    'c3/c3.min.js',
    '@cgross/angular-notify/dist/angular-notify.min.js',
    'd3/d3.min.js',
    'd3-tip/index.js',
    'immutable/dist/immutable.min.js',
    'file-saver/dist/FileSaver.min.js',
    'jquery/dist/jquery.min.js',
    //{dir: 'lodash/', dest: 'lodash'},
    'lodash/lodash.js',
    'moment/min/moment.min.js',
    'ngprogress-lite/ngprogress-lite.min.js',
    'ng-sortable/dist/ng-sortable.min.js',
    'ng-table/bundles/ng-table.min.js',
    'ng-tags-input/build/ng-tags-input.min.js',
    'restangular/dist/restangular.min.js'
];

module.exports = {'css': css, 'fonts': fonts, 'js': js};
