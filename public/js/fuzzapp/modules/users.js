var usersModule = angular.module('usersModule', ['ngSanitize']);

usersModule.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);

usersModule.controller('UsersController', ['$scope', function ($scope) {
  $scope.currentTab = 'signin';
}]);

usersModule.controller('SignInController', ['$scope', '$http', '$window', function ($scope, $http, $window) {
  $scope.title = 'SignInController';

  $scope.login = function (e) {
    e.preventDefault();

    $http({
      method: 'post',
      url: '/sign_in',
      params: { email: $scope.email, password: $scope.password }
    })
    .then(function (response) {
      if(response.data.error) {
        $scope.error = 'Wrong password or email';
      } else {
        $window.location.href = '/';
      }
    }, function (response) {
    });
  }
}]);

usersModule.controller('RestoreController', ['$scope', '$http', function ($scope, $http) {
  $scope.restore = function (e) {
    e.preventDefault();

    if ($scope.email) {
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

usersModule.controller('SignUpController', ['$scope', '$http', '$window', function ($scope, $http, $window) {
  $scope.signup = function (e) {
    e.preventDefault();

    if ($scope.email && $scope.password && $scope.username) {
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
          $window.location.href = '/';
        }
      }, function (response) {
      });

    } else {
      $scope.error = 'You must fill required fields';
    }
  }
}]);
