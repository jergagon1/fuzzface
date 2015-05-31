$(document).ready(function(){

	var blah = CryptoJS.TripleDES.encrypt("BLAH", "happy");
	var decrypt = CryptoJS.TripleDES.decrypt(blah.toString(), "happy");
	console.log(decrypt.toString(CryptoJS.enc.Utf8));


	$(".signUp").hide();


	$(".signIn").on("submit", function(event){
		event.preventDefault();
		var formData = $(this).serialize();
		debugger
		console.log($(this).serialize());
		$.ajax({
			url: "localhost:3000/sign_in",
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