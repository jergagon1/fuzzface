$(function(){

	$(".signUp").hide();

	$(".sign-form-swap").on("click", function(event){
		event.preventDefault();
		$(".signIn").toggle();
		$(".signUp").toggle();
	});

}); // close document ready