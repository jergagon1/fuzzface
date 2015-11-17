$(function() {

  //========================== Model ==========================//

  // Model: retrieve articles for feed
  var getArticles = function() {
    console.log("fuzzfeed.js getArticles");
    var link = myApp.fuzzfindersApiUrl + "/api/v1/articles.json?user_email=" + gon.email + "&user_token=" + gon.auth_token;
    $.ajax({
     url: link,
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
    console.log("fuzzfeed.js newArticleSubmit");
    $.ajax({
      url: $articleForm.attr("action") + "?user_email=" + gon.email + "&user_token=" + gon.auth_token,
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

  //========================== View ==========================//

  // View: Hide/collapse the lost or found forms or reports list if open on page load
  var hideAllSiblings = function(element) {
    console.log("fuzzfeed.js hideAllSiblings");
    $(element).siblings().hide();
  };

  var addSelectedClassToButton = function($buttonToSelect){
    console.log("fuzzfeed.js addSelectedClassToButton");
    $buttonToSelect.addClass("selected-button");
  };

  var removeSelectedClassFromButton = function($buttonToDeselect){
    console.log("fuzzfeed.js removeSelectedClassFromButton");
    $buttonToDeselect.removeClass("selected-button");
  };

  var slideDownRevealButtonSiblingContent = function($adjacentButton){
    console.log("fuzzfeed.js slideDownRevealButtonSiblingContent");
    $adjacentButton.siblings().first().slideDown("slow");
  };

  var slideUpHideButtonSiblingContent = function($adjacentButton){
    console.log("fuzzfeed.js slideUpHideButtonSiblingContent");
    $adjacentButton.siblings().first().slideUp();
  };

  // View: Slide open or close form and list content adjacent to large buttons
  var toggleFuzzfeedButtons = function($button){
    console.log("fuzzfeed.js toggleFuzzfeedButtons");
    if ($button.siblings().first().is(":hidden")){
      slideDownRevealButtonSiblingContent($button);
      addSelectedClassToButton($button);
    } else {
      slideUpHideButtonSiblingContent($button);
      removeSelectedClassFromButton($button);
    }
  };

  // View: render handlebars templates
  window.renderTemplates = function(context, $templateLocation, $listLocation, prepend) {
    console.log("fuzzfeed.js renderTemplates");
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
    console.log("fuzzfeed.js resetArticleForm");
    $(".new-article")[0].reset();
    $form.slideUp("slow");
    $form.parent().children(":first").removeClass("selected-button");
  };

  //======================== Controller ========================//

  var addEventListenerToggleFuzzfeedButtons = function(){
    console.log("fuzzfeed.js addEventListenerToggleFuzzfeedButtons");
    $(".fuzzfeed-buttons").on("click", function(event){
      event.preventDefault();
      var $clickedButton = $(this);
      toggleFuzzfeedButtons($clickedButton);
    });
  };

  var removeEventListenerToggleFuzzfeedButtons = function(){
    console.log("fuzzfeed.js removeEventListenerToggleFuzzfeedButtons");
    $(".fuzzfeed-buttons").off("click");
  };

  // Controller: add event listener for new article submit button
  var addEventListenerNewArticleSubmit = function(){
    console.log("fuzzfeed.js addEventListenerNewArticleSubmit");
    $(".new-article").on("submit", function(event) {
      event.preventDefault();
      var $form = $(this);
      var $formData = $(this).serialize();
      newArticleSubmit($formData, $form);
    });
  };

  var removeEventListenerNewArticleSubmit = function(){
    console.log("fuzzfeed.js removeEventListenerNewArticleSubmit");
    $(".new-article").off("submit")
  };

  // Controller: initialize functions and eventlisteners if on fuzzfeed page
  var initializeFuzzfeed = (function(){
    if (myApp.checkForElement(".fuzzfeed-buttons")) {
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
