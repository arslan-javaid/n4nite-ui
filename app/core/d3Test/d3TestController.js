(function () {
    'use strict';

    angular.module('app.d3Test', [])    
        .controller('D3TestController', D3TestController);
            
        D3TestController.$inject = ['$log', '$scope'];
        
        function D3TestController( $log, $scope) {
            
            var vm = this;

            this.title = "D3 Test";
            
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
