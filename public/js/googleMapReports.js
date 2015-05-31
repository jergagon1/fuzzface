var reportMap;
function initializeReport() {
  var reportMapOptions = {
    zoom: 13
  };
  reportMap = new google.maps.Map(document.getElementById('report-map-canvas'),
      reportMapOptions);

  // user current location
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
      lat = position.coords.latitude;
      lng = position.coords.longitude;     

     	var marker = new google.maps.Marker({
        map: map,
        position: pos,
        icon: '/Users/jessgreb01/Desktop/fuzzface/public/images/fuzzfinders_favicon.png',
        draggable: true,
        title: "Current location"
      });

      map.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
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

google.maps.event.addDomListener(window, 'load', initialize);

var createMarker = function(reports) {

	for(var i = 0; i < reports.length; i++ ) {
		if (report[i].report_type === 'lost') {
			report_lat = report[i].lat;
			report_lng = report[i].lng;
			var marker = new google.maps.Marker({
        map: reportMap,
        position: new google.maps.LatLng(report_lat, report_lng),
        icon: '/Users/jessgreb01/Desktop/fuzzface/public/images/fuzzfinders_favicon.png',
        draggable: true,
        title: "Current location"
      });
		}
	};
};



var mostRecentReportsAjax = function(lat, long) {
	$(".reports-btn").on("click", function(event) {
		event.preventDefault();
		var data = {lat: marker_lat, lng: marker_lng}
		$.ajax({
			url: "http://localhost:3000/reports",
			type: "get",
			data: formData,
		})
		.done(function(response){
			console.log("success");
			console.log(response);
			createMarker(response.lat, response.lng);
			
		})
		.fail(function(){
			console.log("sign in fail!");
		})
	})
};