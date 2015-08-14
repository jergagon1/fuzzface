$(document).ready(function() {

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
  })();

});
