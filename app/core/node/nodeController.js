(function () {
    'use strict';

    angular.module('app.node', ['app.nodeService', 'app.nodeManager'])    
        .controller('NodeController', NodeController);
            
        NodeController.$inject = ['nodeManager', '$log', '$scope'];
        
        function NodeController(nodeManager, $log, $scope) {
            
            var vm = this;
            
            //*************************************************************************
            //* Populate the nodes initially
            //*************************************************************************
            nodeManager.getNode(0).then(function(node) {
                vm.node = node;
            });
            
            //*************************************************************************
            //* Actions to take when a node is selected from the list
            //*************************************************************************
             vm.choose = function(node) {
                 vm.selected=node;
                 //vm.collapsed = true;
                 //var target = angular.element('collapsed');
                 //target = true;
                 //$log.info(target);
                 $log.info(vm.selected);
            };
            
            this.title = "DemoCtrl";
            
            $scope.d3Data = [
                {name: "Greg", score:98},
                {name: "Ari", score:96},
                {name: "Loser", score: 48}
            ];
             
             $scope.d3OnClick = function(item){
                alert(item.name);
              };
        }
})();
