(function () {
    'use strict';

    angular.module('app.inforniteToolService', [])
        .factory('InforniteToolService', InforniteToolService);

    InforniteToolService.$inject = ['$q', '$http'];

    function InforniteToolService($q, $http) {

        this.fnGetGraphData = function () {
            var defer = $q.defer();
            $http({
                method: 'GET',
                url: 'http://api.infornite.com/v1/imm/graph'
            }).then(function (success) {
                defer.resolve(success);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        };

        return this;
    }
})();
