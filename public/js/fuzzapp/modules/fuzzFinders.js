var fuzzFindersModule = angular.module('fuzzFindersModule', ['ngAnimate', 'ngFileUpload', 'pusher-angular', 'ngCookies']);

fuzzFindersModule.controller('NotificationsController', [
  '$scope', '$http', '$rootScope', '$pusher', '$timeout', '$cookies', function ($scope, $http, $rootScope, $pusher, $timeout, $cookies) {
    $scope.notifications = [];

    $scope.showModalWithReport = function (report, highlightCommentId) {
      var reportId = report.report_id;

      console.log(reportId, 'REPORT LOADED');

      // firstable, we should get report's data
      $.getJSON(gon.api_server + '/api/v1/reports/' + reportId + '.json?user_email=' + gon.email + '&user_token=' + gon.auth_token)
      .success(function (response) {
        $('#reportDetailsModal').modal();

        var report = response.report, tags = response.tags, comments = response.comments;

        updateTimestamps([report], 'last_seen');
        updateTimestamps([report], 'created_at');
        updateTimestamps(comments, 'created_at');

        var html = Handlebars.compile($('#notifications-report-detail-template').html())({ report: report, tags: tags, comments: comments });
        var htmlTitle = Handlebars.compile($('#report-detail-title-template').html())({ report: report });


        $('#reportDetailsModal .modal-body .row').html('').html(html);
        $('#myModalLabel').html(htmlTitle);

        $('#reportDetailsModal .modal-content')
          .removeClass('modal-lost').removeClass('modal-found')
          .addClass('modal-' + report.report_type);

        if (highlightCommentId) {
          $('li.comment[data-commentid="' + highlightCommentId + '"]', $('.modal_report_comments')).addClass('highlighted');
        };

        // addEventListenerSubmitComment();

        setTimeout(function () {
          createMapOnReportDetails(report, '.modal_report_' + report.id);
        }, 300);

        transformTimestamps();
      }).fail(function (response) {
      });
    };

    $scope.newPush = function (data) {
      var o = { data: data }

      console.log($rootScope.mySubscriptions);
      var reportISubscribedOn = ($rootScope.mySubscriptions.indexOf(data.report_id) !== -1)

      var showAllNotifications = !(gon.latitude && gon.longitude);
      var didIreportIt = false; // gon.user_id == fuzzflash.user_id;
      var distanceInMiles = distance(gon.latitude, gon.longitude, data.latitude, data.longitude);
      var settingsDistance = parseInt($cookies.get('distance')) || 5;

      if (didIreportIt) { return };

      if (reportISubscribedOn || showAllNotifications || (distanceInMiles < settingsDistance)) {
        if (data.comment_id) {
          data['report_type'] = 'comment';
        };

        $scope.notifications.push(data);

        $timeout(function () {
          var reportId = this.data.report_id;

          $('.fuzzflash_' + reportId).fadeOut('slow');
        }.bind(o), 15000);
      }

      if (data.comment_id) {
        if (!$('li.comment[data-commentid="' + data.comment.id + '"]').length) {
          var selectedReportId = data.report_id; // $('li.report.lost-report').not('.unselected').data('reportid');
          console.log('reportID = ', selectedReportId);
          var $commentList = $('.comment-list[data-reportid="' + selectedReportId + '"]');
          var $commentList = $('.comment-list');
          var $commentListDiv = $('.comments-list-div[data-reportid="' + selectedReportId + '"]');

          showCommentsListDivIfHidden($commentListDiv);

          renderTemplates(
            { comment: data.comment },
            $("#comment-template"),
            $commentList
          );

          transformTimestamps();
        }
      };
    };

    var client = new Pusher(gon.pusher_key);
    var pusher = $pusher(client);

    var myChannel = pusher.subscribe('fuzzflash');

    myChannel.bind('report_created', $scope.newPush);
    myChannel.bind('report_commented', $scope.newPush);

    $rootScope.$on('subscriptions', function (event, subscriptions) {
      console.log('subscriptions = ', subscriptions);
      $rootScope.mySubscriptions = subscriptions;
    });

    $scope.$watch(
      function () {
        // TODO: rewrite with using Service or Factory
        return $rootScope.mySubscriptions;
      }, function (n, o) {
        console.log("!!!!!!!!!!!!!!!!!!!!!!!! changed ", n);
      }
    );

    // var $body = angular.element(document.body);   // 1
    // var $rootScope = $body.scope().$root;         // 2
    // $rootScope.$apply(function () {               // 3
    //   $rootScope.someText = 'This is BAD practice, dude ! :(';
    // });

    $http.get(
      gon.api_server + '/api/v1/subscriptions.json?user_email=' + gon.email + '&user_token=' + gon.auth_token
    ).success(function (response) { $rootScope.mySubscriptions = response });
  }]);

