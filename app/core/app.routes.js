(function () {
    'use strict';

    angular.module('app')

            .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when('', '/node');
        $urlRouterProvider.when('/', '/node');
        $urlRouterProvider.otherwise('/');
        $stateProvider
                .state('root', {
                    abstract: true,
                    url: '/',
                    data: {
                        title: 'Home',
                        breadcrumb: 'Home'
                    },
                    views: {
                        'header': {
                            templateUrl: 'core/navigation/headerView.html',
                            controller: 'HeaderController',
                            controllerAs: 'HC'
                        },
                        'menu': {
                            templateUrl: 'core/navigation/menuView.html',
                            controller: 'MenuController',
                            controllerAs: 'MC'
                        },
                        'breadcrumbs': {
                            templateUrl: 'core/navigation/breadcrumbsView.html',
                            controller: 'BreadcrumbsController',
                            controllerAs: 'BC'
                        },
                        'content': {
                            template: 'Choose option from menu...'
                        },
                        'footer': {
                            templateUrl: 'core/navigation/footerView.html',
                            controller: 'FooterController',
                            controllerAs: 'FC'
                        }
                    }
                })
                .state('root.node', {
                    url: 'node',
                    data: {
                        title: 'Node',
                        breadcrumb: 'Node'
                    },
                    views: {
                        'content@': {
                            templateUrl: 'core/node/node.html',
                            controller: 'NodeController',
                            controllerAs: 'NE'
                        }
                    }
                })
                .state('root.d3Test', {
                    url: 'd3Test',
                    data: {
                        title: 'D3Test',
                        breadcrumb: 'D3Test'
                    },
                    views: {
                        'content@': {
                            templateUrl: 'core/d3Test/d3Test.html',
                            controller: 'D3TestController',
                            controllerAs: 'D3T'
                        }
                    }
                });
    }
})();
