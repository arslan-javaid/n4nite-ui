(function () {
    'use strict';

    angular.module('app.inforniteTool', ['app.inforniteToolService'])
        .controller('InforniteToolController', InforniteToolController);

    InforniteToolController.$inject = ['InforniteToolService'];

    function InforniteToolController(InforniteToolService) {
        var vm = this;

        vm.fnGetGraphData = function () {
            InforniteToolService.fnGetGraphData()
                .then(function (data) {
                    vm.graphObj = data.data[0].graph;
                });
        };

        vm.fnInitInforniteTool = function () {
            vm.fnGetGraphData();
        };
    }
})();
