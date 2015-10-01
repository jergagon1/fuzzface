$(function() {

  //========================== Model ==========================//


  //========================== View ==========================//

  // View: Toggle display of hamburger side menu
  var toggleDisplaySidebarMenu = function(){
    $("#wrapper").toggleClass("toggled");
  };

  //======================= Controller =======================//

  // Controller: check if element occurs on a page
  // global namespace to make available to other js files
  window.checkForElement = function(element){
    return ($(element).length > 0) ? true : false;
  }

  // Controller: add event listener to sidebar menu button
  var addEventListenerToggleDisplaySidebarMenu = function(){
    $("#menu-toggle").click(function(event) {
      event.preventDefault();
      toggleDisplaySidebarMenu();
    });
  };

  // Controller: remove event listener to sidebar menu button
  var removeEventListenerToggleDisplaySidebarMenu = function(){
    $("#menu-toggle").off()
  };

  // Controller: Instantiate chat widget
  var instantiateChatWidget = function(){
    var pusher = new Pusher(gon.pusher_key);
    var chatWidget = new PusherChatWidget(pusher, {
      channelName: gon.channel_name,
    });
  };

  // Controller: Initialize FuzzFlash - Notification when new lost or found pet report created
  var initializeFuzzFlash = function(){
    var clearFuzzflash = function() {
      setTimeout(function() {
        $('div.notification').text("");
      }, 10000);
    };
    var pusher = new Pusher(gon.pusher_key);
    var fuzzflashChannel = pusher.subscribe('fuzzflash');
    fuzzflashChannel.bind('report_created', function(fuzzflash){
      var message = fuzzflash.message;
      $('div.notification').text(message);
      clearFuzzflash();
    });
  };

  // Controller: determine page and assign or remove event listeners
  var checkIfOnSignInUpPage = (function(){
    if(checkForElement(".sign-in-form-container")){
      // on signInUp page
      removeEventListenerToggleDisplaySidebarMenu();
    } else {
      // on any other page
      instantiateChatWidget();
      initializeFuzzFlash();
      addEventListenerToggleDisplaySidebarMenu();
    }
  })(); // close IIFE checkIfOnSignInUpPage

}); // close document ready