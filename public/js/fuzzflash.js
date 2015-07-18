var clearFuzzflash = function() {
    setTimeout(function() {
        $('div.notification').text("");
        }, 2000);
};

var pusher = new Pusher(ENV['PUSHER_KEY']);
var fuzzflashChannel = pusher.subscribe('fuzzflash');

fuzzflashChannel.bind('report_created', function(fuzzflash){
    var message = fuzzflash.message;
    $('div.notification').text(message);
    clearFuzzflash();
});