var reportMap;
function initializeReport() {
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
        console.log(ne);
        console.log(sw);
        mostRecentReportsAjax(sw, ne);
      });
      reportMap.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // if browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);

}

var reportBtn = document.getElementsByClassName("report")[0];
google.maps.event.addDomListener(reportBtn, 'click', initializeReport);



var createMarker = function(reports) {
	for(var i = 0; i < reports.length; i++ ) {
		if (reports[i].report_type === 'lost') {
      lostOrFound(reports[i]);
		} else if (reports[i].report_type == 'found') {
     lostOrFound(reports[i]);
    } else {
      console.log('no report type');
    }
	};
};

var lostOrFound = function(report) {
  // console.log('found dog');
  // console.log(report.pet_name);
  report_lat = report.lat;
  // console.log(report_lat);
  report_lng = report.lng;
  // console.log(report_lng);

  var reportPos = new google.maps.LatLng(report_lat, report_lng);

  var marker = new google.maps.Marker({
    map: reportMap,
    position: reportPos,
    icon: selectIcon(report.report_type),
    title: report.pet_name
  })
};

var selectIcon = function(reportType) {
  if (reportType === 'lost') {
    return '/images/fuzzfinders_favicon.png'
  } else if (reportType === 'found') {
    return '/images/FuzzFinders_icon_blue.png'
  } else {
    console.log('no reports');
  }
};

var mostRecentReportsAjax = function(sw, ne) {
  $.ajax({
    url: "http://localhost:3000/api/v1/reports/mapquery?sw="+ sw +"&ne="+ ne +"",
    type: "GET",
    crossDomain: true,
    dataType: 'json'
  })
  .done(function(response){
    console.log(response);
    createMarker(response);
  })
  .fail(function(){
    console.log("reports request fail!");
  });
};
