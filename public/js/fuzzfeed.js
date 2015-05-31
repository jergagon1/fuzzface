$(document).ready(function() {
  $.ajax({
   url: 'http://localhost:3002/articles',
   dataType: 'JSON'
  }).done(function(response){
    var raw_template =  $('#article-template').html();
    var template = Handlebars.compile(raw_template);
        for (var i=0; i<response.length; i++) {
    $('#articles').append(template(response[i]))
  }
  }).fail(function(response){
    console.log("Something went wrong")
  })

  $('#articles').on('click', 'a', function(evt) {
    evt.preventDefault();
    $.ajax({
      url: 'http://localhost:3002/articles',
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
      url: 'http://localhost:3002/articles',
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
  })

}) //ready
