$(function() {

  // View: hide create article form
  var hideForm = function () {
    $(".fuzzfeed-buttons").siblings().hide();
  };

  // Add event listener for large buttons to show or hide form and list content on click
  $(".fuzzfeed-buttons").on("click", function(event){
    event.preventDefault();
    if ($(this).siblings().first().is(":hidden")){
      $(this).siblings().first().slideDown("slow");
      $(this).addClass("selected-button");
    } else {
      $(this).siblings().first().slideUp();
      $(this).removeClass("selected-button");
    }
  });

  // retrieve articles to populate feed
  var populateArticles = function() {
    $.ajax({
     url: 'http://localhost:3000/api/v1/articles',
     type: 'GET'
    })
    .done(function(response){
      console.log(response);
      var context = { articles: response };
      var $source =  $('#article-template').html();
      var template = Handlebars.compile($source);
      var html = template(context);
      $('.articles-list').append(html);
    })
    .fail(function(){
      console.log("Error loading articles!");
    });
  };

  // create new article
  $('.new-article').on('submit', function(event) {
    event.preventDefault();
    $that = $(this);
    var link = $that.attr("action");
    var method = $that.attr("method");
    var formData = $that.serialize();
    $.ajax({
      url: link,
      type: method,
      dataType: 'JSON',
      data: formData
    })
    .done(function(response) {
      console.log(response);
      var context = { articles: [response["article"]] };
      var $source =  $('#article-template').html();
      var template = Handlebars.compile($source);
      var html = template(context);
      $('.articles-list').prepend(html);
      $(".new-article")[0].reset();
      $that.slideUp("slow");
      $that.parent().children(":first").removeClass("selected-button");
    })
    .fail(function() {
      console.log("error");
    })
  });

  // Controller:
  var initializeFuzzfeed = (function(){
    if (checkForElement(".fuzzfeed-buttons")) {
      hideForm();
      populateArticles();
    } else {

    }
  })();

}); // close document ready