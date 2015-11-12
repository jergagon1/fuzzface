$(function(){

  //========================== Model ==========================//

  // Model: create variables to store map objects
  var lostMap, foundMap, reportMap;
  var reportMapMarkers = [];

  // Model: Add lat and lng value of marker to hidden form input field for submission with report
  var addLatLongAttr = function(lat, lng) {
    console.log("fuzzfindersMapsReports.js addLatLongAttr");
    $('.hidden-lat-field').attr('value', lat);
    $('.hidden-lng-field').attr('value', lng);
  };

  // Model: set recent reports form hidden input values for SW and NE coordinates
  var setRecentReportsHiddenFormInputFields = function(southWestCoord,northEastCoord){
    console.log("fuzzfindersMapsReports.js setRecentReportsHiddenFormInputFields");
    $("input[name='sw']").attr('value', southWestCoord);
    $("input[name='ne']").attr('value', northEastCoord);
  };

  // Model: convert a UTC/Zulu timestamp to local time
  var convertUtcToLocal = function(utcTimestamp) {
    console.log("fuzzfindersMapsReports.js convertUtcToLocal");
    var time = moment.utc(utcTimestamp);
    var timeString = time.local().format("ddd MM/DD/YYYY h:mm a");
    return timeString;
  };

  // Model: iterate through array of records and update timestamps in specific field
  var updateTimestamps = function(recordArray, fieldToUpdate) {
    console.log("fuzzfindersMapsReports.js updateTimestamps");
    for (var i = 0; i < recordArray.length; i++) {
      if(recordArray[i][fieldToUpdate] !== null){
        recordArray[i][fieldToUpdate] = convertUtcToLocal(recordArray[i][fieldToUpdate]);
      }
    }
  };

  // Model: Remove the markers from the map
  var removeReportMapMarkers = function(markerArray){
    console.log("fuzzfindersMapsReports.js removeReportMapMarkers");
    for(i=0; i<markerArray.length; i++){
      markerArray[i].setMap(null);
    }
  };

  // Model: Retrieve reports in map area
  myApp.fuzzfinders.model.getRecentReports = function($dynamicFilter) {
    console.log("fuzzfindersMapsReports.js myApp.fuzzfinders.model.getRecentReports");
    var link = myApp.fuzzfindersApiUrl + "/api/v1/reports/mapquery?user_email=" + gon.email + "&user_token=" + gon.auth_token;
    $.ajax({
      url: link,
      type: "GET",
      crossDomain: true,
      dataType: 'json',
      data: $recentReportsForm.serialize()
    })
    .done(function(response){
      console.log(response);
      $(".report").remove();
      removeReportMapMarkers(reportMapMarkers);
      createMarkers(response, reportMapMarkers);
      updateTimestamps(response, "created_at");
      updateTimestamps(response, "last_seen");
      renderTemplates({ reports: response }, $('#report-list-template'), $('.reports-list'));
      populateDynamicReportsFilters(response);
      if($dynamicFilter){
        console.log("dynamic filter used");
        setDynamicFilterDropdownValue($dynamicFilter);
      } else {
        console.log("dynamic filter not used");
      }
    })
    .fail(function(){
      console.log("reports request fail!");
    });
  };

  // Model: retrieve report details, tags and comments
  var getReportDetails = function($reportLi, $id){
    console.log("fuzzfindersMapsReports.js getReportDetails");
    removeReportDetails($reportLi);
    var link = myApp.fuzzfindersApiUrl + "/api/v1/reports/" + $id + "?user_email=" + gon.email + "&user_token=" + gon.auth_token;
    console.log(11, link);
    $.ajax({
      url: link,
      type: "GET",
      crossDomain: true,
      dataType: 'json'
    })
    .done(function(response){
      console.log(response);
      // render handlebars template
      updateTimestamps([response["report"]], "last_seen");
      updateTimestamps([response["report"]], "created_at");
      updateTimestamps(response["comments"], "created_at");
      // console.log(response);
      renderTemplates({
        report:     response["report"],
        tags:       response["tags"],
        comments:   response["comments"] },
        $('#report-detail-template'),
        $reportLi
      );

      if (response['report']['lng'] && response['report']['lat']) {
        createMapOnReportDatails(response['report']);
      }


      removeUnselectedClass($reportLi);
      toggleHideIcon($reportLi);
      hideReportSummaryOnDetailShow($reportLi);
    })
    .fail(function(){
      console.log("report detail request failed");
    })
  };

  // Model: submit comment data to server api
  var submitComment = function($form, $formData, $reportId){
    console.log("fuzzfindersMapsReports.js submitComment");
    var link = myApp.fuzzfindersApiUrl + "/api/v1/reports/" + $reportId + "/comments?user_email=" + gon.email + "&user_token=" + gon.auth_token;
    var $commentList = $(".comment-list[data-reportid="+$reportId+"]");
    var $commentListDiv = $(".comments-list-div[data-reportid="+$reportId+"]");
    $.ajax({
      url: link,
      type: "post",
      crossDomain: true,
      dataType: "json",
      data: $formData
    })
    .done(function(response){
      console.log(response);
      updateTimestamps([response], "created_at");
      showCommentsListDivIfHidden($commentListDiv);
      renderTemplates(
        { comment: response },
        $("#comment-template"),
        $commentList
      );
      resetFormInputs();
      myApp.fuzzfinders.model.subscribeReportComments(response.report_id);
    })
    .fail(function(){
      console.log("comment creation failed");
    });
  };

  // Model: loop through an array of records and create a unique sorted array of a specific field value
  var createArrayUniqueValues = function(recordsArray, fieldKey){
    console.log("fuzzfindersMapsReports.js createArrayUniqueValues");
    var valuesArray = [];
    $.each(recordsArray, function (i, j) {
      if ($.inArray(j[fieldKey], valuesArray) == -1 && j[fieldKey] != "") {
        valuesArray.push(j[fieldKey]);
      }
    })
    return valuesArray.sort();
  };

  // Model: loop through array of records and create unique array of field containing an array value
  var createArrayUniqueNestedArrayValues = function(recordsArray, fieldKey){
    console.log("fuzzfindersMapsReports.js createArrayUniqueNestedArrayValues");
    var resultsArray = [];
    var unsortedArray = [];
    $.each(recordsArray, function (i, j) {
      if(j[fieldKey] != "") {
        var subArray = j[fieldKey]
        unsortedArray = unsortedArray.concat(subArray);
      }
    })
    // console.log(unsortedArray)
    $.each(unsortedArray, function (k, l) {
      if ($.inArray(l, resultsArray) == -1 && l != ""){
        resultsArray.push(l);
      }
    })
    // console.log(resultsArray);
    return resultsArray.sort();
  }

  //========================== View ==========================//

  // View: DOM elements for google maps
  var lostPetBtn = document.getElementsByClassName("lost-pet")[0];
  var foundPetBtn = document.getElementsByClassName("found-pet")[0];
  var reportBtn = document.getElementsByClassName("report-btn")[0];
  // View: cached DOM jQuery selections
  var $lostPetButton = $(".lost-pet");
  var $foundPetButton = $(".found-pet");
  var $reportButton = $(".report-btn");
  var $fuzzfindersButtons = $(".fuzzfinders-buttons");
  var $reportsList = $(".reports-list");
  var $recentReportsForm = $(".recent-reports-form");
  var $filterReportsButton = $(".filter-btn");
  var $tagsFilter = $(".tags-filter");

  // View: In reports list, hide the report summary when show the detailed report
  var hideReportSummaryOnDetailShow = function($li){
    console.log("fuzzfindersMapsReports.js hideReportSummaryOnDetailShow");
    $li.find(".hide-on-detail-show").hide();
  };

  // View: In reports list, show the report summary when close out the report details
  var showReportSummaryOnDetailClose = function($li){
    $li.find(".hide-on-detail-show").show();
  };

  // View: Set dropdown values for dynamic report dropdown filters
  var populateDynamicReportsFilters = function(reportsArray){
    console.log("fuzzfindersMapsReports.js populateDynamicReportsFilters");
    var breedArray = createArrayUniqueValues(reportsArray, "breed");
    removeValuesFromSelectDropdown($(".breed-select"));
    appendValuesToSelectDropdown($(".breed-select"), breedArray);
    var colorArray = createArrayUniqueValues(reportsArray, "color");
    removeValuesFromSelectDropdown($(".color-select"));
    appendValuesToSelectDropdown($(".color-select"), colorArray);
    var tagArray = createArrayUniqueNestedArrayValues(reportsArray, "report_taggings");
    console.log(tagArray);
    addTagsToAutocomplete($tagsFilter, tagArray);
  };

  // View: Add tag values to autocomplete input element
  var addTagsToAutocomplete = function($input, tagsArray){
    console.log("fuzzfindersMapsReport.js addTagsToAutocomplete");
    $input.tokenfield({
      autocomplete: {
        source: tagsArray,
        delay: 100
      },
      showAutocompleteOnFocus: true
    })
    $input.data('bs.tokenfield').$input.autocomplete({source: tagsArray});
  };

  // View: add array of tag values to hidden form input the filters report query by tags
  var addTagsToHiddenInput = function(tagValues){
    $(".hidden-tags").val(tagValues);
  };

  // View: remove tag values from hidden form input
  var removeTagsFromHiddenInput = function(){
    $(".hidden-tags").val("");
  };

  // View: if dynamic filter used set display value to filtered value
  var setDynamicFilterDropdownValue = function($dropdown){
    console.log("fuzzfindersMapsReports.js setDynamicFilterDropdownValue");
    $dropdown.prop("selectedIndex", 1);
  };

  // View: reset the form inputs
  var resetFormInputs = function(){
    console.log("fuzzfindersMapsReports.js resetFormInputs");
    $("input[type='text']").val('');
    $("textarea").val("");
    $("select").prop("selectedIndex", 0);
  };

  // View: Remove the option values from a select dropdown menu
  var removeValuesFromSelectDropdown = function($inputDropdown){
    console.log("fuzzfindersMapsReports.js removeValuesFromSelectDropdown");
    $inputDropdown.children().slice(1).remove();
  };

  String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  };

  // View: Append array values as options in select dropdown menu
  var appendValuesToSelectDropdown = function($inputDropdown, valueArray){
    console.log("fuzzfindersMapsReports.js appendValuesToSelectDropdown");
    var seloptions = "";
    $.each(valueArray,function(i){
        seloptions += '<option value="'+valueArray[i]+'">'+valueArray[i].capitalize()+'</option>';
    });
    $inputDropdown.append(seloptions);
  };

  // View: hide the reports filter form
  var hideReportFilterForm = function(){
    console.log("fuzzfindersMapsReports.js hideReportFilterForm");
    $recentReportsForm.hide();
  };

  // View: check if a div is hidden
  var checkIfDivHidden = function($div){
    console.log("fuzzfindersMapsReports.js checkIfDivHidden");
    if($div.is(":hidden")){
      return true
    } else {
      return false
    }
  };

  // View: show the report comments div if it is hidden
  var showCommentsListDivIfHidden = function($commentsDiv){
    console.log("fuzzfindersMapsReports.js showCommentsListDivIfHidden");
    if(checkIfDivHidden($commentsDiv)) {
      console.log("hidden");
      // if hidden display comments div
      $commentsDiv.show();
    } else {
      console.log("not hidden");
    }
  };

  //----------------- google maps markers ---------------------//

  // View: iterate through reports array and creates the markers
  var createMarkers = function(reports) {
    console.log("fuzzfindersMapsReports.js createMarkers");
    for(var i = 0; i < reports.length; i++ ) {
      if (reports[i].report_type !== "") {
        setMarkerType(reports[i]);
      } else {
        console.log('no report type');
      }
    };
  };

  var createMapOnReportDatails = function(report) {
    var mapOptions = {
      zoom: 14,
      center: new google.maps.LatLng(report.lat, report.lng),
      streetViewControl: false,
      mapTypeControl: false,
      draggable: false,
      scrollwheel: false,
      panControl: false,
    };

    map = new google.maps.Map(
      $('.report-detail-map-canvas', $('li.report[data-reportid="' + report.id + '"]'))[0],
      mapOptions
    );

    // var infoWin = createMarkerInfoWindow(report);
    var reportPos = new google.maps.LatLng(report.lat, report.lng);
    var marker = new google.maps.Marker({
      map: map,
      position: reportPos,
      icon: selectIcon(report.report_type),
      title: report.pet_name
    })
  };

  // View: create a marker for a report
  var setMarkerType = function(report) {
    console.log("fuzzfindersMapsReports.js setMarkerType");
    var infoWin = createMarkerInfoWindow(report);
    report_lat = report.lat;
    report_lng = report.lng;
    var reportPos = new google.maps.LatLng(report_lat, report_lng);
    var marker = new google.maps.Marker({
      map: reportMap,
      position: reportPos,
      icon: selectIcon(report.report_type),
      title: report.pet_name
    })
    marker.addListener('mouseover', function() {
      infoWin.open(reportMap, marker);
    });
    marker.addListener('mouseout', function(){
      infoWin.close();
    });
    reportMapMarkers.push(marker);
  };

  // View: returns image icon url for lost or found reports based on reportType argument passed in
  var selectIcon = function(reportType) {
    console.log("fuzzfindersMapsReports.js selectIcon");
    if (reportType === 'lost') {
      return '/images/FuzzFinders_icon_orange.png'
    } else if (reportType === 'found') {
      return '/images/FuzzFinders_icon_blue.png'
    } else {
      console.log('no report type');
    }
  };

  // View: create an info window for a report marker
  var createMarkerInfoWindow = function(report){
    console.log("fuzzfindersMapsReports createMarkerInfoWindow");
    var caption = report.report_type.capitalize();
    if (report.animal_type) {
      caption = caption + " " + report.animal_type.capitalize();
    } else {
      caption = caption + " " + "Pet"
    }
    if (report.pet_name) {
      caption = caption + " " + report.pet_name.capitalize();
    }
    var infoWindowContent =
      '<div class="info-window-content" data-reportid="' + report.id + '">' +
        '<img class="info-window-thumb" src="' + report.img_url + '">' +
        '<p class="info-window-text">' + caption + '</p>' +
      '</div>';
    var infowindow = new google.maps.InfoWindow({
      content: infoWindowContent
    });
    return infowindow;
  };

  // View: remove the report detail section for report li
  var removeReportDetails = function($reportLi){
    console.log("fuzzfindersMapsReports.js removeReportDetails");
    $reportLi.find(".report-summary").siblings().remove();
    showReportSummaryOnDetailClose($reportLi);
  };

  // View: Render handlebars templates
  var renderTemplates = function(context, $templateLocation, $listLocation, prepend) {
    console.log("fuzzfindersMapsReports.js renderTemplates");
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
    console.log("fuzzfindersMapsReport.js checkIfFormSectionHidden");
    if ($button.siblings().first().is(":hidden")){
      console.log("hidden");
      return true
    } else {
      return false
    }
  };

  // View: toggle display of report hide glyphicon
  var toggleHideIcon = function($reportListItem){
    console.log("fuzzfindersMapsReports.js toggleHideIcon");
    $reportListItem.find(".report-detail-hide").toggle();
  };

  // View: reset report summary
  var resetReport = function($reportListItem){
    console.log("fuzzfindersMapsReports.js resetReport");
    removeReportDetails($reportListItem);
    addUnselectedClass($reportListItem);
    toggleHideIcon($reportListItem);
    showReportSummaryOnDetailClose($reportListItem);
  };

  // View: slide down report filter form
  var slideDownReportFilterForm = function(){
    console.log("fuzzfindersMapsReports slideDownReportFilterForm");
    $recentReportsForm.slideDown("slow");
  };

  // View: slide up report filter form
  var slideUpReportFilterForm = function(){
    console.log("fuzzfindersMapsReports slideUpReportFilterForm");
    $recentReportsForm.slideUp("slow");
  };


  var addSelectedClassToFilterButton = function(){
    console.log("fuzzfindersMapsReports.js addSelectedClassToFilterButton");
    $filterReportsButton.addClass("selected-button");
  };

  var removeSelectedClassFromFilterButton = function(){
    console.log("fuzzfindersMapsReports.js removeSelectedClassFromFilterButton");
    $filterReportsButton.removeClass("selected-button");
  };

  var openReportFilterForm = function(){
    console.log("fuzzfindersMapsReports.js openReportFilterForm");
    slideDownReportFilterForm();
    addSelectedClassToFilterButton();
  };

  myApp.fuzzfinders.view.closeReportFilterForm = function(){
    console.log("fuzzfindersMapsReports.js myApp.fuzzfinders.view.closeReportFilterForm");
    slideUpReportFilterForm();
    removeSelectedClassFromFilterButton();
  };

  //========================== Controller ==========================//

  // Controller: handle user agents that don't allow/support geolocation or if geolocation fails
  var handleNoGeolocation = function(errorFlag, noGeoMap) {
    console.log("fuzzfindersMapsReports.js handleNoGeolocation");
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
    console.log("fuzzfindersMapsReports.js initializeMap");
    var mapOptions = {
      zoom: 14,
      center: new google.maps.LatLng(37.7848676, -122.3978871),
      streetViewControl: false,
      mapTypeControl: false,
      scrollwheel: false,
      draggable: false,
    };
    mapName = new google.maps.Map(document.getElementById(canvasDivId), mapOptions);

    var success = function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      lat = position.coords.latitude;
      lng = position.coords.longitude;

      // updateUserCoordinates(lat, lng);

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
    }

    var failure = function(error) {
      console.log(canvasDivId, error);
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

  // Controller: initialize map for lost pet report submission
  var initializeLostMap = function(){
    console.log("fuzzfindersMapsReports.js initializeLostMap");
    initializeMap(lostMap, "lost-map-canvas", '/images/FuzzFinders_icon_orange.png');
  };

  // Controller: initialize map for found pet report submission
  var initializeFoundMap = function(){
    console.log("fuzzfindersMapsReports.js initializeFoundMap");
    initializeMap(foundMap, "found-map-canvas", '/images/FuzzFinders_icon_blue.png')
  };

  // var getUsersLocation = function() {
  //   var html5Options = { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 };
  //   var ipFallbackIndex = 1; // Geo plugin
  //   geolocator.locate(onGeoSuccess, onGeoError, ipFallbackIndex, html5Options, 'map-canvas');
  // };

  // Controller: initialize map for reports in area section
  var initializeReportMap = function() {
    console.log("fuzzfindersMapsReports.js initializeReportMap");
    var reportMapOptions = {
      zoom: 13,
      streetViewControl: false,
      mapTypeControl: false,
      scrollwheel: false,
      draggable: false
    };

    reportMap = new google.maps.Map(document.getElementById('report-map-canvas'),
        reportMapOptions);

    var success = function(position) {
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
        // console.log(boundary);
        ne_bounds = boundary.getNorthEast();
        sw_bounds = boundary.getSouthWest();
        ne_string = ne_bounds.toString();
        sw_string = sw_bounds.toString();

        ne = ne_bounds.toString().substr(1, ne_string.length-2);
        sw = sw_bounds.toString().substr(1, sw_string.length-2);
        setRecentReportsHiddenFormInputFields(sw,ne);
        myApp.fuzzfinders.model.getRecentReports();
      });
      reportMap.setCenter(pos);
    };

    var failure = function(error) {
      handleNoGeolocation(false, reportMap);
    };


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

  // Controller: Add maps DOM listener to initialize lost report map on lost a pet button click
  var addEventListenerInitializeLostMap = function(){
    console.log("fuzzfindersMapsReports addEventListenerInitializeLostMap");
    google.maps.event.addDomListener(lostPetBtn, 'click', initializeLostMap);
  };

  // Controller: Remove DOM listener from lost a pet button
  var removeEventListenerInitializeLostMap = function(){
    console.log("fuzzfindersMapsReports removeEventListenerInitializeLostMap");
    google.maps.event.removeListener(lostPetBtn, 'click', initializeLostMap);
  }

  // Controller: Add maps DOM listener to initialize found report map on found a pet button click
  var addEventListenerInitializeFoundMap = function(){
    console.log("fuzzfindersMapsReports addEventListenerInitializeFoundMap");
    google.maps.event.addDomListener(foundPetBtn, 'click', initializeFoundMap);
  };

  // Controller: Remove DOM listener to found a pet button
  var removeEventListenerInitializeFoundMap = function(){
    console.log("fuzzfindersMapsReports removeEventListenerInitializeFoundMap");
    google.maps.event.removeListener(foundPetBtn, 'click', initializeFoundMap);
  };

  // Controller: Add DOM listener to initialize report map on report button click
  var addEventListenerInitializeReportMap = function(){
    console.log("fuzzfindersMapsReports.js addEventListenerInitializeReportMap");
    google.maps.event.addDomListener(reportBtn, 'click', initializeReportMap);
  };

  // Controller: Remove DOM listener to initialize report map on report button click
  var removeEventListenerInitializeReportMap = function(){
    console.log("fuzzfindersMapsReports.js removeEventListenerInitializeReportMap");
    google.maps.event.removeListener(reportBtn, 'click', initializeReportMap);
  };

  // Controller: Add delegated event listener to reports in reports list on click
  var addEventListenerToAllGetReportDetails = function(){
    console.log("fuzzfindersMapsReports.js addEventListenerToAllGetReportDetails");
    $reportsList.on("click", ".unselected", function() {
      console.log("report summary clicked");
      $clickedReport = $(this);
      $reportId = $clickedReport.data("reportid");
      getReportDetails($clickedReport, $reportId);
    });
  };

  // Controller: Remove delegated event listener to reports in reports list
  var removeEventListenerAllGetReportDetails = function(){
    console.log("fuzzfindersMapsReports.js removeEventListenerAllGetReportDetails");
    $reportsList.off("click", ".unselected");
  };

  // Controller: unselected class adds delegated event listener to show report details
  var addUnselectedClass = function($reportListItem){
    console.log("fuzzfindersMapsReports.js addUnselectedClass");
    $reportListItem.addClass("unselected");
  };

  // Controller: remove unselected class to disable delegated event listener to show report details
  var removeUnselectedClass = function($reportListItem){
    console.log("fuzzfindersMapsReports.js removeUnselectedClass");
    $reportListItem.removeClass("unselected");
  };

  // Controller: add event listener to hide icon in selected report
  var addEventListenerReportHideDetail = function(){
    console.log("fuzzfindersMapsReports.js addEventListenerReportHideDetail");
    $reportsList.on("click", ".report-detail-hide", function() {
      console.log("report hide clicked");
      $clickedReport = $(this).parent().parent().parent();
      console.log($clickedReport);
      resetReport($clickedReport);
    });
  };

  // Controller: remove event listener from hide icon in selected report
  var removeEventListenerReportHideDetail = function(){
    console.log("fuzzfindersMapsReports.js removeEventListenerReportHideDetail");
    $reportsList.off("click", ".report-detail-hide");
  };

  // Controller: add delegated event listener for comment form submission
  var addEventListenerSubmitComment = function(){
    console.log("fuzzfindersMapsReports.js addEventListenerSubmitComment");
    $reportsList.on("submit", ".new-comment-form", function(event){
      event.preventDefault();
      var $currentForm = $(this);
      var $currentFormData = $currentForm.serialize();
      var $currentReportId = $currentForm.children().last().data("reportid");
      console.log($currentForm);
      console.log($currentFormData);
      console.log($currentReportId);
      // call commentSubmit function
      submitComment($currentForm, $currentFormData, $currentReportId);
    });
  };

  // Controller: remove delegated event listener for comment form submission
  var removeEventListenerSubmitComment = function(){
    console.log("fuzzfindersMapsReports.js removeEventListenerSubmitComment");
    $reportsList.off("submit", ".new-comment-form");
  };

  // Controller: Add event listener for on change event of report filter controls
  var addEventListenerOnChangeReportFilterControls = function(){
    console.log("fuzzfindersMapsReports.js addEventListenerOnChangeReportFilterControls");
    $(".filter-control").on("change", function(event){
      event.preventDefault();
      var $currentControl = $(this);
      console.log($currentControl);
      if ($currentControl.hasClass("breed-select") || $currentControl.hasClass("color-select")){
        myApp.fuzzfinders.model.getRecentReports($currentControl);
      } else {
        myApp.fuzzfinders.model.getRecentReports();
      }
    });
  };

  var removeEventListenerOnChangeReportFilterControls = function(){
    console.log("fuzzfindersMapsReports.js removeEventListenerOnChangeReportFilterControls");
    $(".filter-control").off("change");
  };

  var addEventListenerResetFilterFormControls = function(){
    console.log("fuzzfindersMapsReports.js addEventListenerResetFilterFormControls");
    $(".reset-filter-button").on("click", function(event){
      event.preventDefault();
      console.log("reset button clicked");
      resetFormInputs();
      addTagsToHiddenInput("");
      // $tagsFilter.tokenfield('setTokens', '');
      // debugger
      $(".token").remove();
      myApp.fuzzfinders.model.getRecentReports();
    });
  };

  var removeEventListenerResetFilterFormControls = function(){
    console.log("fuzzfindersMapsReports.js removeEventListenerResetFilterFormControls");
    $(".reset-filter-button").off("click");
  };

  //------------------------ Tokenfield ----------------------------//

  // Controller: Tokenfield Prevent duplicate tags from being added to tag filter input
  var addEventListenerTokenfieldPreventDuplicateTagEntry = function(){
    console.log("fuzzfindersMapsReports.js addEventListenerTokenfieldPreventDuplicateTagEntry");
    $tagsFilter.on('tokenfield:createtoken', function (event) {
      var existingTokens = $(this).tokenfield('getTokens');
      $.each(existingTokens, function(index, token) {
        if (token.value === event.attrs.value) {
          event.preventDefault();
        }
      });
    });
  };

  // Controller: Tokenfield remove event listener to prevent duplicate tag entry
  var removeEventListenerTokenfieldPreventDuplicateTagEntry = function(){
    console.log("fuzzfindersMapsReports.js removeEventListenerTokenfieldPreventDuplicateTagEntry");
    $tagsFilter.off('tokenfield:createtoken');
  };

  // Controller: Tokenfield Add event listener for tag creation completion by Tokenfield input
  var addEventListenerTokenfieldTagAdded = function(){
    console.log("fuzzfindersMapsReports.js addEventListenerTokenfieldTagAdded");
    $tagsFilter.on('tokenfield:createdtoken', function (event) {
      event.preventDefault();
      console.log("Tokenfield: Tag Added!");
      var currentTagList = $(this).tokenfield('getTokensList');
      console.log(currentTagList);
      addTagsToHiddenInput(currentTagList);
      myApp.fuzzfinders.model.getRecentReports();
    });
  };

  // Controller: Tokenfield remove
  var removeEventListenerTokenfieldTagAdded = function(){
    console.log("fuzzfindersMapsReports.js removeEventListenerTokenfieldTagAdded");
    $tagsFilter.off('tokenfield:createdtoken');
  };

  // Controller: add event listener for tag removal completion from Tokenfield input
  var addEventListenerTokenfieldTagRemoved = function(){
    console.log("fuzzfindersMapsReports.js addEventListenerTokenfieldTagRemoved");
    $tagsFilter.on('tokenfield:removedtoken', function(event){
      console.log("Tag Removed!");
      var currentTagList = $(this).tokenfield('getTokensList');
      console.log(currentTagList);
      addTagsToHiddenInput(currentTagList);
      myApp.fuzzfinders.model.getRecentReports();
    });
  };

  var removeEventListenerTokenfieldTagRemoved = function(){
    console.log("fuzzfindersMapsReports.js removeEventListenerTokenfieldTagRemoved");
    $tagsFilter.off('tokenfield:removedtoken');
  };


  //------------------ filter reports button ----------------------//

  var addEventListenerFilterButtonClick = function(){
    console.log("fuzzfindersMapsReports addEventListenerFilterButtonClick");
    $filterReportsButton.on("click", function(event){
      event.preventDefault();
      console.log("Filter Button Clicked");
      if(checkIfDivHidden($recentReportsForm)){
        console.log("filter form hidden");
        openReportFilterForm();
      } else {
        console.log("filter form shown");
        myApp.fuzzfinders.view.closeReportFilterForm();
      }
    });
  };

  var removeEventListenerFilterButtonClick = function(){
    console.log("fuzzfindersMapsReports.js removeEventListenerFilterButtonClick");
    $filterReportsButton.off("click");
  };

  //----------------------- page load ---------------------------//

  // Controller: enable or disable event listeners if on fuzzfinders page
  var initializeFuzzfindersMapsReports = (function(){
    if (myApp.checkForElement(".fuzzfinders-buttons")) {
      hideReportFilterForm();
      addEventListenerToAllGetReportDetails();
      addEventListenerInitializeLostMap();
      addEventListenerInitializeFoundMap();
      addEventListenerInitializeReportMap();
      addEventListenerReportHideDetail();
      addEventListenerSubmitComment();
      addEventListenerFilterButtonClick();
      addEventListenerOnChangeReportFilterControls();
      addEventListenerResetFilterFormControls();
      addEventListenerTokenfieldPreventDuplicateTagEntry();
      addEventListenerTokenfieldTagAdded();
      addEventListenerTokenfieldTagRemoved();
    } else {
      removeEventListenerAllGetReportDetails();
      removeEventListenerInitializeLostMap();
      removeEventListenerInitializeFoundMap();
      removeEventListenerInitializeReportMap();
      removeEventListenerReportHideDetail();
      removeEventListenerSubmitComment();
      removeEventListenerFilterButtonClick();
      removeEventListenerOnChangeReportFilterControls();
      removeEventListenerResetFilterFormControls();
      removeEventListenerTokenfieldPreventDuplicateTagEntry();
      removeEventListenerTokenfieldTagAdded();
      removeEventListenerTokenfieldTagRemoved();
    }
  })();

}); // close document ready
