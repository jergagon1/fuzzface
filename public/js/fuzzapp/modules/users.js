var usersModule = angular.module('usersModule', ['ngSanitize']);

usersModule.config(['$httpProvider', '$locationProvider', function($httpProvider, $locationProvider) {
  $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
  $locationProvider.html5Mode({ enabled: true, requireBase: false });
}]);


usersModule.controller('UsersController', ['$scope', function ($scope) {
  $scope.currentTab = 'signin';
}]);

usersModule.controller('SignInController', ['$scope', '$http', '$window', '$location', function ($scope, $http, $window, $location) {
  $scope.title = 'SignInController';

  $scope.login = function (e) {
    e.preventDefault();

    // TODO: Service
    $http({
      method: 'post',
      url: '/sign_in',
      params: { email: $scope.email, password: $scope.password }
    })
    .then(function (response) {
      if(response.data.error) {
        $scope.error = 'Wrong password or email';
      } else {
        var backUrl = $location.search().backUrl;
        var url = backUrl ? backUrl : '/';
        $window.location.href = url;
      }
    }, function (response) {
    });
  }
}]);

usersModule.controller('RestoreController', ['$scope', '$http', function ($scope, $http) {
  $scope.restore = function (e) {
    e.preventDefault();

    if ($scope.email) {
      // TODO: Service
      $http({
        method: 'post',
        url: '/send_instuctions',
        params: { email: $scope.email }
      }).then(function (response) {
        if (response.data.status == 'Ok') {
          $scope.email = '';
          $scope.error = '';
          $scope.message = 'We have sent password recovery instructions';
        } else {
          $scope.message = '';
          $scope.error = 'User not found';
        }
      }, function (response) {});
    } else {
    }
  };
}]);

usersModule.controller('SignUpController', ['$scope', '$http', '$window', '$location', function ($scope, $http, $window, $location) {
  $scope.signup = function (e) {
    e.preventDefault();

    if ($scope.email && $scope.password && $scope.username) {
      // TODO: Service
      $http({
        method: 'post',
        url: '/sign_up',
        params: { email: $scope.email, password: $scope.password, zipcode: $scope.zipcode, username: $scope.username }
      })
      .then(function (response) {
        if(response.data.errors) {
          $scope.error = response.data.errors;

          errorText = '';

          $.each(response.data.errors, function(key, value) {
            return errorText += "<li class=\"text-danger\"><strong>" + (key.replace(/^./, key[0].toUpperCase())) + "</strong>: " + ($.unique(value).join(',')) + "</li>";
          });

          $scope.errorText = errorText;
        } else {
          var backUrl = $location.search().backUrl;
          var url = backUrl ? backUrl : '/';
          $window.location.href = url;
        }
      }, function (response) {});
    } else {
      $scope.error = 'You must fill required fields';
    }
  }
}]);
