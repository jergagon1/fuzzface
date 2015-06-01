
var map;
function initialize() {
  var mapOptions = {
    zoom: 14,
    center: new google.maps.LatLng(37.7848676, -122.3978871)
  };
  map = new google.maps.Map(document.getElementById("lost-map-canvas"), mapOptions);

//User's Current Location
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);     
      lat = position.coords.latitude;
      lng = position.coords.longitude;     

     	var marker = new google.maps.Marker({
        map: map,
        position: pos,
        icon: '/images/fuzzfinders_favicon.png',
        draggable: true,
      });

     	var markerLat;
     	var markerLong;
     	markerLat = marker.position.A  //marker latitude
			markerLong = marker.position.F  //marker longitude

      var posInfoWindow = new google.maps.LatLng(markerLat + .0025, markerLong + .00001); 

      var infowindow = new google.maps.InfoWindow({
        map: map,
        position: posInfoWindow,
        content: 'Current location. Drag to location pet was last seen.'
      });

      google.maps.event.addListener(marker, 'dragend', function(){
          lat = this.getPosition().lat();
          lng = this.getPosition().lng();
          infowindow.close();	      
     //      markerLat = new_drag_lat
     //      markerLong = new_drag_lng
     //      console.log(markerLat);
					// console.log(markerLong);
					// infowindow.position = new google.maps.LatLng(markerLat + .0025, markerLong + .00001); 
					// console.log(infowindow.position);
					// infowindow;
      });

      map.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
};

//if current location does not work, then map defaults to San Francisco
function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(37.7848676, -122.3978871),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}

  var lostMapDiv = document.getElementById('lost-map-canvas');
  var lostPetBtn = document.getElementsByClassName("lost-pet")[0];
  google.maps.event.addDomListener(lostPetBtn, 'click', initialize);

  // console.log(lostMapDiv);
  // console.log(lostPetBtn);



  // var foundMapDiv = document.getElementsByClassName('map-canvas')[1];
  // var foundPetBtn = document.getElementsByClassName("found-pet")[0];
  // google.maps.event.addDomListener(foundPetBtn, 'click', initialize(foundMapDiv));














