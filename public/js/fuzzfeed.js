$(document).ready(function() {
  $.ajax({
   url: 'http://localhost:3002/api/v1/articles',
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

  $('#articles').on('click', 'a', function(evt) {
    evt.preventDefault();
    $.ajax({
      url: 'http://localhost:3002/api/v1/articles',
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

  $('#new_article').on('submit', function(evt) {
    evt.preventDefault();
    $.ajax({
      url: 'http://localhost:3002/api/v1/articles',
      type: 'POST',
      dataType: 'JSON',
      data: $('#new_article').serialize()
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
