(function () {
    'use strict';

    angular.module('app', [
        'ui.router',
        'app.index',
        'app.nav.breadcrumbs',
        'app.nav.footer',
        'app.nav.header',
        'app.nav.menu',
        'app.directives.datepicker',
        'app.directives.about',
        'app.filters',
        'app.node',
        'app.directives.d3Bars',
        'app.d3',
        'app.d3Test'
    ]);
})();
