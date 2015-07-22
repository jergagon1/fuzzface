$(document).ready(function() {

  // retrieve articles
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
    console.log("Something went wrong");
  });

  //
  $('#articles').on('click', 'a', function(event) {
    event.preventDefault();
    $.ajax({
      url: 'http://localhost:3000/api/v1/articles',
      type: 'GET'
    })
    .done(function(response) {
      var raw_template =  $('#comment-template').html();
      var template = Handlebars.compile(raw_template);
        for (var i=0; i<response.length; i++) {
          $('.article_'+response[i].id).append(template(response[i]))
        }
    })
    .fail(function() {
      console.log("error");
    })
  })

  $('.new_article').on('submit', function(event) {
    event.preventDefault();
    var link = $(this).attr("action");
    var method = $(this).attr("method");
    var formData = $(this).serialize();
    $.ajax({
      url: link,
      type: method,
      dataType: 'JSON',
      data: formData
    })
    .done(function(response) {
      var raw_template =  $('#entry-template').html();
      var template = Handlebars.compile(raw_template);
      $('#articles').append(template(response));
    })
    .fail(function() {
      console.log("error");
    })
  });

}); //ready
