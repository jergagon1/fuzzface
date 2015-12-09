var fuzzappModule = angular.module('fuzzapp');


fuzzappModule.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}]);

fuzzappModule.controller('ReportsController', ['$scope']);

fuzzappModule.controller('MenuController', ['$rootScope', '$scope', function ($rootScope, $scope) {
  $rootScope.$on('change-section', function (event, currentSection) {
    $scope.currentSection = currentSection;
  });

  $scope.changeSection = function (section) {
    console.log('MenuController changeSection()');

    if (section == $scope.currentSection) {
      $scope.currentSection = null;
    } else {
      $scope.currentSection = section;
    }

    $rootScope.$broadcast('section-changed', $scope.currentSection);
  };
}]);

fuzzappModule.controller('PetController', ['$rootScope', '$scope', 'Upload', '$http', function ($rootScope, $scope, Upload, $http) {
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
    };

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

fuzzappModule.controller('ReportsController', ['$rootScope', '$scope', function ($rootScope, $scope) {
  $rootScope.$on('section-changed', function (event, currentSection) {
    if (currentSection == 'reportsSection') {
      setTimeout(initializeReportMap, 300);
    }
  });
}]);

fuzzappModule.controller('ReportController', ['$scope', '$http', function ($scope, $http) {
  $scope.toggleReport = function (report) {
    if (report.details) {
      report.details = null;

      return;
    } else {
      //addEventListenerToAllGetReportDetails();
    }

    var link = gon.api_server + "/api/v1/reports/" + report.id + "?user_email=" + gon.email + "&user_token=" + gon.auth_token;

    $http.get(link).then(function (response) {
      var data = response.data;

      $scope.map = null;
      $scope.comments = [];

      report.details = data;
      $scope.comments = data.comments;
      $scope.tags = data.tags;

      $('ul[data-reportid="' + report.id + '"').find('li').remove();


      setTimeout(function () {
        var mapOptions = {
          zoom: 14,
          center: new google.maps.LatLng(report.lat, report.lng),
          streetViewControl: false,
          mapTypeControl: false,
          scrollwheel: false,
          draggable: false
        };

        $scope.map = new google.maps.Map($('.map-canvas-' + report.id)[0], mapOptions);

        var marker = new google.maps.Marker({
          map: $scope.map,
          position: new google.maps.LatLng(report.lat, report.lng),
          icon: '/images/FuzzFinders_icon_orange.png',
          draggable: false
        });

        angular.forEach($scope.comments, function (comment) {
          if (comment.lat && comment.lng) {
            var marker = new google.maps.Marker({
              map: $scope.map,
              position: new google.maps.LatLng(comment.lat, comment.lng),
              icon: '/images/FuzzFinders_icon_blue.png',
              draggable: false,
              animation: google.maps.Animation.DROP
            });

            // TODO: we should use only one InfoWindow
            var iw = new google.maps.InfoWindow({ content: comment.content });

            marker.addListener('click', function () {
              iw.open($scope.map, marker);
            });

            marker.addListener('mouseout', function () {
              iw.close();
            });
          };
        });

      }, 300);

      //initializeMap($scope.map, "lost-map-canvas", '/images/FuzzFinders_icon_orange.png', parentSelector);

    }, function (response) {
    });
  };



  //var getReportDetails = function($reportLi, $id) {
  //  removeReportDetails($reportLi);
  //  var link = myApp.fuzzfindersApiUrl + "/api/v1/reports/" + $id + "?user_email=" + gon.email + "&user_token=" + gon.auth_token;
  //  console.log(11, link);
  //  $.ajax({
  //      url: link,
  //      type: "GET",
  //      crossDomain: true,
  //      dataType: 'json'
  //    })
  //    .done(function(response){
  //      console.log(response);
  //      // render handlebars template
  //      updateTimestamps([response["report"]], "last_seen");
  //      updateTimestamps([response["report"]], "created_at");
  //      updateTimestamps(response["comments"], "created_at");
  //      // console.log(response);
  //      renderTemplates({
  //          report:     response["report"],
  //          tags:       response["tags"],
  //          comments:   response["comments"] },
  //        $('#report-detail-template'),
  //        $reportLi
  //      );
  //
  //
  //      if (response['report']['lng'] && response['report']['lat']) {
  //        createMapOnReportDetails(response['report']);
  //      }
  //
  //      transformTimestamps();
  //
  //      removeUnselectedClass($reportLi);
  //      toggleHideIcon($reportLi);
  //      hideReportSummaryOnDetailShow($reportLi);
  //
  //      // myApp.fuzzfinders.model.subscribeReportComments(response.report.id);
  //    })
  //    .fail(function(){
  //      console.log("report detail request failed");
  //    })
  //};








}]);
