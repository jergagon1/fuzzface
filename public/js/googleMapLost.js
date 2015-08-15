$(function(){

  var lostMap;
  function initializeLostMap() {
    var mapOptions = {
      zoom: 14,
      center: new google.maps.LatLng(37.7848676, -122.3978871)
    };
    lostMap = new google.maps.Map(document.getElementById("lost-map-canvas"), mapOptions);

    //User's Current Location
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = new google.maps.LatLng(position.coords.latitude,
                                         position.coords.longitude);
        lat = position.coords.latitude;
        lng = position.coords.longitude;

       	var marker = new google.maps.Marker({
          map: lostMap,
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
          map: lostMap,
          position: posInfoWindow,
          content: 'Current location. Drag to location pet was last seen.'
        });

        google.maps.event.addListener(marker, 'dragend', function(){
            lat = this.getPosition().lat();
            lng = this.getPosition().lng();
            addLatLongAttr(lat,lng);
            infowindow.close();
        });

        lostMap.setCenter(pos);
        addLatLongAttr(lat,lng);
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
      map: lostMap,
      position: new google.maps.LatLng(37.7848676, -122.3978871),
      content: content
    };

    var infowindow = new google.maps.InfoWindow(options);
    lostMap.setCenter(options.position);
  }

  var lostPetBtn = document.getElementsByClassName("lost-pet")[0];
  if (lostPetBtn !== undefined) {
    google.maps.event.addDomListener(lostPetBtn, 'click', initializeLostMap);
  }

  var addLatLongAttr = function(lat, lng) {
    $('.hidden-lat-field').attr('value', lat);
    $('.hidden-lng-field').attr('value', lng);
  };

}); // close document ready
