$(function() {

  // Pages: All
  // Toggle display of hamburger side menu
  $("#menu-toggle").click(function(event) {
    event.preventDefault();
    $("#wrapper").toggleClass("toggled");
  });

  // Pages: All
  // Instantiate chat widget
  var instantiateChatWidget = (function(){
    var pusher = new Pusher(gon.pusher_key);
    var chatWidget = new PusherChatWidget(pusher, {
      channelName: gon.channel_name,
    });
  })(); // IIFE instantiateChatWidget close/execute

  // Pages: All
  // Initialize FuzzFlash - Notification when new lost or found pet report created
  var initializeFuzzFlash = (function(){
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
  })(); // IIFE initialFuzzFlash close/execute

}); // close document ready
