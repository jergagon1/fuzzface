$(function(){

  //------------------------- Model -------------------------------//



  //------------------------- View -------------------------------//

  // View: hide the sign up form
  var hideSignUpForm = function(){
  	$(".signUp").hide();
  };

  // View: toggle the sign in and sign up forms
  var toggleSignInSignUpForm = function(){
    $(".signIn").toggle();
    $(".signUp").toggle();
  };

  //------------------------- Controller -------------------------------//

  // Controller: add event listener to link to toggle sign in and sign up form
  var addEventListenerToggleSignInSignUpForm = function(){
  	$(".sign-form-swap").on("click", function(event){
  	  event.preventDefault();
  	  toggleSignInSignUpForm();
  	});
  };

  // Controller: remove event listener to link to toggle sign in and sign up form
  var removeEventListenerToggleSignInSignUpForm = function(){
    $(".sign-form-swap").off("click");
  };

  // Controller: initialize event handlers if on signin/signup page
  var initializeSignInUp = (function(){
    if (checkForElement(".sign-in-form-container")) {
      // add initializers and event listeners
      hideSignUpForm();
      addEventListenerToggleSignInSignUpForm();
    } else {
      // remove initializers and event listeners
      removeEventListenerToggleSignInSignUpForm();
    }
  })();

}); // close document ready