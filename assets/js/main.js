angular.module('app', ['vesparny.fancyModal'])
    .controller('MainCtrl', ['$scope', '$rootScope', '$http', '$fancyModal', function($scope, $rootScope, $http, $fancyModal) {
        $scope.results;
        $scope.error;

        function success(response) {
            $scope.loading = true;
            $rootScope.results = response.data;
        }

        function error(error) {
            $scope.loading = true;
            $scope.error = error;
        }


        $scope.keyPress = function(ev) {
            $scope.pressed = ev.which;
            alert($scope.pressed);
        };

        $http({
                url: 'http://localhost:1339/fetch',
                method: 'GET',
                cache: true
            })
            .then(success, error);

        $scope.imagePopup = function(index) {

            $fancyModal.open({
                templateUrl: '/templates/popup.html',
                controller: ['$scope', function($scope) {
                    $scope.index = index;
                    $scope.swipe = function(interval) {
                        $scope.index += parseInt(interval);
                    };




                }]

            });
        };

    }])
    .directive('results', [function() {
        return {
            restrict: 'E',
            templateUrl: '/templates/results.html'
        };
    }]);