fuzzFindersModule.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}]);

fuzzFindersModule.controller('MenuController', ['$rootScope', '$scope', function ($rootScope, $scope) {
  $rootScope.$on('change-section', function (event, currentSection) {
    $scope.currentSection = currentSection;
  });

  $scope.changeSection = function (section) {
    console.log('MenuController changeSection()')
    if (section == $scope.currentSection) {
      $scope.currentSection = null;
    } else {
      $scope.currentSection = section;
    }

    $rootScope.$broadcast('section-changed', $scope.currentSection);

    // if ($scope.currentSection == 'lostSection') {
    //   google.maps.event.addDomListener(
    //     lostPetBtn,
    //     'click',
    //     $scope.initializeMap(lostMap, 'lost-map-canvas', '/images/FuzzFinders_icon_orange.png'));
    //
    // };
  };
}]);

fuzzFindersModule.controller('PetController', ['$rootScope', '$scope', 'Upload', '$http', function ($rootScope, $scope, Upload, $http) {
  $scope.maps = [];

  $scope.report = {};
  $scope.lostMap = null; $scope.foundMap = null;


  var initializeMap = function (mapName, canvasDivId, iconUrl) {
    var mapOptions = {
      zoom: 14,
      center: new google.maps.LatLng(37.7848676, -122.3978871),
      streetViewControl: false,
      mapTypeControl: false,
      scrollwheel: false,
      draggable: false,
    };

    mapName = new google.maps.Map(document.getElementById(canvasDivId), mapOptions);

    $scope.maps.push(mapName);

    // google.maps.event.addListener(mapName, 'click', enableScrollingWithMouseWheel);

    var success = function(position) {
      var lat = parseFloat(position.coords.latitude);
      var lng = parseFloat(position.coords.longitude);

      var pos = new google.maps.LatLng(lat, lng);

      var marker = new google.maps.Marker({
        map: mapName,
        position: pos,
        icon: iconUrl,
        draggable: true,
      });

      var markerLat = marker.position.A;  //marker latitude;
      var markerLong = marker.position.F;  //marker longitude

      var posInfoWindow = new google.maps.LatLng(markerLat + .0025, markerLong + .00001);

      var infowindow = new google.maps.InfoWindow({
        map: mapName,
        position: posInfoWindow,
        content: 'Current location. Drag to location pet was last seen.'
      });

      google.maps.event.addListener(marker, 'dragend', function() {
        lat = this.getPosition().lat();
        lng = this.getPosition().lng();

        $scope.report.lat = lat; $scope.report.lng = lng;
        infowindow.close();
      });

      mapName.setCenter(pos);
      $scope.report.lat = lat; $scope.report.lng = lng;
    }

    var failure = function(error) {
      handleNoGeolocation(false, mapName);
    };

    //User's Current Location
    if (gon.latitude && gon.longitude) {
      success(
        {
          coords: { latitude: gon.latitude, longitude: gon.longitude }
        }
      )
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, function() {
          geolocator.locateByIP(success, failure, 1);
        });
      } else {
        geolocator.locateByIP(success, failure, 1);
      }
    }
  };

  $scope.submit = function (report) {
    if (report.last_seen) {
      report['last_seen'] = moment(report.last_seen).format();
    }

    $.blockUI();

    $http({
      method: 'post',
      url: myApp.fuzzfindersApiUrl + "/api/v1/reports.json?user_email=" + gon.email + '&user_token=' + gon.auth_token,
      data: { report: report }
    }).then(function (response) {
      $scope.report = {
        user_id: report.user_id,
        report_type: report.report_type
      };

      $rootScope.mySubscriptions = response.data.report.subscriptions;

      $scope.image = null;

      $.unblockUI();

      // close current section
      $rootScope.$broadcast('change-section', null);
    }, function (response) {
      $.unblockUI();
    });
  };

  // TODO: merge 2 requests into one for uploading image and sending data
  $scope.uploadImage = function (file, report) {
    $.blockUI();

    file.upload = Upload.upload({
      method: 'post',
      url: gon.api_server + '/api/v1/images.json?user_email=' + gon.email + '&user_token=' + gon.auth_token,
      data: { image: file }
    }).then(function (response) {
      if (response.status == 200) {
        $.unblockUI();

        report.img_url = response.data.image.url
      }
    });
  };

  $rootScope.$on('section-changed', function (event, currentSection) {
    if (currentSection == 'lostSection') {
      setTimeout(function () {
        initializeMap($scope.lostMap, 'lost-map-canvas', '/images/FuzzFinders_icon_orange.png');
      }, 100);
    } else if (currentSection == 'foundSection') {
      setTimeout(function () {
        initializeMap($scope.foundMap, 'found-map-canvas', '/images/FuzzFinders_icon_blue.png');
      }, 100);
    };
  });
}]);
