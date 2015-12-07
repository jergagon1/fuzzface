angular.module('fuzzapp').controller('NotificationsController', [
  '$scope', '$http', '$rootScope', '$pusher', '$timeout', '$cookies', function ($scope, $http, $rootScope, $pusher, $timeout, $cookies) {
    $scope.notifications = [];

    $scope.showModalWithReport = function (report, highlightCommentId) {
      console.info('showModalWithReport');

      var reportId = report.report_id;

      $.getJSON(gon.api_server + '/api/v1/reports/' + reportId + '.json?user_email=' + gon.email + '&user_token=' + gon.auth_token)
      .success(function (response) {
        $('#reportDetailsModal').modal();

        var report = response.report, tags = response.tags, comments = response.comments;

        updateTimestamps([report], 'last_seen');
        updateTimestamps([report], 'created_at');
        updateTimestamps(comments, 'created_at');

        var html = Handlebars.compile($('#notifications-report-detail-template').html())({ report: report, tags: tags, comments: comments });
        var htmlTitle = Handlebars.compile($('#report-detail-title-template').html())({ report: report });


        $('#reportDetailsModal .modal-body').html('<div class="row">' + html + '</div>');
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

          $('.fuzzflash_' + reportId).fadeOut('slow', function () {
            var self = this;

            var scope = { reportId: reportId, commentId: data.comment_id };

            $scope.$apply(function () {
              _.remove($scope.notifications, function (notification) {
                if (notification.comment_id) {
                  return (notification.comment_id == this.commentId && notification.report_id == this.reportId);
                } else {
                  return (notification.report_id == this.reportId);
                }
              }, scope);
            });
          });
        }.bind(o), 15000); // TODO: move this to service or constant
      }

      if (data.comment_id) {
        if (!$('li.comment[data-commentid="' + data.comment.id + '"]').length) {
          //debugger;
          var selectedReportId = data.report_id; // $('li.report.lost-report').not('.unselected').data('reportid');
          console.log('reportID = ', selectedReportId);
          var $commentList = $('.comment-list[data-reportid="' + data.report_id + '"]');
          //var $commentList = $('.comment-list');
          var $commentListDiv = $('.comments-list-div[data-reportid="' + data.report_id + '"]');

          showCommentsListDivIfHidden($commentListDiv);

          //debugger;

          if ($commentList) {
            renderTemplates(
              { comment: data.comment },
              $("#comment-template"),
              $commentList
            );

            transformTimestamps();
          }
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
