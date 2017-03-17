(function () {
    'use strict';

    angular.module('app.index', [])

            .controller('IndexController', IndexController);

    IndexController.$inject = ['$log'];

    function IndexController($log, todosService) {

    }
})();
