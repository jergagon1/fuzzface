var fuzzappModule = angular.module('fuzzapp');

// TODO: do not use fuzzappModule local variable
fuzzappModule.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}]);

fuzzappModule.service('Geocoding', function ($http) {
  "use strict";

  this.parse = function (address, callback) {
    $.blockUI();

    (new google.maps.Geocoder()).geocode(
      {'address': address}, callback
    );

    $.unblockUI();
  };
});

fuzzappModule.controller('ReportsController', ['$scope']);

fuzzappModule.controller('MenuController', ['$rootScope', '$scope', function ($rootScope, $scope) {
  $rootScope.$on('change-section', function (event, currentSection) {
    var _currentSection = $scope.currentSection;

    $scope.currentSection = currentSection;

    if (_currentSection !== currentSection) {
      $rootScope.$broadcast('section-changed', currentSection);
    }
  });

  $scope.changeSection = function (section) {
    console.log('MenuController changeSection()');

    if ($scope.currentSection !== section) {
      $rootScope.$broadcast('change-section', section);
    } else {
      $rootScope.$broadcast('change-section', null);
    }
  };
}]);

fuzzappModule.controller('PetController', ['$rootScope', '$scope', 'Upload', '$http', 'Geocoding', function ($rootScope, $scope, Upload, $http, Geocoding) {
  'use strict';

  $scope.maps = [];
  $scope.report = {};
  $scope.marker = null;

  $scope.geocoding = function () {
    Geocoding.parse($scope.report.address, function (result, status) {
      if (status === 'OK' && result[0]) {
        var loc = result[0].geometry.location;
        var coords = [loc.lat(), loc.lng()];

        $scope.marker.setMap(null);

        var pos = new google.maps.LatLng(coords[0], coords[1]);

        $scope.marker = new google.maps.Marker({
          map: $scope._map,
          position: pos,
          icon: $scope.currentIcon,
          draggable: true
        });

        $scope._map.setCenter(pos);

        $scope.report.lat = coords[0];
        $scope.report.lng = coords[1];
      }
    });
  };

  var initializeMap = function (canvasDivId, iconUrl) {
    $scope.currentIcon = iconUrl;

    var mapOptions = {
      zoom: 14,
      center: new google.maps.LatLng(37.7848676, -122.3978871),
      streetViewControl: false,
      mapTypeControl: false,
      scrollwheel: false,
      draggable: false
    };

    $scope._map = new google.maps.Map(document.getElementById(canvasDivId), mapOptions);

    window.maps.push($scope._map);

    google.maps.event.addListener($scope._map, 'click', enableScrollingWithMouseWheel);

    var success = function(position) {
      var lat = parseFloat(position.coords.latitude);
      var lng = parseFloat(position.coords.longitude);

      var pos = new google.maps.LatLng(lat, lng);

      $scope.marker = new google.maps.Marker({
        map: $scope._map,
        position: pos,
        icon: iconUrl,
        draggable: true
      });

      var markerLat = $scope.marker.position.A;  //marker latitude;
      var markerLong = $scope.marker.position.F;  //marker longitude

      var posInfoWindow = new google.maps.LatLng(markerLat + .0025, markerLong + .00001);

      var infowindow = new google.maps.InfoWindow({
        map: $scope._map,
        position: posInfoWindow,
        content: 'Current location. Drag to location pet was last seen.'
      });

      google.maps.event.addListener($scope.marker, 'dragend', function() {
        lat = this.getPosition().lat();
        lng = this.getPosition().lng();

        $scope.report.lat = lat; $scope.report.lng = lng;
        infowindow.close();
      });

      $scope._map.setCenter(pos);
      $scope.report.lat = lat; $scope.report.lng = lng;
    };

    var failure = function(error) {
      handleNoGeolocation(false, $scope._map);
    };

    //User's Current Location
    if (gon.latitude && gon.longitude) {
      success({
        coords: { latitude: gon.latitude, longitude: gon.longitude }
      });
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, function() {
          geolocator.locateByIP(success, failure, 1);
        });
      } else geolocator.locateByIP(success, failure, 1);
    }
  };

  $scope.submit = function (report) {
    if (report.last_seen) {
      report['last_seen'] = moment(report.last_seen).format();
    }

    $.blockUI();

    // TODO: Service
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
    }, function (response) { $.unblockUI(); });
  };

  // TODO: merge 2 requests into one for uploading image and sending data
  $scope.uploadImage = function (file, report) {
    $.blockUI();

    // TODO: Service
    file.upload = Upload.upload({
      method: 'post',
      url: gon.api_server + '/api/v1/images.json?user_email=' + gon.email + '&user_token=' + gon.auth_token,
      data: { image: file }
    }).then(function (response) {
      if (response.status === 200) {
        $.unblockUI();

        report.img_url = response.data.image.url;
      }
    });
  };

  $rootScope.$on('section-changed', function (event, currentSection) {
    if (currentSection === 'lostSection' && $scope._type === 'lost') {
      setTimeout(function () {
        initializeMap('lost-map-canvas', '/images/FuzzFinders_icon_orange.png');
      }, 100);
    } else if (currentSection === 'foundSection' && $scope._type === 'found') {
      setTimeout(function () {
        initializeMap('found-map-canvas', '/images/FuzzFinders_icon_blue.png');
      }, 100);
    }
  });
}]);

fuzzappModule.controller('ReportsController', ['$rootScope', '$scope', function ($rootScope, $scope) {
  $rootScope.$on('section-changed', function (event, currentSection) {
    if (currentSection === 'reportsSection') {
      setTimeout(initializeReportMap, 300);
    }
  });
}]);

fuzzappModule.controller('ReportController', ['$scope', '$http', function ($scope, $http) {
  $scope.toggleReport = function (report) {
    if (report.details) {
      report.details = null;

      return;
    }

    var link = gon.api_server + "/api/v1/reports/" + report.id + "?user_email=" + gon.email + "&user_token=" + gon.auth_token;

    $http.get(link).then(function (response) {
      console.info('getting new data report');

      var data = response.data;

      $scope.map = null;
      $scope.comments = [];

      $scope.report = response.data.report;

      $scope.report.details = data;
      $scope.comments = data.comments;
      $scope.tags = data.tags;

      $('ul[data-reportid="' + report.id + '"]').find('li').remove();

      setTimeout(function () {
        var mapOptions = {
          zoom: 14,
          center: new google.maps.LatLng($scope.report.lat, $scope.report.lng),
          streetViewControl: false,
          mapTypeControl: false,
          scrollwheel: false,
          draggable: false
        };

        $scope.map = new google.maps.Map($('.map-canvas-' + report.id)[0], mapOptions);

        var marker = new google.maps.Marker({
          map: $scope.map,
          position: new google.maps.LatLng($scope.report.lat, $scope.report.lng),
          icon: '/images/FuzzFinders_icon_orange.png',
          draggable: false
        });

        $scope.map.setCenter(new google.maps.LatLng($scope.report.lat, $scope.report.lng));

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
          }
        });
      }, 300);
    }, function (response) {});
  };
}]);
