$(document).ready(function() {

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
			
		})
		.fail(function(){
			console.log("sign in fail!");
		})
	})

});