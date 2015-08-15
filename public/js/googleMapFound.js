$(function(){

  var initializeFoundMap = function() {
    var foundMap;
    var mapOptions = {
      zoom: 14,
      center: new google.maps.LatLng(37.7848676, -122.3978871)
    };
    foundMap = new google.maps.Map(document.getElementById("found-map-canvas"), mapOptions);

    //User's Current Location
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = new google.maps.LatLng(position.coords.latitude,
                                         position.coords.longitude);
        lat = position.coords.latitude;
        lng = position.coords.longitude;

       	var marker = new google.maps.Marker({
          map: foundMap,
          position: pos,
          icon: '/images/FuzzFinders_icon_orange.png',
          draggable: true,
        });

       	var markerLat;
       	var markerLong;
       	markerLat = marker.position.A  //marker latitude
  			markerLong = marker.position.F  //marker longitude

        var posInfoWindow = new google.maps.LatLng(markerLat + .0025, markerLong + .00001);

        var infowindow = new google.maps.InfoWindow({
          map: foundMap,
          position: posInfoWindow,
          content: 'Current location. Drag to location pet was last seen.'
        });

        google.maps.event.addListener(marker, 'dragend', function(){
            lat = this.getPosition().lat();
            lng = this.getPosition().lng();
            infowindow.close();
        });

        foundMap.setCenter(pos);
        addLatLongAttr(lat,lng);
      }, function() {
        handleNoGeolocation(true, foundMap);
      });
    } else {
      // Browser doesn't support Geolocation
      handleNoGeolocation(false, foundMap);
    }
  };

  //if current location does not work, then map defaults to San Francisco
  var handleNoGeolocation = function(errorFlag, noGeoMap) {
    if (errorFlag) {
      var content = 'Error: The Geolocation service failed.';
    } else {
      var content = 'Error: Your browser doesn\'t support geolocation.';
    }

    var options = {
      map: noGeoMap,
      position: new google.maps.LatLng(37.7848676, -122.3978871),
      content: content
    };

    var infowindow = new google.maps.InfoWindow(options);
    noGeoMap.setCenter(options.position);
  };

  var addLatLongAttr = function(lat, lng) {
    $('.hidden-lat-field').attr('value', lat);
    $('.hidden-lng-field').attr('value', lng);
  };

  var foundPetBtn = document.getElementsByClassName("found-pet")[0];

  if (foundPetBtn !== undefined) {
    google.maps.event.addDomListener(foundPetBtn, 'click', initializeFoundMap);
  }


}); // close document ready
