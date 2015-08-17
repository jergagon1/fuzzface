$(function() {

  //------------------------- Model -------------------------------//

  // Model: retrieve articles for feed
  var getArticles = function() {
    $.ajax({
     url: 'http://localhost:3000/api/v1/articles',
     type: 'GET'
    })
    .done(function(response){
      console.log(response);
      renderTemplates(
        { articles: response },
        $('#article-template'),
        $('.articles-list')
      );
    })
    .fail(function(){
      console.log("Error loading articles!");
    });
  };

  // Model: create new article
  var newArticleSubmit = function($dataFromForm, $articleForm){
    $.ajax({
      url: $articleForm.attr("action"),
      type: $articleForm.attr("method"),
      dataType: 'JSON',
      data: $dataFromForm
    })
    .done(function(response) {
      console.log(response);
      renderTemplates(
        { articles: [response["article"]] },
        $('#article-template'),
        $('.articles-list'),
        true
      );
      resetArticleForm($articleForm);
    })
    .fail(function() {
      console.log("error creating article");
    })
  };

  //------------------------- View -------------------------------//

  // View: Hide/collapse the lost or found forms or reports list if open on page load
  var hideAllSiblings = function(element) {
    $(element).siblings().hide();
  };

  var addSelectedClassToButton = function($buttonToSelect){
    $buttonToSelect.addClass("selected-button");
  };

  var removeSelectedClassFromButton = function($buttonToDeselect){
    $buttonToDeselect.removeClass("selected-button");
  };

  var slideDownRevealButtonSiblingContent = function($adjacentButton){
    $adjacentButton.siblings().first().slideDown("slow");
  };

  var slideUpHideButtonSiblingContent = function($adjacentButton){
    $adjacentButton.siblings().first().slideUp();
  };

  // View: Slide open or close form and list content adjacent to large buttons
  var toggleFuzzfeedButtons = function($button){
    if ($button.siblings().first().is(":hidden")){
      slideDownRevealButtonSiblingContent($button);
      addSelectedClassToButton($button);
    } else {
      slideUpHideButtonSiblingContent($button);
      removeSelectedClassFromButton($button);
    }
  };

  // View: render handlebars templates
  var renderTemplates = function(context, $templateLocation, $listLocation, prepend) {
   prepend = prepend || false;
   var source =  $templateLocation.html();
   var template = Handlebars.compile(source);
   var html = template(context);
   if (prepend) {
    $listLocation.prepend(html);
   } else {
    $listLocation.append(html);
   }
  };

  // View: reset the new article form
  var resetArticleForm = function($form){
    $(".new-article")[0].reset();
    $form.slideUp("slow");
    $form.parent().children(":first").removeClass("selected-button");
  };

  //------------------------- Controller -------------------------------//

  var addEventListenerToggleFuzzfeedButtons = function(){
    $(".fuzzfeed-buttons").on("click", function(event){
      event.preventDefault();
      var $clickedButton = $(this);
      toggleFuzzfeedButtons($clickedButton);
    });
  };

  var removeEventListenerToggleFuzzfeedButtons = function(){
    $(".fuzzfeed-buttons").off("click");
  };

  // Controller: add event listener for new article submit button
  var addEventListenerNewArticleSubmit = function(){
    $(".new-article").on("submit", function(event) {
      event.preventDefault();
      var $form = $(this);
      var $formData = $(this).serialize();
      newArticleSubmit($formData, $form);
    });
  };

  var removeEventListenerNewArticleSubmit = function(){
    $(".new-article").off("submit")
  };

  // Controller: initialize functions and eventlisteners if on fuzzfeed page
  var initializeFuzzfeed = (function(){
    if (checkForElement(".fuzzfeed-buttons")) {
      // on fuzzfeed page
      hideAllSiblings(".fuzzfeed-buttons");
      getArticles();
      addEventListenerToggleFuzzfeedButtons();
      addEventListenerNewArticleSubmit();
    } else {
      // not on fuzzfeed page
      removeEventListenerToggleFuzzfeedButtons();
      removeEventListenerNewArticleSubmit();
    }
  })();

}); // close document ready