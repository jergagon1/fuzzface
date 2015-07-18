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
