$(function(){

	//========================== Model =============================//

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

	// Model: Adjust time value from local time to utc
	var adjustLocalTimeToUtc = function($formInput){
		// Todo
		// read form input value
		// determine timezone offset
		// convert localtime input to utc
		// write utc output value to form input value
	};

	// Model: check if a form input element has a value set
	var checkForValueInFormInput = function($input){
		console.log("checkForValueInFormInput");
		if($input.val() === ""){
			return false
		} else {
			return true
		}
	};

	//========================== View =============================//

	// Cache DOM Elements
	var $lostPetButton = $(".lost-pet");
	var $foundPetButton = $(".found-pet");
	var $reportButton = $(".report-btn");
	var $fuzzfindersButtons = $(".fuzzfinders-buttons");
	var $lostPetForm = $(".lost-pet-form");
	var $foundPetForm = $(".found-pet-form");
	var $wags = $(".wags");
	var $lostLastSeen = $("#lost-last-seen");
	var $lostLastSeenPlaceholder = $("#lost-last-seen-placeholder");
	var $foundLastSeen = $("#found-last-seen");
	var $foundLastSeenPlaceholder = $("#found-last-seen-placeholder");

	// View: Hide/collapse the lost or found forms or reports list if open on page load
	var hideAllForms = function() {
		console.log("hideAllForms");
		$fuzzfindersButtons.siblings().hide();
	};

	// View: Slide closed the lost form, the found form and the report list if open
	var slideUpAllForms = function() {
		console.log("slideUpAllForms");
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
	var slideDownButtonForm = function($button){
		$button.siblings().first().slideDown("slow");
	};

	// View: Slide closed the form or list adjacent to the passed-in button
	var slideUpButtonForm = function($button){
	  $button.siblings().first().slideUp();
	};

	// View: Slide open or closed form and list content adjacent to large buttons
	var toggleFuzzfindersButtons = function($button){
		console.log("toggleFuzzfindersButtons");
		slideUpAllForms();
		removeSelectedClassFromButton($fuzzfindersButtons);
	  if (checkIfFormSectionHidden($button)){
	    slideDownButtonForm($button);
	    addSelectedClassToButton($button);
	  } else {
	    slideUpButtonForm($button);
	    removeSelectedClassFromButton($button);
	  }
	};

	// View: determine if button form section is hidden
	var checkIfFormSectionHidden = function($button){
		console.log("checkIfFormSectionHidden");
		if ($button.siblings().first().is(":hidden")){
			console.log("hidden");
			return true
		}	else {
			console.log("not hidden");
			return false
		}
	};

	// View: update the user wags text to display argument value
	var updateWags = function(value) {
		$wags.text(value);
	};

	// View: reset form input controls
	var resetFormInputs = function(){
		console.log("resetFormInputs");
		$("input[type='text']").val('');
		$("textarea").val("");
		$("select").prop("selectedIndex", 0);
	};

	// View: reset inputs and buttons on form submittal
	var resetViewOnFormSubmit = function($formElement){
		console.log("resetViewOnFormSubmit");
		resetFormInputs();
		slideUpAllForms();
		removeSelectedClassFromButton($fuzzfindersButtons);
	};

	// View: toggle display of last-seen-placeholder and last-seen input fields
	var toggleDisplayLastSeenFormInputFields = function($lastSeen, $lastSeenPlaceholder){
		console.log("toggleDisplayLastSeenFormInputFields");
		$lastSeen.toggle();
		$lastSeenPlaceholder.toggle();
		if($lastSeenPlaceholder.is(":hidden")){
			console.log("lastSeenPlaceholder is hidden");
			$lastSeen.focus();
		}
	};

	//========================== Controller ==========================//

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

	// Controller: Add event listener on focus in lost form last seen field
	var addEventListenerFocusLostLastSeenPlaceholderInput = function(){
		$lostLastSeenPlaceholder.on("focus", function(event){
			toggleDisplayLastSeenFormInputFields($lostLastSeen, $lostLastSeenPlaceholder);
			removeEventListenerFocusLostLastSeenPlaceholderInput();
		});
	};

	// Controller: Remove event listener for focus in lost form last seen field
	var removeEventListenerFocusLostLastSeenPlaceholderInput = function(){
		$lostLastSeenPlaceholder.off("focus");
	};

	// Controller: Add Event Listener on focus in the found form last seen input field
	var addEventListenerFocusFoundLastSeenPlaceholderInput = function(){
		$foundLastSeenPlaceholder.on("focus", function(event){
			// console.log("in focus!");
			toggleDisplayLastSeenFormInputFields($foundLastSeen, $foundLastSeenPlaceholder);
			removeEventListenerFocusFoundLastSeenPlaceholderInput();
		});
	};

	// Controller: Remove Event Listener for focus in found form last seen input field
	var removeEventListenerFocusFoundLastSeenPlaceholderInput = function(){
		$foundLastSeenPlaceholder.off("focus");
	};

	// Controller: Add event listener for blur out off Lost form last seen input field
	// if there is not a value in the datetime-local input field,
	// toggle display of the placeholder text input field
	// else retain datetime-local display and value
	var addEventListenerBlurLostLastSeenInput = function(){
		$lostLastSeen.on("blur", function(){
			console.log("in blur!");
			if(checkForValueInFormInput($lostLastSeen) === false){
				toggleDisplayLastSeenFormInputFields($lostLastSeen, $lostLastSeenPlaceholder);
				addEventListenerFocusLostLastSeenPlaceholderInput();
			}
		});
	};

	// Controller: Remove event listener for blur out of Lost form last seen input field
	var removeEventListenerBlurLostLastSeenInput = function(){
		$lostLastSeen.off("blur");
	};

	// Controller: Add event listener for blur out off Found form last seen input field
	// if there is not a value in the datetime-local input field,
	// toggle display of the placeholder text input field
	// else retain datetime-local display and value
	var addEventListenerBlurFoundLastSeenInput = function(){
		$foundLastSeen.on("blur", function(){
			console.log("in blur!");
			if(checkForValueInFormInput($foundLastSeen) === false){
				toggleDisplayLastSeenFormInputFields($foundLastSeen, $foundLastSeenPlaceholder);
				addEventListenerFocusFoundLastSeenPlaceholderInput();
			}
		});
	};

	// Controller: Remove event listener for blur out of Found form last seen input field
	var removeEventListenerBlurFoundLastSeenInput = function(){
		$foundLastSeen.off("blur");
	};

	//--------------------- lost button ---------------------------//
	// Controller: bind events for lost pet form section
	var bindEventsLost = function(){
		addEventListenerLostPetFormSubmit();
		addEventListenerFocusLostLastSeenPlaceholderInput();
		addEventListenerBlurLostLastSeenInput();
	};

	// Controller: remove event listeners for lost pet form section
	var removeEventsLost = function(){
		// remove lost events
		removeEventListenerLostPetFormSubmit();
		removeEventListenerFocusLostLastSeenPlaceholderInput();
		removeEventListenerBlurLostLastSeenInput();
	};

	// Controller: Add event listener to lost button click
	var addEventListenerLostButtonClick = function(){
		$lostPetButton.on("click", function(event){
			event.preventDefault();
			// determine if open or closed
			if(checkIfFormSectionHidden($lostPetButton)){
				// bind events
				removeEventsFound();
				removeEventsReports();
				bindEventsLost();
			}	else {

				// remove events
				removeEventsLost();
			}
			toggleFuzzfindersButtons($lostPetButton);
		});
	};

	// Controller: remove event listener for lost button click
	var removeEventListenerLostButtonClick = function(){
		$lostPetButton.off("click");
	};

	//----------------------- found button -------------------------//

	// bind events for found pet form section
	var bindEventsFound = function(){
		console.log("bindEventsFound");
		addEventListenerFoundPetFormSubmit();
		addEventListenerFocusFoundLastSeenPlaceholderInput();
		addEventListenerBlurFoundLastSeenInput();
	};

	// remove events for found pet form section
	var removeEventsFound = function(){
		console.log("removeEventsFound");
		removeEventListenerFoundPetFormSubmit();
		removeEventListenerFocusFoundLastSeenPlaceholderInput();
		removeEventListenerBlurFoundLastSeenInput();
	};

	// add event listener on click of found pet form button
	var addEventListenerFoundButtonClick = function(){
		$foundPetButton.on("click", function(event){
			event.preventDefault();
			console.log("FoundButtonClick");
			// determine if open or closed
			if(checkIfFormSectionHidden($foundPetButton)){
				// bind events
				removeEventsLost();
				removeEventsReports();
				bindEventsFound();
			}	else {
				// remove events
				removeEventsFound();
			}
			toggleFuzzfindersButtons($foundPetButton);
		});
	};

	var removeEventListenerFoundButtonClick = function(){
		$foundPetButton.off("click");
	};

	//--------------------- reports button -------------------------//

  // bind events for found pet form section
  var bindEventsReports = function(){
  	// reports buttonevents
  };

  // remove events for found pet form section
  var removeEventsReports = function(){
  	// remove reports button events
  };

  // add event listener on click of found pet form button
  var addEventListenerReportButtonClick = function(){
    $reportButton.on("click", function(event){
      event.preventDefault();
      // determine if open or closed
      if(checkIfFormSectionHidden($reportButton)){
        // bind events
        removeEventsLost();
        removeEventsFound();
        bindEventsReports();
      } else {
        // remove events
        removeEventsReports();
      }
			toggleFuzzfindersButtons($reportButton);
    });
  };

  var removeEventListenerReportButtonClick = function(){
    $reportButton.off("click");
  };

	//----------------------- page load ---------------------------//

	// Controller: initialize event listeners if on FuzzFinders Page
	var initializeFuzzfinders = (function(){
		if (checkForElement(".fuzzfinders-buttons")) {
			// on fuzzfinders page
			hideAllForms();
			addEventListenerLostButtonClick();
			addEventListenerFoundButtonClick();
			addEventListenerReportButtonClick();
		} else {
			// not on fuzzfinders page
			removeEventsLost();
			removeEventListenerLostButtonClick();
			removeEventsFound();
			removeEventListenerFoundButtonClick();
			removeEventsReports();
			removeEventListenerReportButtonClick();
		}
	})();

}); // close document ready