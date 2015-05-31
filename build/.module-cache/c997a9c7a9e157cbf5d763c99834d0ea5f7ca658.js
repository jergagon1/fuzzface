$(document).ready(function(){

	console.log(CryptoJS.TripleDES.encrypt("BLAH", "happy"));


	$(".signUp").hide();


	$(".signIn").on("submit", function(event){
		event.preventDefault();
		var formData = $(this).serialize();
		console.log($(this).serialize());
		$.ajax({
			url: "localhost:3001/sign_in",
			type: "POST",
			data: formData,
		})
		.done(function(response){
			console.log(response);
		})
		.fail(function(){
			console.log("sign in fail!");
		})
	})


	$(".sign-form-swap").on("click", function(event){

		event.preventDefault();

		$(".signIn").toggle();
		$(".signUp").toggle();

	})

})