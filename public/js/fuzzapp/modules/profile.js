var profileModule = angular.module('profileModule', ['ngFileUpload', 'ngSanitize']);

profileModule.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}]);

profileModule.controller('ProfileController', ['$scope', '$http', 'Upload', '$timeout', function ($scope, $http, Upload, $timeout) {
  var file = null;
  $scope.errorText = '';

  $scope.updateSession = function () {
    $http({
      url: '/update_session?user_id=' + gon.user_id + '&email=' + gon.email + '&token=' + gon.auth_token,
      method: 'post'
    }).then(function (response) {}, function (response) {});
  };

  $scope.successCallback = function (response) {
    $.unblockUI();

    if (response.data.status == 'Ok') {
      $scope.success = true;

      $scope.updateSession();

      $scope.errorText = null;
      $scope.user = response.data.user;

      $('.pusher-chat-widget-current-user-name').text(response.data.user.username);
    } else {
      $scope.success = false;

      $scope.errorText = '';

      $.each(response.data.errors, function(key, value) {
        return $scope.errorText += "<li class=\"text-danger\"><strong>" + (key.replace(/^./, key[0].toUpperCase())) + "</strong>: " + ($.unique(value).join(',')) + "</li>";
      });

      $scope.errors = response.data.errors;
    }
  };

  $scope.requestParams = function (file) {
    return {
      method: 'put',
      url: gon.api_server + '/api/v1/users/1.json?user_email=' + gon.email + '&user_token=' + gon.auth_token,
      data: {
        user: {
          image: file,
          username: $scope.user.username,
          zipcode: $scope.user.zipcode,
          password: $scope.user.password,
          password_confirmation: $scope.user.password_confirmation
        }
      }
    }
  };

  $scope.updateProfileWithImage = function (file) {
    file.upload = Upload.upload($scope.requestParams(file)).then($scope.successCallback, function (response) {
      if (response.status > 0)
        $scope.errorMsg = response.status + ': ' + response.data;
    }, function (evt) {
      // Math.min is to fix IE which reports 200% sometimes
      file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
  };

  $scope.updateProfileWithoutImage = function () {
    $http($scope.requestParams()).then($scope.successCallback, function (response) {});
  };

  $scope.updateProfile = function(file) {
    $.blockUI();

    if (file) {
      $scope.updateProfileWithImage(file);
    } else {
      $scope.updateProfileWithoutImage()
    }
  };
}]);
