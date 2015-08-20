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

	// Cache DOM Elements
	var $fuzzfindersButtons = $(".fuzzfinders-buttons");
	var $lostPetForm = $(".lost-pet-form");
	var $foundPetForm = $(".found-pet-form");
	var $wags = $(".wags");
	var $lostLastSeen = $("#lost-last-seen");
	var $lostLastSeenPlaceholder = $("#lost-last-seen-placeholder");
	var $foundLastSeen = $("#found-last-seen");
	var $foundLastSeenPlaceholder = $("found-last-seen-placeholder");

	// View: Hide/collapse the lost or found forms or reports list if open on page load
	var hideAllSiblings = function() {
		$fuzzfindersButtons.siblings().hide();
	};

	// View: Slide closed the lost form, the found form and the report list if open
	var slideCloseAllSiblings = function() {
		$fuzzfindersButtons.siblings().slideUp("slow");
	};

	// View: Add the selected-button class to the passed-in button
	var addSelectedClassToButton = function($buttonToSelect){
		$buttonToSelect.addClass("selected-button");
	};

	// View: Remove the selected-button class from the passed-in button
	var removeSelectedClassFromButton = function($buttonToDeselect){
		$buttonToDeselect.removeClass("selected-button");
	};

	// View: Reveal the sibling content -form or list - of the passed-in button
	var slideDownRevealButtonSiblingContent = function($adjacentButton){
		$adjacentButton.siblings().first().slideDown("slow");
	};

	// View: Slide closed the form or list adjacent to the passed-in button
	var slideUpHideButtonSiblingContent = function($adjacentButton){
	  $adjacentButton.siblings().first().slideUp();
	};

	// View: Slide open or closed form and list content adjacent to large buttons
	var toggleFuzzfindersButtons = function($button){
		slideCloseAllSiblings();
		removeSelectedClassFromButton($fuzzfindersButtons);
	  if ($button.siblings().first().is(":hidden")){
	    slideDownRevealButtonSiblingContent($button);
	    addSelectedClassToButton($button);
	  } else {
	    slideUpHideButtonSiblingContent($button);
	    removeSelectedClassFromButton($button);
	  }
	};

	// View: update the user wags text to display argument value
	var updateWags = function(value) {
		$wags.text(value);
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
		slideCloseAllSiblings();
		removeSelectedClassFromButton($fuzzfindersButtons);
	};

	// View: toggle display of last-seen-placeholder and last-seen input fields
	var toggleDisplayLastSeenFormInputFields = function($lastSeen, $lastSeenPlaceholder){
		$lastSeen.toggle();
		$lastSeenPlaceholder.toggle();
	};

	//------------------------- Controller -------------------------------//

	// Controller: Add event listener for large buttons to show or hide form and list content on click
	var addEventListenerToggleFuzzfindersButtons = function(){
		$fuzzfindersButtons.on("click", function(event){
			event.preventDefault();
			var $clickedButton = $(this);
			toggleFuzzfindersButtons($clickedButton);
		});
	};

	// Controller: Remove event listener for large buttons to show or hide forms
	var removeEventListenerToggleFuzzfindersButtons = function(){
		$fuzzfindersButtons.off("click");
	};

	// Controller: Add event listener for lost pet form submit button
	var addEventListenerLostPetFormSubmit = function(){
		$lostPetForm.on("submit", function(event){
			event.preventDefault();
			var $form = $(this);
			var $formData = $form.serialize();
			lostPetFormSubmit($formData, $form);
		});
	};

	// Controller: Remove event listener for lost pet form submit button
	var removeEventListenerLostPetFormSubmit = function(){
		$lostPetForm.off("submit");
	};

	// Controller: Add event listener for found pet form submit button
	var addEventListenerFoundPetFormSubmit = function(){
		$foundPetForm.on("submit", function(event){
			event.preventDefault();
			var $form = $(this);
			var $formData = $form.serialize();
			foundPetFormSubmit($formData, $form);
		});
	};

	// Controller: Remove event listener for found pet form submit button
	var removeEventListenerFoundPetFormSubmit = function(){
		$foundPetForm.off("submit");
	};

	var addEventListenerFocusLastSeenPlaceholderInput = function(){
		$lastSeenPlaceholder.on("focus", function(event){
			console.log("in focus!");
			toggleDisplayLastSeenFormInputFields();
			removeEventListenerFocusLastSeenPlaceholderInput();
		});
	};

	var removeEventListenerFocusLastSeenPlaceholderInput = function(){
		$lastSeenPlaceholder.off("focus");
	};

	// bind events on click of lost pet form button
	var bindEventsLostForm = function(){

	};

	// remove event listeners for lost pet form button
	var removeEventsLostForm = function(){

	};

	// Controller: initialize event listeners if on FuzzFinders Page
	var initializeFuzzfinders = (function(){
		if (checkForElement(".fuzzfinders-buttons")) {
			// on fuzzfinders page
			hideAllSiblings();
			addEventListenerToggleFuzzfindersButtons();
			addEventListenerLostPetFormSubmit();
			addEventListenerFoundPetFormSubmit();
			addEventListenerFocusLastSeenPlaceholderInput();

		} else {
			// not on fuzzfinders page
			removeEventListenerToggleFuzzfindersButtons();
			removeEventListenerLostPetFormSubmit();
			removeEventListenerFoundPetFormSubmit();
			removeEventListenerFocusLastSeenPlaceholderInput();
		}
	})();

}); // close document ready