angular.module('fuzzapp')
  .controller('ReportModalController', ['Geocoding', '$http', 'Upload', '$timeout', '$scope', '$element', 'report', 'tags', 'title',
    function (Geocoding, $http, Upload, $timeout, $scope, $element, report, tags, title) {
    "use strict";

      console.log('ReportModalController opened');

      $scope.maps = [];
      $scope.report = {};
      $scope.marker = null;

      $scope.geocoding = function () {
        console.info('geocoding');
        Geocoding.parse($scope.r.address, function (result, status) {
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

            $scope.r.lat = coords[0];
            $scope.r.lng = coords[1];
          }
        });
      };

      $scope.closeModal = function() {
        //  Manually hide the modal using bootstrap.
        $element.modal('hide');

        //  Now close as normal, but give 500ms for bootstrap to animate
        close(null, 500);
      };

      $scope.submit = function () {
        $.blockUI({ baseZ: 10000 });

        var keys = ['pet_name', 'animal_type', 'lat', 'lng',
          'report_type', 'notes', 'img_url', 'age', 'breed', 'sex',
          'pet_size', 'color', 'last_seen', 'address'];

        var resultReport = _.pick($scope.r, function (value, key) {
          return (_.indexOf(keys, key) !== -1);
        });

        $http({
          url: gon.api_server + '/api/v1/reports/' + report.id + '.json?user_email=' + gon.email + '&user_token=' + gon.auth_token,
          method: 'put',
          dataType: 'json',
          data: { report: resultReport }
        }).success(function (response) {
          $.unblockUI();

          angular.element($('li[data-report-id="' + report.id + '"]')).scope().report = response;
          //$scope.report = response.data;

          $scope.closeModal();

          transformTimestamps();
        });
      };

      $scope.uploadImage = function (file, report) {
        $.blockUI({ baseZ: 10000 });

        // TODO: Service
        file.upload = Upload.upload({
          method: 'post',
          url: gon.api_server + '/api/v1/images.json?user_email=' + gon.email + '&user_token=' + gon.auth_token,
          data: { image: file }
        }).then(function (response) {
          if (response.status === 200) {
            $.unblockUI();

            $scope.r.img_url = response.data.image.url;
          }
        });
      };

      $('.datetimepicker').datetimepicker({
        formatTime: 'h:i a',
        format: 'm/d/Y h:i a',
        formatDate: 'm/d/Y',
        // formatTime: 'H:i A',
        step: 30,
        ampm: true,
        maxDate: 0
      });

      if (report.last_seen) {
        var momentObj = moment(report.last_seen);
        report.last_seen = momentObj.format('MM/DD/YYYY hh:mm a');
      }

      report.tag_list = _.map(tags, 'name').join(', ');
      $scope.r = report;

      $timeout(function () {
        (function () {
          var iconUrl = '/images/FuzzFinders_icon_' + (report.report_type === 'found' ? 'blue' : 'orange') + '.png';

          $scope._map = new google.maps.Map(document.getElementById('map-canvas-' + report.id), {
            zoom: 14,
            center: new google.maps.LatLng(report.lat, report.lng),
            streetViewControl: false,
            mapTypeControl: false,
            scrollwheel: false,
            draggable: false
          });

          $scope.marker = new google.maps.Marker({
            map: $scope._map,
            position: new google.maps.LatLng(report.lat, report.lng),
            icon: iconUrl,
            draggable: true
          });

          google.maps.event.addListener($scope.marker, 'dragend', function() {
            $scope.$apply(function () {
              $scope.r.lat = this.getPosition().lat();
              $scope.r.lng = this.getPosition().lng();
            }.bind(this));
          });

          // google.maps.event.addListener(mapName, 'click', enableScrollingWithMouseWheel);
        })();
      }, 300);


      // initialize map

      $scope.title = title;
      $scope.r = _.clone(report);
      $scope.formType = report.report_type;
      $scope.userId = gon.user_id;
  }])

  .directive('reportsFilter', function () {
  return {
    restrict: 'E',
    scope: false,
    replace: false,
    templateUrl: '/js/fuzzapp/modules/directives/reports-filter/index.html',

    controller: ['$scope', '$http', 'ModalService', function ($scope, $http, ModalService) {
      var reportMapMarkers = [];

      var link = gon.api_server + "/api/v1/reports/mapquery?user_email=" + gon.email + "&user_token=" + gon.auth_token;

      $scope.toggleFilter = function () {
        if ($scope.filter) {
          $scope.filter = null;
        } else {
          $scope.filter = true;
        }
      };

      var setMarkerType = function(report) {
        console.log("fuzzfindersMapsReports.js setMarkerType");
        //var infoWin = createMarkerInfoWindow(report);
        report_lat = report.lat;
        report_lng = report.lng;

        var reportPos = new google.maps.LatLng(report_lat, report_lng);

        var marker = new google.maps.Marker({
          map: window.reportMap,
          position: reportPos,
          icon: selectIcon(report.report_type),
          title: report.pet_name,
          report: report
        });

        marker.addListener('click', function () {
          var report = marker.report;

          var html = Handlebars.compile($('#report-detail-template').html())({report: report, modal: true});
          var htmlTitle = Handlebars.compile($('#report-detail-title-template').html())({report: report});

          $('#reportDetailsModal .modal-body .row').html('').html(html);
          $('#myModalLabel').html(htmlTitle);

          $('#reportDetailsModal .modal-content')
            .removeClass('modal-lost').removeClass('modal-found')
            .addClass('modal-' + report.report_type);

          //addEventListenerSubmitComment();

          $('body').off('submit', '.modal .new-comment-form');
          $('body').on("submit", ".modal .new-comment-form", function (event) {
            if (!$(this).find('.comment-text-input').val().length) {
              // prevents submit comment on empty textarea
              return false;
            }

            event.preventDefault();
            var $currentForm = $(this);
            var $currentFormData = $currentForm.serialize();
            var $currentReportId = $currentForm.children().last().data("reportid");

            var $reportId = report.id;

            var link = myApp.fuzzfindersApiUrl + "/api/v1/reports/" + $reportId + "/comments?user_email=" + gon.email + "&user_token=" + gon.auth_token;
            var $commentList = $(".comment-list[data-reportid=" + $reportId + "]");
            var $commentListDiv = $(".comments-list-div[data-reportid=" + $reportId + "]");

            $.ajax({
                url: link,
                type: "post",
                crossDomain: true,
                dataType: "json",
                data: $currentFormData
              })
              .done(function (response) {
                $('#reportDetailsModal .info').text('Comment has been posted');

                // update my subscriptions
                var $body = angular.element(document.body);
                var $rootScope = $body.scope().$root;
                // var resp = { data: response.data };

                $rootScope.$broadcast('subscriptions', response.subscriptions);

                $('.comment-text-input', $currentForm).val('');
                transformTimestamps();
              });
          });

          setTimeout(transformTimestamps, 100);

          $('#reportDetailsModal').modal();
          reportMapMarkers.push(marker);
        });
      };

      var createMarkers = function(reports) {
        console.log("!! createMarkers");
        for(var i = 0; i < reports.length; i++ ) {
          if (reports[i].report_type !== "") {
            setMarkerType(reports[i]);
          } else {
            console.log('no report type');
          }
        }
      };

      var removeReportMapMarkers = function(markerArray){
        console.log("!! removeReportMapMarkers");
        for(i = 0; i < markerArray.length; i++){
          markerArray[i].setMap(null);
        }
      };

      $scope.editReport = function (report, tags) {
        ModalService.showModal({
          templateUrl: "/js/fuzzapp/modules/services/modal/pet_form.html",
          controller: 'ReportModalController',
          inputs: {
            report: report,
            tags: tags,
            title: 'Hello, title',
            formType: 'found'
          }
        }).then(function(modal) {
          // The modal object has the element built, if this is a bootstrap modal
          // you can call 'modal' to show it, if it's a custom modal just show or hide
          // it as you need to.
          modal.element.modal();
          modal.close.then(function(result) {
            console.log('modal closed');
          });
        });
        //var reportId = report.id;
        //
        //var link = myApp.fuzzfindersApiUrl + '/api/v1/reports/' + reportId + '?user_email=' + gon.email + "&user_token=" + gon.auth_token;
        //
        //// TODO: replace with a Service
        //$.getJSON(link).done(function (response) {
        //  $('#reportDetailsModal .modal-body').html('');
        //
        //  var reportType = response.report.report_type;
        //
        //  $('#myModalLabel').text('Editing');
        //
        //  // TODO: replace with a Directive and Angular Bootstrap
        //  renderTemplates(
        //    {report: response['report'], tags: response['tags'], form_type: reportType},
        //    $('#report-form-template'),
        //    $('#reportDetailsModal .modal-body')
        //  );
        //
        //  var tags = [];
        //
        //  $.each(response['tags'], function (i, val) {
        //    tags.push(val.name);
        //  });
        //
        //  $('#reportDetailsModal form [name="report[tag_list]"]').val(tags.join(', '));
        //
        //
        //  // filling form with data
        //  $.each(response['report'], function (name, val) {
        //    var $el = $('#reportDetailsModal form [name="report[' + name + ']"]'),
        //      type = $el.attr('type');
        //
        //    switch (type) {
        //      case 'checkbox':
        //        $el.attr('checked', 'checked');
        //        break;
        //      case 'radio':
        //        $el.filter('[value="' + val + '"]').attr('checked', 'checked');
        //        break;
        //      default:
        //        $el.val(val);
        //    }
        //  });
        //
        //  if (response['report'].last_seen) {
        //    var momentObj = moment(response['report'].last_seen);
        //
        //    $('#reportDetailsModal form [name="report[last_seen]"]').val(momentObj.format('MM/DD/YYYY hh:mm a'));
        //  }
        //
        //  $('.datetimepicker').datetimepicker({
        //    formatTime: 'h:i a',
        //    format: 'm/d/Y h:i a',
        //    formatDate: 'm/d/Y',
        //    // formatTime: 'H:i A',
        //    step: 30,
        //    ampm: true,
        //    maxDate: 0,
        //  }); //.inputmask('99/99/9999 99:99 **');
        //
        //
        //  $('#reportDetailsModal').modal();
        //
        //  createDirectUploadForms();
        //
        //  setTimeout(function () {
        //    if (reportType == 'lost') {
        //      initializeLostMap('#reportDetailsModal');
        //    } else {
        //      initializeFoundMap('#reportDetailsModal');
        //    }
        //  }, 300);
        //
        //  $('#reportDetailsModal form').submit(function () {
        //    var ls = $('input[name="report[last_seen]"]', this);
        //    ls.val(moment(ls.val()).format());
        //
        //    var data = $(this).serialize();
        //
        //    var link = myApp.fuzzfindersApiUrl + "/api/v1/reports/" + reportId + "?user_email=" + gon.email + "&user_token=" + gon.auth_token;
        //
        //    // TODO: replace with a Service
        //    $.ajax({
        //        url: link,
        //        type: 'PUT',
        //        crossDomain: true,
        //        dataType: 'json',
        //        data: data
        //      })
        //      .done(function (response) {
        //        transformTimestamps();
        //
        //        $('#reportDetailsModal').modal('hide');
        //      }).fail(function () {
        //      console.log("report detail request failed");
        //    });
        //
        //    return false;
        //  });
        //});
      };

      $scope.getReports = function (params) {
        // TODO: replace with a Service
        $http({
          url: link + '&' + params,
          type: 'get',
          dataType: 'json'
        }).then(function (response) {
          removeReportMapMarkers(reportMapMarkers);
          createMarkers(response.data, reportMapMarkers);

          $scope.reports = response.data;

          setTimeout(transformTimestamps, 200);
        }, function (response) {});

        console.log('!!! Getting reports', params);
      }
    }],

    link: function (scope, element, attrs) {
      element.find(':input').on('change', function () {
        scope.getReports(element.find('form').serialize());
      });

      scope.$watch('sw', function () {
        scope.getReports(element.find('form').serialize());
      });
    }
  }
}).directive('reportsList', function () {
  return {
    restrict: 'E',
    scope: false,
    replace: false,
    templateUrl: '/js/fuzzapp/modules/directives/reports-filter/reports-list.html',
  }

}).filter('titleize', function () {
    return function(input) {
      return _.titleize(input);
    };
}).directive('commentForm', ['Upload', function (Upload) {
  return {
    restrict: 'E',
    scope: false,
    replace: true,
    templateUrl: '/js/fuzzapp/modules/directives/comment-form/index.html',

    controller: ['$scope', '$http', function ($scope, $http) {
      $scope.user = {
        id: gon.user_id,
        username: gon.username
      };

      $scope.togglePin = function () {
        if (!$scope.c) {
          $scope.c = {};
        }

        if ($scope.c.lat) {
          $scope.c.lat = null;
          $scope.c.lng = null;

          return;
        }

        $scope.c.lat = gon.latitude;
        $scope.c.lng = gon.longitude;
      };

      $scope.submitComment = function (image) {
        var comment = $scope.c;

        if (image) {
          comment.image = image;
        } else {

        };

        if (comment.content && $scope.report.id) {
          $.blockUI();
          comment['report_id'] = $scope.report.id;

          // TODO: replace with a Service
          Upload.upload({
            method: 'post',
            url: gon.api_server + '/api/v1/reports/' + $scope.report.id + '/comments?user_email=' + gon.email + '&user_token=' + gon.auth_token,
            data: { comment: comment }
          }).then(function (response) {
            $scope.c = {};
            $scope.image = null;
            $scope.mapName = null;
            $.unblockUI();
          }, function (response) {});
        }
      };
    }]
  }
}]).directive('commentsList', function () {
  return {
    restrict: 'E',
    scope: false,
    replace: true,
    templateUrl: '/js/fuzzapp/modules/directives/comments-list/index.html',
    link: function (scope, element, attributes) {
      transformTimestamps();
    },
    controller: ['$scope', function ($scope) {
      $scope.$watch('comments', function (newValue) {
        if (newValue) {
          setTimeout(transformTimestamps, 100);
        }
      })
    }]
  }
}).directive('reportField', function () {
  return {
    restrict: 'E',
    scope: { label: '@', value: '=', condition: '=' },
    replace: true,
    templateUrl: '/js/fuzzapp/modules/directives/report-field/index.html'
  }
});
// .directive('reportDetails', function () {
//  return {
//    restrict: 'E',
//    replace: false,
//    templateUrl: '/js/fuzzapp/modules/directives/reports-filter/report-details.html',
//    scope: false,
//    //controller: ['$scope', function ($scope) {
//    //  //$scope.$watch('details', function(value) {
//    //  //  $scope.slug = $scope.details.report.slug;
//    //  //  //debugger;
//    //  //  console.info('details');
//    //  //})
//    //}],
//    //link: function (scope, element, attrs) {
//    //  //debugger;
//    //  //scope.$watch('details', function(value) {
//    //  //  scope.slug = scope.details.report.slug;
//    //  //  debugger;
//    //  //})
//    //
//    //
//    //  element.on('click', function (e) {
//    //    if (e.target.tagName != 'A') {
//    //      console.info('clicked');
//    //
//    //      return false;
//    //    } else {
//    //      //debugger;
//    //    }
//    //  });
//    //}
//  }
//});