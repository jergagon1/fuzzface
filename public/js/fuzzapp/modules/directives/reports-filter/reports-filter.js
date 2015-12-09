/**
 * Created by zudochkin on 04/12/15.
 */

angular.module('fuzzapp').directive('reportsFilter', function () {
  return {
    restrict: 'E',
    scope: false,
    replace: false,
    templateUrl: '/js/fuzzapp/modules/directives/reports-filter/index.html',

    controller: ['$scope', '$http', function ($scope, $http) {
      var reportMapMarkers = [];

      //debugger;
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

        // marker.report = report;

        //marker.addListener('mouseover', function() {
        //  infoWin.open(window.reportMap, marker);
        //});
        //marker.addListener('mouseout', function(){
        //  infoWin.close();
        //});

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

          $('body').off('submit', '.new-comment-form');
          $('body').on("submit", ".new-comment-form", function (event) {
            if (!$(this).find('.comment-text-input').val().length) {
              // prevents submit comment on empty textarea
              return false;
            }

            event.preventDefault();
            var $currentForm = $(this);
            var $currentFormData = $currentForm.serialize();
            var $currentReportId = $currentForm.children().last().data("reportid");

            // call commentSubmit function
            //submitComment($currentForm, $currentFormData, $currentReportId);

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
                var resp = {data: response.data};
                $rootScope.$broadcast('subscriptions', response.subscriptions);
                // $rootScope.$apply(function () {
                //   debugger;
                //   $rootScope.mySubscriptions;
                // }.bind(resp));

                $('.comment-text-input', $currentForm).val('');

                //console.log(response);
                //updateTimestamps([response], "created_at");
                //showCommentsListDivIfHidden($commentListDiv);
                // renderTemplates(
                //   { comment: response },
                //   $("#comment-template"),
                //   $commentList
                // );
                //resetFormInputs();
                // myApp.fuzzfinders.model.subscribeReportComments(response.report_id);
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
        };
      };

      var removeReportMapMarkers = function(markerArray){
        console.log("!! removeReportMapMarkers");
        for(i=0; i<markerArray.length; i++){
          markerArray[i].setMap(null);
        }
      };




      $scope.editReport = function (report) {

        var reportId = report.id;

        var link = myApp.fuzzfindersApiUrl + '/api/v1/reports/' + reportId + '?user_email=' + gon.email + "&user_token=" + gon.auth_token;

        $.getJSON(link).done(function (response) {
          // updateTimestamps([response["report"]], "last_seen");
          // updateTimestamps([response["report"]], "created_at");

          $('#reportDetailsModal .modal-body').html('');

          var reportType = response.report.report_type;

          $('#myModalLabel').text('Editing');

          renderTemplates(
            {report: response['report'], tags: response['tags'], form_type: reportType},
            $('#report-form-template'),
            $('#reportDetailsModal .modal-body')
          );

          var tags = [];

          $.each(response['tags'], function (i, val) {
            tags.push(val.name);
          });

          $('#reportDetailsModal form [name="report[tag_list]"]').val(tags.join(', '));


          // filling form with data
          $.each(response['report'], function (name, val) {
            var $el = $('#reportDetailsModal form [name="report[' + name + ']"]'),
              type = $el.attr('type');

            switch (type) {
              case 'checkbox':
                $el.attr('checked', 'checked');
                break;
              case 'radio':
                $el.filter('[value="' + val + '"]').attr('checked', 'checked');
                break;
              default:
                $el.val(val);
            }
          });

          var momentObj = moment(response['report'].last_seen);

          $('#reportDetailsModal form [name="report[last_seen]"]').val(momentObj.format('MM/DD/YYYY hh:mm a'));

          $('.datetimepicker').datetimepicker({
            formatTime: 'h:i a',
            format: 'm/d/Y h:i a',
            formatDate: 'm/d/Y',
            // formatTime: 'H:i A',
            step: 30,
            ampm: true,
            maxDate: 0,
          }); //.inputmask('99/99/9999 99:99 **');


          $('#reportDetailsModal').modal();

          createDirectUploadForms();

          setTimeout(function () {
            // initializeLostMap();
            if (reportType == 'lost') {
              initializeLostMap('#reportDetailsModal');
            } else {
              initializeFoundMap('#reportDetailsModal');
            }
            ;
          }, 300);

          $('#reportDetailsModal form').submit(function () {
            var ls = $('input[name="report[last_seen]"]', this);
            ls.val(moment(ls.val()).format());

            var data = $(this).serialize();

            var link = myApp.fuzzfindersApiUrl + "/api/v1/reports/" + reportId + "?user_email=" + gon.email + "&user_token=" + gon.auth_token;

            $.ajax({
                url: link,
                type: 'PUT',
                crossDomain: true,
                dataType: 'json',
                data: data
              })
              .done(function (response) {
                // console.log(response);
                transformTimestamps();

                $('#reportDetailsModal').modal('hide');

                //getReportDetails($('.report[data-reportid=' + reportId + ']'), reportId);

                // myApp.fuzzfinders.model.subscribeReportComments(reportId);
              }).fail(function () {
              console.log("report detail request failed");
            });

            return false;
          });
        });
      };














        $scope.getReports = function (params) {
        $http({
          url: link + '&' + params,
          type: 'get',
          dataType: 'json',
          //params: params
        }).then(function (response) {
          removeReportMapMarkers(reportMapMarkers);
          createMarkers(response.data, reportMapMarkers);
          //debugger;
          $scope.reports = response.data;

          setTimeout(transformTimestamps, 200);
        }, function (response) {
        });



        //debugger;
        //$.ajax({
        //    url: link,
        //    type: "GET",
        //    crossDomain: true,
        //    dataType: 'json',
        //    data: $recentReportsForm.serialize()
        //  })
        //  .done(function(response){
        //    console.log(response);
        //    $(".report").remove();
        //    removeReportMapMarkers(reportMapMarkers);
        //    createMarkers(response, reportMapMarkers);
        //    updateTimestamps(response, "created_at");
        //    updateTimestamps(response, "last_seen");
        //    renderTemplates({ reports: response }, $('#report-list-template'), $('.reports-list'));
        //    populateDynamicReportsFilters(response);
        //
        //    transformTimestamps();
        //
        //    if($dynamicFilter){
        //      console.log("dynamic filter used");
        //      setDynamicFilterDropdownValue($dynamicFilter);
        //    } else {
        //      console.log("dynamic filter not used");
        //    }
        //  })
        //  .fail(function(){
        //    console.log("reports request fail!");
        //  });

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
          //$http({
          //  method: 'post',
          //  url: gon.api_server + '/api/v1/reports/' + $scope.report.id + '/comments?user_email=' + gon.email + '&user_token=' + gon.auth_token,
          //  data: { comment: comment }
          //}).then(function (response) {
          //  //$scope.comments.push(response.data);
          //
          //  $scope.c = {};
          //
          //  setTimeout(transformTimestamps, 100);
          //}, function (response) {
          //  console.error(response);
          //});
        }
      };
    }],

    link: function ($scope, $element, $attributes) {

    }
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
          //transformTimestamps();
        }
      })
    }]
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