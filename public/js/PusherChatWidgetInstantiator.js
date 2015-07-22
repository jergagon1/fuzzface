$(function() {
  var pusher = new Pusher(gon.pusher_key);
  var chatWidget = new PusherChatWidget(pusher, {
    channelName: gon.channel_name,
  });
});