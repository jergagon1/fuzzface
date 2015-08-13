$(document).ready(function() {

  // Pages: All
  // Toggle display of hamburger side menu
  $("#menu-toggle").click(function(event) {
    event.preventDefault();
    $("#wrapper").toggleClass("toggled");
  });

});
