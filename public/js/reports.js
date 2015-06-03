$(document).ready(function(){
	console.log("hello");
	$(".lost-pet-form").on("submit", function(event){
		event.preventDefault();
		formData = $(this).serialize();
		console.log(formData);
		$.ajax({
			url: "http://localhost:3001/api/v1/reports",
			type: "post",
			dataType: "json",
			data: formData
		})
		.done(function(response){
			console.log(response);
		})
		.fail(function(){
			console.log('fail');
		})


	})

});