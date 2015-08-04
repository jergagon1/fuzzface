$(document).ready(function() {

  // Pages: All
  // Toggle display of hamburger side menu
  $("#menu-toggle").click(function(event) {
    event.preventDefault();
    $("#wrapper").toggleClass("toggled");
  });

  // Pages: FuzzFinders
  // Hide/collapse the lost or found forms or the reports list if open on page load
  $(".main-buttons").siblings().hide();

  // Pages: FuzzFinders, FuzzFeed
  // Add event listener for large buttons to show or hide form and list content on click
  $(".main-buttons").on("click", function(event){
    event.preventDefault();
    if ($(this).siblings().first().is(":hidden")){
      $(this).siblings().first().slideDown("slow");
      $(this).addClass("selected-button");
    } else {
      $(this).siblings().first().slideUp();
      $(this).removeClass("selected-button");
    }
  });
});
