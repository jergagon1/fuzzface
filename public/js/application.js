var myApp = myApp || {};
myApp.fuzzfinders = myApp.fuzzfinders || {};
myApp.fuzzfinders.model = myApp.fuzzfinders.model || {};
myApp.fuzzfinders.controller = myApp.fuzzfinders.controller || {};
myApp.fuzzfinders.view = myApp.fuzzfinders.view || {};

// set server api variable for local development - don't push to master branch
// myApp.fuzzfindersApiUrl = "http://localhost:3000";
myApp.fuzzfindersApiUrl = gon.api_server; // "https://fuzzfinders-demo.herokuapp.com/";
// set server api variable for deployment - leave uncommented in master branch
// myApp.fuzzfindersApiUrl = "http://fuzzfinders-api.herokuapp.com";

// Variable to set display length of pusher notifications in milliseconds
myApp.fuzzflashDisplayLength = 15000;


$(function() {
  // Model: convert a UTC/Zulu timestamp to local time
  window.convertUtcToLocal = function(utcTimestamp) {
    console.log("application.js convertUtcToLocal");
    var time = moment.utc(utcTimestamp);
    var timeString = time.local().format("ddd MM/DD/YYYY h:mm a");
    return timeString;
  };

  // Model: convert local time string to utc string
  window.convertLocalToUtc = function(localDateTimeString){
    console.log("application.js convertLocalToUtc");
    var localTimeObj = moment(localDateTimeString);
    var utcTimeObj = localTimeObj.utc();
    return utcTimeObj.format();
  };

  // Model: iterate through array of records and update timestamps in specific field
  window.updateTimestamps = function(recordArray, fieldToUpdate) {
    console.log("application.js updateTimestamps");
    for (var i = 0; i < recordArray.length; i++) {
      if(recordArray[i][fieldToUpdate] !== null){
        recordArray[i][fieldToUpdate] = convertUtcToLocal(recordArray[i][fieldToUpdate]);
      }
    }
  };

    // View: returns image icon url for lost or found reports based on reportType argument passed in
  window.selectIcon = function(reportType) {
    console.log("application.js selectIcon");
    if (reportType === 'lost') {
      return '/images/FuzzFinders_icon_orange.png'
    } else if (reportType === 'found') {
      return '/images/FuzzFinders_icon_blue.png'
    } else {
      console.log('no report type');
    }
  };

  window.createMapOnReportDetails = function(report, parentSelector) {
    var parentSelector = parentSelector;

    if (parentSelector && parentSelector.length) {
      console.log('true');
    } else {
      console.log('false');
      parentSelector = 'li.report[data-reportid="' + report.id + '"]';
    };

    var mapOptions = {
      zoom: 14,
      center: new google.maps.LatLng(report.lat, report.lng),
      streetViewControl: false,
      mapTypeControl: false,
      draggable: false,
      scrollwheel: false,
      panControl: false,
    };

    map = new google.maps.Map($('.report-detail-map-canvas', $(parentSelector))[0], mapOptions);

    maps.push(map);

    // google.maps.event.addListener(map, 'click', enableScrollingWithMouseWheel);

    // var infoWin = createMarkerInfoWindow(report);
    var marker = new google.maps.Marker({
      map: map,
      position: (new google.maps.LatLng(report.lat, report.lng)),
      icon: selectIcon(report.report_type),
      title: report.pet_name
    })
  };


  window.showModalWithReport = function (reportId, highlightCommentId) {
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

        console.log(12, 'createMapOnReportDetails');
        setTimeout(function () {
          createMapOnReportDetails(report, '.modal_report_' + report.id);
        }, 300);
        console.log(13, 'after createMapOnReportDetails');

        transformTimestamps();
      })
      .fail(function (response) {
      });
  };

  //========================== Model ==========================//


  //========================== View ==========================//

  // View: Toggle display of hamburger side menu
  var toggleDisplaySidebarMenu = function(){
    console.log("application.js toggleDisplaySidebarMenu");
    $("#wrapper").toggleClass("toggled");
  };

  //======================= Controller =======================//

  // Controller: check if element occurs on a page
  // global namespace to make available to other js files
  myApp.checkForElement = function(element){
    console.log("application.js myApp.checkForElement");
    return ($(element).length > 0) ? true : false;
  }

  window.transformTimestamps = function() {
    $.each($('.time'), function (i, el) {
      var momentObj = moment($(el).text());
      var relativeOrAbsoluteTime = null;

      if (Math.abs(momentObj.diff(new Date, 'hours')) <= 24) {
        relativeOrAbsoluteTime = momentObj.fromNow();
      } else {
        // relativeOrAbsoluteTime = momentObj.utc().format();
        relativeOrAbsoluteTime = $(el).text();
      };

      $(el).siblings().filter('.time-ago').text(relativeOrAbsoluteTime);
    });
  };

  // Controller: add event listener to sidebar menu button
  var addEventListenerToggleDisplaySidebarMenu = function(){
    console.log("application.js addEventListenerToggleDisplaySidebarMenu");
    $("#menu-toggle").click(function(event) {
      event.preventDefault();
      toggleDisplaySidebarMenu();
    });
  };

  // Controller: remove event listener to sidebar menu button
  var removeEventListenerToggleDisplaySidebarMenu = function(){
    console.log("application.js removeEventListenerToggleDisplaySidebarMenu");
    $("#menu-toggle").off()
  };

  // Controller: Instantiate chat widget
  var instantiateChatWidget = function(){
    console.log("application.js instantiateChatWidget");
    var pusher = new Pusher(gon.pusher_key);
    var chatWidget = new PusherChatWidget(pusher, {
      channelName: gon.channel_name,
    });
  };

  // Controller: Boolean to check if on fuzzfinders page and if the reports list is open
  var checkIfOnFuzzfindersPageAndReportsListOpen = function(){
    console.log("application.js checkIfOnFuzzfindersPageAndReportsListOpen");
    if(myApp.checkForElement(".fuzzfinders-buttons")){
      if($(".report-lists").is( ":hidden" )){
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  // Controller: Initialize FuzzFlash - Notification when new lost or found pet report created
  var initializeFuzzFlash = function(){
    // console.log("application.js initializeFuzzFlash");
    // var clearFuzzflash = function(reportId) {
    //   setTimeout(function() {
    //     $('.fuzzflash_' + reportId).remove();
    //   }, myApp.fuzzflashDisplayLength);
    // };
    // var pusher = new Pusher(gon.pusher_key);
    // var fuzzflashChannel = pusher.subscribe('fuzzflash');
    //
    // fuzzflashChannel.bind('report_created', function(fuzzflash){
    //   var showAllNotifications = !(gon.latitude && gon.longitude);
    //   var didIreportIt = false; // gon.user_id == fuzzflash.user_id;
    //   var distanceInMiles = distance(gon.latitude, gon.longitude, fuzzflash.latitude, fuzzflash.longitude);
    //   var settingsDistance = parseInt(Cookies.get('distance')) || 5;
    //
    //   if (didIreportIt) { return };
    //
    //   if (showAllNotifications || (distanceInMiles < settingsDistance)) {
    //     var message = fuzzflash.message;
    //     var reportId = fuzzflash.report_id;
    //     var reportType = fuzzflash.report_type;
    //
    //     $('div.notification ul').prepend('<li data-report-id=' + fuzzflash.report_id + ' class="fuzzflash_' + reportId + ' ' + reportType + '">' + message + '</li>').on('click', function (e) {
    //       showModalWithReport($(e.target).data('report-id'));
    //
    //       console.log('new report notification click', 'hello');
    //     });
    //
    //     clearFuzzflash(reportId);
    //   }
    //
    //   if(checkIfOnFuzzfindersPageAndReportsListOpen()){
    //     myApp.fuzzfinders.model.getRecentReports();
    //   }
    // });
  };


  // Controller: determine page and assign or remove event listeners
  var checkIfOnSignInUpPage = (function(){
    if(myApp.checkForElement(".public-page")){
      // on signInUp page
      // removeEventListenerToggleDisplaySidebarMenu();
      addEventListenerToggleDisplaySidebarMenu();
    } else {
      // on any other page
      instantiateChatWidget();
      initializeFuzzFlash();
      addEventListenerToggleDisplaySidebarMenu();
    }
  })(); // close IIFE checkIfOnSignInUpPage

}); // close document ready
