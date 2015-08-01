$(document).ready(function() {

  // retrieve articles to populate feed
  var populateArticles = (function() {
    $.ajax({
     url: 'http://localhost:3000/api/v1/articles',
     type: 'GET'
    })
    .done(function(response){
      console.log(response);
      var context = { articles: response };
      var source =  $('#article-template').html();
      var template = Handlebars.compile(source);
      var html = template(context);
      $('.articles-list').append(html);
    })
    .fail(function(){
      console.log("Error loading articles!");
    });
  })();

  // create new article
  $('.new-article').on('submit', function(event) {
    event.preventDefault();
    that = $(this);
    var link = that.attr("action");
    var method = that.attr("method");
    var formData = that.serialize();
    $.ajax({
      url: link,
      type: method,
      dataType: 'JSON',
      data: formData
    })
    .done(function(response) {
      console.log(response);
      var context = { articles: [response["article"]] };
      var source =  $('#article-template').html();
      var template = Handlebars.compile(source);
      var html = template(context);
      $('.articles-list').prepend(html);
      $(".new-article")[0].reset();
      that.slideUp("slow");
      that.parent().children(":first").removeClass("selected-button");
    })
    .fail(function() {
      console.log("error");
    })
  });

}); //ready