$(function(){

  //========================== Model ==========================//

  // Model: create variables to store map objects
  var lostMap, foundMap, reportMap;

  // Model: Add lat and lng value of marker to hidden form input field for submission with report
  var addLatLongAttr = function(lat, lng) {
    $('.hidden-lat-field').attr('value', lat);
    $('.hidden-lng-field').attr('value', lng);
  };

  // Model: convert a UTC/Zulu timestamp to local time
  var convertUtcToLocal = function(utcTimestamp) {
    var localTimestamp = new Date(utcTimestamp);
    var weekday = [
      "Sun.",
      "Mon.",
      "Tue.",
      "Wed.",
      "Thu.",
      "Fri.",
      "Sat."
    ];
    var dateIndex = localTimestamp.getDay();
    var day = weekday[dateIndex];
    return day + " " + localTimestamp.toLocaleString();
  };

  // Model: iterate through array of records and update timestamps in specific field
  var updateTimestamps = function(recordArray, fieldToUpdate) {
    for (var i = 0; i < recordArray.length; i++) {
      recordArray[i][fieldToUpdate] = convertUtcToLocal(recordArray[i][fieldToUpdate]);
    }
  };

  // // Model: retrieve comments for a particular report based on report ID
  // var getReportComments = function(reportId) {
  //   $.ajax({
  //     url: "http://localhost:3000/api/v1/reports/"+ reportId +"/comments",
  //     type: "get",
  //     dataType: "json",
  //   })
  //   .done(function(commentResponse) {
  //     updateTimestamps(commentResponse, "updated_at");
  //     renderComments(commentResponse, reportId);
  //     $('.comment-div').hide();
  //   })
  //   .fail(function(){
  //     console.log("Error loading comments");
  //   });
  // };

  // // Model: New comment submission
  // var commentFormSubmitEventListener = function(){
  //   $(document).on("click", ".submit-comment", function(event){
  //     event.preventDefault();
  //     var currentUserId = $('.reports-list').data().currentid;
  //     var reportId = $(this).data().id;
  //     var formData = $('.comment-'+ reportId).val();
  //     $.ajax({
  //       url: "http://localhost:3000/api/v1/reports/"+ reportId +"/comments",
  //       type: "post",
  //       dataType: "json",
  //       data: {
  //         comment: {
  //           user_id: currentUserId,
  //           content: formData
  //         }
  //       }
  //     })
  //     .done(function(response){
  //       renderComment([response], reportId);
  //     })
  //     .fail(function(){
  //       console.log("create comment fail");
  //     });
  //   });
  // };

  // Model: Retrieve reports in map area
  var mostRecentReportsAjax = function(sw, ne) {
    $.ajax({
      url: "http://localhost:3000/api/v1/reports/mapquery?sw="+ sw +"&ne="+ ne +"",
      type: "GET",
      crossDomain: true,
      dataType: 'json'
    })
    .done(function(response){
      $(".report").remove();
      createMarkers(response);
      updateTimestamps(response, "created_at");
      updateTimestamps(response, "last_seen");
      renderTemplates({ reports: response }, $('#report-list-template'), $('.reports-list'));
    })
    .fail(function(){
      console.log("reports request fail!");
    });
  };

  // Model: retrieve report details, tags and comments
  var getReportDetails = function($reportLi, $id){
    console.log("getReportDetails");
    $.ajax({
      url: "http://localhost:3000/api/v1/reports/" + $id + "",
      type: "GET",
      crossDomain: true,
      dataType: 'json'
    })
    .done(function(response){
      console.log(response);
      // render handlebars template
      renderTemplates({
        report: response["report"],
        tags: response["tags"],
        comments: response["comments"] },
        $('#report-detail-template'),
        $reportLi
      );
    })
    .fail(function(){
      console.log("report detail request failed");
    })
  };

  //========================== View ==========================//

  // View: DOM elements for google maps
  var lostPetBtn = document.getElementsByClassName("lost-pet")[0];
  var foundPetBtn = document.getElementsByClassName("found-pet")[0];
  var reportBtn = document.getElementsByClassName("report-btn")[0];
  // View: cached DOM
  var $lostPetButton = $(".lost-pet");
  var $foundPetButton = $(".found-pet");
  var $reportButton = $(".report-btn");
  var $fuzzfindersButtons = $(".fuzzfinders-buttons");
  var $body = $('body');

  var createMarkers = function(reports) {
    for(var i = 0; i < reports.length; i++ ) {
      if (reports[i].report_type === 'lost') {
        setMarkerType(reports[i]);
      } else if (reports[i].report_type === 'found') {
        setMarkerType(reports[i]);
      } else {
        console.log('no report type');
      }
    };
  };

  var setMarkerType = function(report) {
    report_lat = report.lat;
    report_lng = report.lng;
    var reportPos = new google.maps.LatLng(report_lat, report_lng);
    var marker = new google.maps.Marker({
      map: reportMap,
      position: reportPos,
      icon: selectIcon(report.report_type),
      title: report.pet_name
    })
  };

  // View: returns image icon url for lost or found reports based on reportType argument passed in
  var selectIcon = function(reportType) {
    if (reportType === 'lost') {
      return '/images/FuzzFinders_icon_orange.png'
    } else if (reportType === 'found') {
      return '/images/FuzzFinders_icon_blue.png'
    } else {
      console.log('no report type');
    }
  };

  // // View: Render handlebars templates for comments
  // var renderComments = function(comment, reportId) {
  //   var context = { comments: comment };
  //   var source =  $('#comment-template').html();
  //   var template = Handlebars.compile(source);
  //   var html = template(context);
  //   $('.comment-list-' + reportId).append(html);
  // };

  // // View: in reports list - show add'l info for a report w/ comments
  // var showReportDetails = function($report){
  //   console.log("showReportDetails");
  //   debugger
  //   $report.find('.report-detail').toggle();
  //   var $id = $report.data().reportid;
  //   // $('.comment-div-'+$id).toggle();
  // };

  // View: Render handlebars templates
  var renderTemplates = function(context, $templateLocation, $listLocation, prepend) {
    prepend = prepend || false;
    var source =  $templateLocation.html();
    var template = Handlebars.compile(source);
    var html = template(context);
    if(prepend){
      $listLocation.prepend(html);
    } else {
      $listLocation.append(html);
    }
  };

  // View: determine if button form section is hidden
  var checkIfFormSectionHidden = function($button){
    console.log("checkIfFormSectionHidden");
    if ($button.siblings().first().is(":hidden")){
      console.log("hidden");
      return true
    } else {
      return false
    }
  };

  //========================== Controller ==========================//

  // Controller: handle user agents that don't allow/support geolocation or if geolocation fails
  var handleNoGeolocation = function(errorFlag, noGeoMap) {
    // error flag indicates geolocation service failed
    // no error flag indicates broswer doesn't support geolocation
    if (errorFlag) {
      var content = 'Error: The Geolocation service failed.';
    } else {
      var content = 'Error: Your browser doesn\'t support geolocation.';
    }
    // set options for map infowindow
    var options = {
      map: noGeoMap,
      position: new google.maps.LatLng(37.7848676, -122.3978871),
      content: content
    };
    // create new map infowindow
    var infowindow = new google.maps.InfoWindow(options);
    // center map to default san francisco location
    noGeoMap.setCenter(options.position);
  };

  // Controller: Generic report submit map initialize
  var initializeMap = function(mapName, canvasDivId, iconUrl) {
    var mapOptions = {
      zoom: 14,
      center: new google.maps.LatLng(37.7848676, -122.3978871)
    };
    mapName = new google.maps.Map(document.getElementById(canvasDivId), mapOptions);

    //User's Current Location
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        lat = position.coords.latitude;
        lng = position.coords.longitude;

        var marker = new google.maps.Marker({
          map: mapName,
          position: pos,
          icon: iconUrl,
          draggable: true,
        });

        var markerLat;
        var markerLong;
        markerLat = marker.position.A  //marker latitude
        markerLong = marker.position.F  //marker longitude

        var posInfoWindow = new google.maps.LatLng(markerLat + .0025, markerLong + .00001);

        var infowindow = new google.maps.InfoWindow({
          map: mapName,
          position: posInfoWindow,
          content: 'Current location. Drag to location pet was last seen.'
        });

        google.maps.event.addListener(marker, 'dragend', function(){
            lat = this.getPosition().lat();
            lng = this.getPosition().lng();
            addLatLongAttr(lat,lng);
            infowindow.close();
        });

        mapName.setCenter(pos);
        addLatLongAttr(lat,lng);
      }, function() {
        handleNoGeolocation(true, mapName);
      });
    } else {
      // Browser doesn't support Geolocation
      handleNoGeolocation(false, mapName);
    }
  };

  // Controller: initialize map for lost pet report submission
  var initializeLostMap = function(){
    initializeMap(lostMap, "lost-map-canvas", '/images/FuzzFinders_icon_orange.png');
  };

  // Controller: initialize map for found pet report submission
  var initializeFoundMap = function(){
    initializeMap(foundMap, "found-map-canvas", '/images/FuzzFinders_icon_blue.png')
  };

  // Controller: initialize map for reports in area section
  var initializeReportMap = function() {
    var reportMapOptions = {
      zoom: 13
    };

    reportMap = new google.maps.Map(document.getElementById('report-map-canvas'),
        reportMapOptions);

    var input = /** @type {HTMLInputElement} */(
        document.getElementById('pac-input'));

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', reportMap);

     google.maps.event.addListener(autocomplete, 'place_changed', function() {
      var result = autocomplete.getPlace();
      var newLocationLat = result.geometry.location.A;
      var newLocationLng = result.geometry.location.F;
      var latLng = new google.maps.LatLng(newLocationLat, newLocationLng);
      var newSearchLocation = reportMap.setCenter(latLng);
        var currentLocationMarker = new google.maps.Marker({
          map: reportMap,
          position: latLng,
          title: "Current location"
        });
    });

    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = new google.maps.LatLng(position.coords.latitude,
                                         position.coords.longitude);
        lat = position.coords.latitude;
        lng = position.coords.longitude;

        var currentLocationMarker = new google.maps.Marker({
          map: reportMap,
          position: pos,
          title: "Current location"
        });

        var boundary;
        var ne;
        var sw;

        //get bounds of map
        google.maps.event.addListener(reportMap, 'bounds_changed', function() {
          boundary = reportMap.getBounds();
          console.log(boundary);
          ne_bounds = boundary.getNorthEast();
          sw_bounds = boundary.getSouthWest();
          ne_string = ne_bounds.toString();
          sw_string = sw_bounds.toString();

          ne = ne_bounds.toString().substr(1, ne_string.length-2);
          sw = sw_bounds.toString().substr(1, sw_string.length-2);
          console.log("googleMapReports.js line 56")
          console.log(ne);
          console.log(sw);
          mostRecentReportsAjax(sw, ne);
        });
        reportMap.setCenter(pos);
      }, function() {
        handleNoGeolocation(true, reportMap);
      });
    } else {
      // if browser doesn't support Geolocation
      handleNoGeolocation(false, reportMap);
    }
  };

  // Controller: Add maps DOM listener to initialize lost report map on lost a pet button click
  var addEventListenerInitializeLostMap = function(){
    google.maps.event.addDomListener(lostPetBtn, 'click', initializeLostMap);
  };

  // Controller: Remove DOM listener to lost a pet button
  var removeEventListenerInitializeLostMap = function(){
    google.maps.event.removeListener(lostPetBtn, 'click', initializeLostMap);
  }

  // Controller: Add maps DOM listener to initialize found report map on found a pet button click
  var addEventListenerInitializeFoundMap = function(){
    google.maps.event.addDomListener(foundPetBtn, 'click', initializeFoundMap);
  };

  // Controller: Remove DOM listener to found a pet button
  var removeEventListenerInitializeFoundMap = function(){
    google.maps.event.removeListener(foundPetBtn, 'click', initializeFoundMap);
  };

  // Controller: Add DOM listener to initialize report map on report button click
  var addEventListenerInitializeReportMap = function(){
    google.maps.event.addDomListener(reportBtn, 'click', initializeReportMap);
  };

  // Controller: Remove DOM listener to initialize report map on report button click
  var removeEventListenerInitializeReportMap = function(){
    google.maps.event.removeListener(reportBtn, 'click', initializeReportMap);
  };

  // Controller: Add delegated event listener to reports in reports list on click
  var addEventListenerGetReportDetails = function(){
    $body.on("click", ".report", function() {
      console.log("report clicked");
      $clickedReport = $(this);
      $reportId = $clickedReport.data("reportid");
      console.log($clickedReport);
      console.log($reportId);
      getReportDetails($clickedReport, $reportId);
    });
  };

  // Controller: Remove delegated event listener to reports in reports list
  var removeEventListenerGetReportDetails = function(){
    $body.off("click", ".report");
  };

  //--------------------- lost button ---------------------------//
  // Controller: bind events for lost pet form section
  var bindEventsLost = function(){
    // add lost button events
  };

  // Controller: remove event listeners for lost pet form section
  var removeEventsLost = function(){
    // remove lost button events
  };

  // Controller: Add event listener to lost button click
  var addEventListenerLostButtonClick = function(){
    $lostPetButton.on("click", function(event){
      event.preventDefault();
      // determine if open or closed
      if(checkIfFormSectionHidden($foundPetButton)){
        // bind events
        removeEventsFound();
        removeEventsReports();
        bindEventsLost();
      } else {
        // remove events
        removeEventsLost();
      }
    });
  };

  // Controller: remove event listener for lost button click
  var removeEventListenerLostButtonClick = function(){
    $lostPetButton.off("click");
  };

  //----------------------- found button -------------------------//

  // Controller: bind events for found pet form section
  var bindEventsFound = function(){
    // events for found button click
  };

  // Controller: remove events for found pet form section
  var removeEventsFound = function(){
    // remove events for found button click
  };

  // Controller: add event listener on click of found pet form button
  var addEventListenerFoundButtonClick = function(){
    $foundPetButton.on("click", function(event){
      event.preventDefault();
      // determine if open or closed
      if(checkIfFormSectionHidden($foundPetButton)){
        // bind events
        removeEventsLost();
        removeEventsReports();
        bindEventsFound();
      } else {
        // remove events
        removeEventsFound();
      }
    });
  };

  // Controller: remove event listener from found button
  var removeEventListenerFoundButtonClick = function(){
    $foundPetButton.off("click");
  };

  //--------------------- reports button -------------------------//

  // Controller: bind events for found pet form section
  var bindEventsReports = function(){
  };

  // Controller: remove events for found pet form section
  var removeEventsReports = function(){
  };

  // Controller: add event listener on click of found pet form button
  var addEventListenerReportButtonClick = function(){
    $reportButton.on("click", function(event){
      event.preventDefault();
      // determine if open or closed
      if(checkIfFormSectionHidden($reportButton)){
        // bind events
        removeEventsLost();
        removeEventsFound();
        bindEventsReports();
      } else {
        // remove events
        removeEventsReports();
      }
    });
  };

  // Controller: remove event listener for report button click
  var removeEventListenerReportButtonClick = function(){
    $reportButton.off("click");
  };

  //----------------------- page load ---------------------------//

  // Controller: enable or disable event listeners if on fuzzfinders page
  var initializeFuzzfindersMapsReports = (function(){
    if (checkForElement(".fuzzfinders-buttons")) {
      addEventListenerGetReportDetails();
      addEventListenerInitializeLostMap();
      addEventListenerInitializeFoundMap();
      addEventListenerInitializeReportMap();
      addEventListenerLostButtonClick();
      addEventListenerFoundButtonClick();
      addEventListenerReportButtonClick();

    } else {
      removeEventListenerGetReportDetails();
      removeEventListenerInitializeLostMap();
      removeEventListenerInitializeFoundMap();
      removeEventListenerInitializeReportMap();
      removeEventListenerLostButtonClick();
      removeEventListenerFoundButtonClick();
      removeEventListenerReportButtonClick();
    }
  })();

}); // close document ready