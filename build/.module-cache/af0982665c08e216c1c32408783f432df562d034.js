$(document).ready(function(){

	// var blah = CryptoJS.TripleDES.encrypt("BLAH", "happy");
	// var decrypt = CryptoJS.TripleDES.decrypt(blah.toString(), "happy");
	// console.log(decrypt.toString(CryptoJS.enc.Utf8));


	$(".signUp").hide();


	$(".signIn").on("submit", function(event){
		event.preventDefault();
		var formData = $(this).serialize();
		// console.log($(this).serialize());
		$.ajax({
			url: "http://localhost:3000/log_in",
			type: "put",
			data: formData,
		})
		.done(function(response){
			console.log("sign in success");
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