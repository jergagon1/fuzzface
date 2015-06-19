$(document).ready(function() {
  


   $("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
  });

  $(".main-buttons").siblings().hide();

  $(".main-buttons").on("click", function(e){
    e.preventDefault();
    if ($(this).siblings().first().is(":hidden")){
      $(this).siblings().first().slideDown("slow");
    } else {
      $(this).siblings().first().slideUp();
    }
  })
});
