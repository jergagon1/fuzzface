var clearFuzzflash = function() {
    setTimeout(function() {
        $('div.notification').text(""); 
        }, 2000);
};

var pusher = new Pusher('3b5fcae47e2c2ecfad91');
var fuzzflashChannel = pusher.subscribe('fuzzflash');

fuzzflashChannel.bind('report_created', function(fuzzflash){
    var message = fuzzflash.message;
    $('div.notification').text(message);
    clearFuzzflash();
});