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
  var getRecentReports = function($dynamicFilter) {
    console.log("fuzzfindersMapsReports.js getRecentReports");
    $.ajax({
      url: "http://localhost:3000/api/v1/reports/mapquery",
      type: "GET",
      crossDomain: true,
      dataType: 'json',
      data: $recentReportsForm.serialize()
    })
    .done(function(response){
      $(".report").remove();
      removeReportMapMarkers(reportMapMarkers);
      createMarkers(response, reportMapMarkers);
      updateTimestamps(response, "created_at");
      updateTimestamps(response, "last_seen");
      renderTemplates({ reports: response }, $('#report-list-template'), $('.reports-list'));
      var breedArray = createArrayUniqueValues(response, "breed");
      removeValuesFromSelectDropdown($(".breed-select"));
      appendValuesToSelectDropdown($(".breed-select"), breedArray);
      var colorArray = createArrayUniqueValues(response, "color");
      removeValuesFromSelectDropdown($(".color-select"));
      appendValuesToSelectDropdown($(".color-select"), colorArray);
      if($dynamicFilter){
        console.log("dynamic filter used");
        $dynamicFilter.prop("selectedIndex", 1)
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
    // var $currentReportSummary = $reportLi.find(".report-summary");
    $.ajax({
      url: "http://localhost:3000/api/v1/reports/" + $id + "",
      type: "GET",
      crossDomain: true,
      dataType: 'json'
    })
    .done(function(response){
      console.log(response);
      // render handlebars template
      updateTimestamps(response["comments"], "created_at");
      renderTemplates({
        report:     response["report"],
        tags:       response["tags"],
        comments:   response["comments"] },
        $('#report-detail-template'),
        $reportLi
      );
      removeUnselectedClass($reportLi);
      toggleHideIcon($reportLi);
    })
    .fail(function(){
      console.log("report detail request failed");
    })
  };

  // Model: submit comment data to server api
  var submitComment = function($form, $formData, $reportId){
    console.log("fuzzfindersMapsReports.js submitComment");
    var apiLink = "http://localhost:3000/api/v1/reports/" + $reportId + "/comments"
    var $commentList = $(".comment-list[data-reportid="+$reportId+"]");
    var $commentListDiv = $(".comments-list-div[data-reportid="+$reportId+"]");
    $.ajax({
      url: apiLink,
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

  // View: reset the form inputs
  var resetFormInputs = function(){
    console.log("fuzzfindersMapsReports.js resetFormInputs");
    $("input[type='text']").val('');
    $("textarea").val("");
    $("select").prop("selectedIndex", 0);
  };

  // View: Remove the option values from a select dropdown menu
  var removeValuesFromSelectDropdown = function($inputDropdown){
    $inputDropdown.children().slice(1).remove();
  };

  // View: Append array values as options in select dropdown menu
  var appendValuesToSelectDropdown = function($inputDropdown, valueArray){
    // var valueArray = $inputDropdown.data("values").split(",");
    // console.log(valueArray);
    var seloptions = "";
    $.each(valueArray,function(i){
        seloptions += '<option value="'+valueArray[i]+'">'+valueArray[i]+'</option>';
    });
    $inputDropdown.append(seloptions);
  };

  // View: hide the reports filter form
  var hideReportFilterForm = function(){
    console.log("fuzzfindersMapsReports.js hideReportFilterForm");
    $(".recent-reports-form").hide();
  };

  // View: check if the div containing the report comments is hidden
  var checkIfCommentsListDivHidden = function($commentDiv){
    console.log("fuzzfindersMapsReports.js checkIfCommentsListDivHidden");
    if($commentDiv.is(":hidden")){
      return true
    } else {
      return false
    }
  };

  // View: show the report comments div if it is hidden
  var showCommentsListDivIfHidden = function($commentsDiv){
    console.log("fuzzfindersMapsReports.js showCommentsListDivIfHidden");
    if(checkIfCommentsListDivHidden($commentsDiv)) {
      console.log("hidden");
      // if hidden display comments div
      $commentsDiv.show();
    } else {
      console.log("not hidden");
    }
  };

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

  // View: create a marker for a report
  var setMarkerType = function(report) {
    console.log("fuzzfindersMapsReports.js setMarkerType");
    report_lat = report.lat;
    report_lng = report.lng;
    var reportPos = new google.maps.LatLng(report_lat, report_lng);
    var marker = new google.maps.Marker({
      map: reportMap,
      position: reportPos,
      icon: selectIcon(report.report_type),
      title: report.pet_name
    })
    reportMapMarkers.push(marker);
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

  // View: remove the report detail section for report li
  var removeReportDetails = function($reportLi){
    $reportLi.find(".report-summary").siblings().remove();
  };

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

  // View: toggle display of report hide glyphicon
  var toggleHideIcon = function($reportListItem){
    $reportListItem.find(".report-detail-hide").toggle();
  };

  // View: reset report summary
  var resetReport = function($reportListItem){
    removeReportDetails($reportListItem);
    addUnselectedClass($reportListItem);
    toggleHideIcon($reportListItem);
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
          // console.log(boundary);
          ne_bounds = boundary.getNorthEast();
          sw_bounds = boundary.getSouthWest();
          ne_string = ne_bounds.toString();
          sw_string = sw_bounds.toString();

          ne = ne_bounds.toString().substr(1, ne_string.length-2);
          sw = sw_bounds.toString().substr(1, sw_string.length-2);
          setRecentReportsHiddenFormInputFields(sw,ne);
          getRecentReports();
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

  // Controller: Remove DOM listener from lost a pet button
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
  var addEventListenerToAllGetReportDetails = function(){
    $reportsList.on("click", ".unselected", function() {
      console.log("report summary clicked");
      $clickedReport = $(this);
      $reportId = $clickedReport.data("reportid");
      getReportDetails($clickedReport, $reportId);
    });
  };

  // Controller: Remove delegated event listener to reports in reports list
  var removeEventListenerAllGetReportDetails = function(){
    $reportsList.off("click", ".unselected");
  };

  // Controller: unselected class adds delegated event listener to show report details
  var addUnselectedClass = function($reportListItem){
    console.log("unselected class added");
    $reportListItem.addClass("unselected");
  };

  // Controller: remove unselected class to disable delegated event listener to show report details
  var removeUnselectedClass = function($reportListItem){
    console.log("unselected class removed");
    $reportListItem.removeClass("unselected");
  };

  // Controller: add event listener to hide icon in selected report
  var addEventListenerReportHideDetail = function(){
    $reportsList.on("click", ".report-detail-hide", function() {
      console.log("report hide clicked");
      $clickedReport = $(this).parent().parent().parent();
      console.log($clickedReport);
      resetReport($clickedReport);
    });
  };

  // Controller: remove event listener from hide icon in selected report
  var removeEventListenerReportHideDetail = function(){
    $reportsList.off("click", ".report-detail-hide");
  };

  // Controller: add delegated event listener for comment form submission
  var addEventListenerSubmitComment = function(){
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
    $reportsList.off("submit", ".new-comment-form");
  };

  // Controller: Add event listener for on change event of report filter controls
  var addEventListenerOnChangeReportFilterControls = function(){
    $(".filter-control").on("change", function(event){
      event.preventDefault();
      var $currentControl = $(this);
      console.log($currentControl);
      if ($currentControl.hasClass("breed-select") || $currentControl.hasClass("color-select")){
        getRecentReports($currentControl);
      } else {
        getRecentReports();
      }
    });
  };

  var removeEventListenerOnChangeReportFilterControls = function(){
    $(".filter-control").off("change");
  };

  var addEventListenerResetFilterFormControls = function(){
    console.log("addEventListenerResetFilterFormControls");
    $(".reset-filter-button").on("click", function(event){
      event.preventDefault();
      console.log("reset button clicked");
      resetFormInputs();
      getRecentReports();
    });
  };

  var removeEventListenerResetFilterFormControls = function(){
    $(".reset-filter-button").off("click");
  };

  //-------------------- filter reports button ---------------------------//

  var addEventListenerFilterButtonClick = function(){
    $filterReportsButton.on("click", function(event){
      event.preventDefault();
      console.log("Filter Button Clicked");
    });
  };

  var removeEventListenerFilterButtonClick = function(){
    $filterReportsButton.off("click");
  };

  //----------------------- page load ---------------------------//

  // Controller: enable or disable event listeners if on fuzzfinders page
  var initializeFuzzfindersMapsReports = (function(){
    if (checkForElement(".fuzzfinders-buttons")) {
      addEventListenerToAllGetReportDetails();
      addEventListenerInitializeLostMap();
      addEventListenerInitializeFoundMap();
      addEventListenerInitializeReportMap();
      addEventListenerReportHideDetail();
      addEventListenerSubmitComment();
      addEventListenerFilterButtonClick();
      addEventListenerOnChangeReportFilterControls();
      addEventListenerResetFilterFormControls();
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
    }
  })();

}); // close document ready