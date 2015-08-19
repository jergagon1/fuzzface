$(function(){

	//------------------------- Model -------------------------------//

	// Model: lost pet form submission
	var lostPetFormSubmit = function($dataFromForm, $lostForm){
		console.log($dataFromForm);
		$.ajax({
			url: "http://localhost:3000/api/v1/reports",
			type: "post",
			dataType: "json",
			data: $dataFromForm
		})
		.done(function(response){
			console.log(response);
			resetViewOnFormSubmit($lostForm);
		})
		.fail(function(){
			console.log('lost pet form submission failed');
		})
	};

	// Model: found pet form submission
	var foundPetFormSubmit = function($dataFromForm, $foundForm){
		console.log($dataFromForm);
		$.ajax({
			url: "http://localhost:3000/api/v1/reports",
			type: "post",
			dataType: "json",
			data: $dataFromForm
		})
		.done(function(response){
			console.log(response);
			updateWags(response.wags);
			resetViewOnFormSubmit($foundForm);
		})
		.fail(function(){
			console.log('found pet form submission failed');
		})
	};

	//------------------------- View -------------------------------//

	// View: Hide/collapse the lost or found forms or reports list if open on page load
	var hideAllSiblings = function(element) {
		$(element).siblings().hide();
	};

	var slideCloseAllSiblings = function(element) {
		$(element).siblings().slideUp("slow");
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
	var toggleFuzzfindersButtons = function($button){
		slideCloseAllSiblings(".fuzzfinders-buttons");
		removeSelectedClassFromButton($(".fuzzfinders-buttons"));
	  if ($button.siblings().first().is(":hidden")){
	    slideDownRevealButtonSiblingContent($button);
	    addSelectedClassToButton($button);
	  } else {
	    slideUpHideButtonSiblingContent($button);
	    removeSelectedClassFromButton($button);
	  }
	};

	// View: update the user wags count to argument value
	var updateWags = function(value) {
		$(".wags").text(value);
	};

	// View: reset form input controls
	var resetFormInputs = function(){
		$("input[type='text']").val('');
		$("textarea").val("");
		$("select").prop("selectedIndex", 0);
	};

	// View: reset inputs and buttons on form submittal
	var resetViewOnFormSubmit = function($formElement){
		resetFormInputs();
		$formElement.parent().slideUp("slow");
		$formElement.parent().parent().children(":first").removeClass("selected-button");
		slideCloseAllSiblings(".fuzzfinders-buttons");
		removeSelectedClassFromButton($(".fuzzfinders-buttons"));
	};

	//------------------------- Controller -------------------------------//

	// Controller: Add event listener for large buttons to show or hide form and list content on click
	var addEventListenerToggleFuzzfindersButtons = function(){
		$(".fuzzfinders-buttons").on("click", function(event){
			event.preventDefault();
			var $clickedButton = $(this);
			toggleFuzzfindersButtons($clickedButton);
		});
	};

	// Controller: Remove event listener for large buttons to show or hide forms
	var removeEventListenerToggleFuzzfindersButtons = function(){
		$(".fuzzfinders-buttons").off("click");
	};

	// Controller: Add event listener for lost pet form submit button
	var addEventListenerLostPetFormSubmit = function(){
		$(".lost-pet-form").on("submit", function(event){
			event.preventDefault();
			var $form = $(this);
			var $formData = $(this).serialize();
			lostPetFormSubmit($formData, $form);
		});
	};

	// Controller: Remove event listener for lost pet form submit button
	var removeEventListenerLostPetFormSubmit = function(){
		$(".lost-pet-form").off("submit");
	};

	// Controller: Add event listener for found pet form submit button
	var addEventListenerFoundPetFormSubmit = function(){
		$(".found-pet-form").on("submit", function(event){
			event.preventDefault();
			var $form = $(this);
			var $formData = $(this).serialize();
			foundPetFormSubmit($formData, $form);
		});
	};

	// Controller: Remove event listener for found pet form submit button
	var removeEventListenerFoundPetFormSubmit = function(){
		$(".found-pet-form").off("submit");
	};

	// Controller: initialize event listeners if on FuzzFinders Page
	var initializeFuzzfinders = (function(){
		if (checkForElement(".fuzzfinders-buttons")) {
			hideAllSiblings(".fuzzfinders-buttons");
			addEventListenerToggleFuzzfindersButtons();
			addEventListenerLostPetFormSubmit();
			addEventListenerFoundPetFormSubmit();
		} else {
			removeEventListenerToggleFuzzfindersButtons();
			removeEventListenerLostPetFormSubmit();
			removeEventListenerFoundPetFormSubmit();
		}
	})();

}); // close document ready