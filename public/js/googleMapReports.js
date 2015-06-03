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

     	var marker = new google.maps.Marker({
        map: reportMap,
        position: pos,
        icon: '/images/fuzzfinders_favicon.png',
        draggable: true,
        title: "Current location"
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


// var createMarker = function(reports) {

// 	for(var i = 0; i < reports.length; i++ ) {
// 		if (report[i].report_type === 'lost') {
// 			report_lat = report[i].lat;
// 			report_lng = report[i].lng;
// 			var marker = new google.maps.Marker({
//         map: reportMap,
//         position: new google.maps.LatLng(report_lat, report_lng),
//         icon: '/Users/jessgreb01/Desktop/fuzzface/public/images/fuzzfinders_favicon.png',
//         draggable: true,
//         title: "Current location"
//       });
// 		}
// 	};
// };

var mostRecentReportsAjax = function(sw, ne) {   
    $.ajax({
      url: "http://localhost:3001/api/v1/reports/mapquery?sw="+ sw +"&ne="+ ne +"",
      type: "GET",
      crossDomain: true,
      dataType: 'json'

    })
    .done(function(response){
      console.log("success");
      console.log(response);
      // createMarker(response);
      
    })
    .fail(function(){
      console.log("reports request fail!");
    })
};
