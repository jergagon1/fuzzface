$(document).ready(function(){


	$(".signIn").on("submit", function(event){
		event.preventDefault();
		var formData = $(this).serialize();
		console.log(formData);
		$.ajax({
			url: "localhost:3001/sign_in",
			type: "POST",
			data: formData,
		})
		.done(function(response){
			console.log(response);
		})
		.fail(function(){
			console.log("sign in fail!")
		})
	})


})