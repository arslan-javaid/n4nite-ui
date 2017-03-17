(function () {
    'use strict';
    
    angular.module('app.nodeService', [])    
    
    .factory('Node', ['$http', '$log', function($http, $log) {  
        function Node(nodeData) {
            if (nodeData) {
                this.setData(nodeData);
            }
            // Some other initializations related to book
        };
        
        Node.prototype = {
            setData: function(nodeData) {
                angular.extend(this, nodeData);
            },
            
            delete: function() {
                $http.delete('https://n4nite-api-n4nite.c9users.io/v1/imm/metrics/' + metricId);
            },
            
            update: function() {
                $http.put('https://n4nite-api-n4nite.c9users.io/v1/imm/metrics/' + metricId, this);
            },
            
            hasMetadata: function() {
                if (!this.node.metadata || this.node.metadata.length === 0) {
                    return false;
                }
                return this.node.metadata.some(function(metadata) {
                    return true
                });
            }
        };
        return Node;
    }]);
    
})();
