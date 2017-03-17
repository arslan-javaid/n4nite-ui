(function () {
    'use strict';
    
    angular.module('app.nodeManager', [])   

    .factory('nodeManager', ['$http', '$q', 'Node', function($http, $q, node) {  
    var nodeManager = {
        _pool: {},
        _retrieveInstance: function(nodeId, nodeData) {
            var instance = this._pool[nodeId];

            if (instance) {
                instance.setData(nodeData);
            } else {
                instance = new node(nodeData);
                this._pool[nodeId] = instance;
            }

            return instance;
        },
        _search: function(nodeId) {
            return this._pool[nodeId];
        },
        _load: function(nodeId, deferred) {
            var scope = this;

            $http.get('https://n4nite-api-n4nite.c9users.io/v1/imm/').then(successCallback, errorCallback)
             
                function successCallback(nodeData){
                    //success code
                    var node = scope._retrieveInstance(nodeData.id, nodeData.data);
                    deferred.resolve(node);
                };
                
                function errorCallback(error){
                    //error code
                    deferred.reject();
                }
        },
        
        /* Public Methods */
        /* Use this function in order to get a node instance by it's id */
        getNode: function(nodeId) {
            var deferred = $q.defer();
            var node = this._search(nodeId);
            if (node) {
                deferred.resolve(node);
            } else {
                this._load(nodeId, deferred);
            }
            return deferred.promise;
        },
        
        /* Use this function in order to get instances of all the nodes */
        loadAllNodes: function() {
            var deferred = $q.defer();
            var scope = this;
            $http.get('https://n4nite-api-n4nite.c9users.io/v1/imm')
                .success(function(nodesArray) {
                    var nodes = [];
                    nodesArray.forEach(function(nodeData) {
                        var node = scope._retrieveInstance(nodeData.id, nodeData);
                        nodes.push(node);
                    });

                    deferred.resolve(nodes);
                })
                .error(function() {
                    deferred.reject();
                });
            return deferred.promise;
        },
        
        /*  This function is useful when we got somehow the node data and we wish to store it or update the pool and get a node instance in return */
        setnode: function(nodeData) {
            var scope = this;
            var node = this._search(nodeData.id);
            if (node) {
                node.setData(nodeData);
            } else {
                node = scope._retrieveInstance(nodeData);
            }
            return node;
        },

    };
    return nodeManager;
}]);
})();