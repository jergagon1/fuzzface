var myApp = myApp || {};
myApp.fuzzfinders = myApp.fuzzfinders || {};
myApp.fuzzfinders.model = myApp.fuzzfinders.model || {};

$(function() {

  //========================== Model ==========================//


  //========================== View ==========================//

  // View: Toggle display of hamburger side menu
  var toggleDisplaySidebarMenu = function(){
    console.log("application.js toggleDisplaySidebarMenu");
    $("#wrapper").toggleClass("toggled");
  };

  //======================= Controller =======================//

  // Controller: check if element occurs on a page
  // global namespace to make available to other js files
  myApp.checkForElement = function(element){
    console.log("application.js myApp.checkForElement");
    return ($(element).length > 0) ? true : false;
  }

  // Controller: add event listener to sidebar menu button
  var addEventListenerToggleDisplaySidebarMenu = function(){
    console.log("application.js addEventListenerToggleDisplaySidebarMenu");
    $("#menu-toggle").click(function(event) {
      event.preventDefault();
      toggleDisplaySidebarMenu();
    });
  };

  // Controller: remove event listener to sidebar menu button
  var removeEventListenerToggleDisplaySidebarMenu = function(){
    console.log("application.js removeEventListenerToggleDisplaySidebarMenu");
    $("#menu-toggle").off()
  };

  // Controller: Instantiate chat widget
  var instantiateChatWidget = function(){
    console.log("application.js instantiateChatWidget");
    var pusher = new Pusher(gon.pusher_key);
    var chatWidget = new PusherChatWidget(pusher, {
      channelName: gon.channel_name,
    });
  };

  // Controller: Boolean to check if on fuzzfinders page and if the reports list is open
  var checkIfOnFuzzfindersPageAndReportsListOpen = function(){
    console.log("application.js checkIfOnFuzzfindersPageAndReportsListOpen");
    if(myApp.checkForElement(".fuzzfinders-buttons")){
      if($(".report-lists").is( ":hidden" )){
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  // Controller: Initialize FuzzFlash - Notification when new lost or found pet report created
  var initializeFuzzFlash = function(){
    console.log("application.js initializeFuzzFlash");
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
      if(checkIfOnFuzzfindersPageAndReportsListOpen()){
        myApp.fuzzfinders.model.getRecentReports();
      }
    });
  };


  // Controller: determine page and assign or remove event listeners
  var checkIfOnSignInUpPage = (function(){
    if(myApp.checkForElement(".sign-in-form-container")){
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