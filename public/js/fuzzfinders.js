$(function(){

	//========================== Model =============================//

	// Model: Array to hold report comment subscriptions for pusher notifications
  myApp.fuzzfinders.model.subscribedReportComments = [];

  // Model: Subscribe to a channel for notifications of comments on a report
  myApp.fuzzfinders.model.subscribeReportComments = function(reportId) {
    if (myApp.fuzzfinders.model.subscribedReportComments.indexOf(reportId) === -1) {
      myApp.fuzzfinders.model.subscribedReportComments.push(reportId);
      var pusher = new Pusher(gon.pusher_key);
      var reportCommentsChannel = pusher.subscribe('report_comments_' + reportId);
      reportCommentsChannel.bind('report_commented', function(notification){
        var message = notification.message;
        var commentId = notification.comment_id;
        $('div.notification ul').prepend('<li class="report_comment_' + commentId + '">' + message + '</li>');
        setTimeout(function() {
          $('.report_comment_' + commentId).remove();
        }, myApp.fuzzflashDisplayLength);
      });
    }
  };

	// Model: lost pet form submission
	var lostPetFormSubmit = function($dataFromForm, $lostForm){
		console.log("fuzzfinders.js lostPetFormSubmit");
		console.log($dataFromForm);
		var link = myApp.fuzzfindersApiUrl + "/api/v1/reports";
		$.ajax({
			url: link,
			type: "post",
			dataType: "json",
			data: $dataFromForm
		})
		.done(function(response){
			console.log(response);
			resetViewOnFormSubmit($lostForm);
      myApp.fuzzfinders.model.subscribeReportComments(response.report.id);
		})
		.fail(function(){
			console.log('lost pet form submission failed');
		})
	};

	// Model: found pet form submission
	var foundPetFormSubmit = function($dataFromForm, $foundForm){
		console.log("fuzzfinders.js foundPetFormSubmit");
		console.log($dataFromForm);
		var link = myApp.fuzzfindersApiUrl + "/api/v1/reports";
		$.ajax({
			url: link,
			type: "post",
			dataType: "json",
			data: $dataFromForm
		})
		.done(function(response){
			console.log(response);
			updateWags(response.wags);
			resetViewOnFormSubmit($foundForm);
      myApp.fuzzfinders.model.subscribeReportComments(response.report.id);
		})
		.fail(function(){
			console.log('found pet form submission failed');
		})
	};

	// Model: check if a form input element has a value set
	var checkForValueInFormInput = function($input){
		console.log("fuzzfinders.js checkForValueInFormInput");
		if($input.val() === ""){
			return false
		} else {
			return true
		}
	};

	// Model: return the last_seen object from the serialized form array
	var retrieveLastSeenObject = function($formDataArray){
		console.log("fuzzfinders.js retrieveLastSeenObject");
		for (var i = 0; i < $formDataArray.length; i++) {
			if($formDataArray[i].name === "report[last_seen]"){
				return $formDataArray[i];
			}
		};
	};

	// Model: convert local time string to utc string
	var convertLocalToUtc = function(localDateTimeString){
		console.log("fuzzfinders.js convertLocalToUtc");
		var localTimeObj = moment(localDateTimeString);
		var utcTimeObj = localTimeObj.utc();
		return utcTimeObj.format();
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
		console.log("fuzzfinders.js hideAllForms");
		$fuzzfindersButtons.siblings().hide();
	};

	// View: Slide closed the lost form, the found form and the report list if open
	var slideUpAllForms = function() {
		console.log("fuzzfinders.js slideUpAllForms");
		$fuzzfindersButtons.siblings().slideUp("slow");
	};

	// View: Add the selected-button class to the passed-in button
	var addSelectedClassToButton = function($buttonToSelect){
		console.log("fuzzfinders.js addSelectedClassToButton");
		$buttonToSelect.addClass("selected-button");
	};

	// View: Remove the selected-button class from the passed-in button
	var removeSelectedClassFromButton = function($buttonToDeselect){
		console.log("fuzzfinders.js removeSelectedClassFromButton");
		$buttonToDeselect.removeClass("selected-button");
	};

	// View: Reveal the sibling content -form or list - of the passed-in button
	var slideDownButtonForm = function($button){
		console.log("fuzzfinders.js slideDownButtonForm");
		$button.siblings().first().slideDown("slow");
	};

	// View: Slide closed the form or list adjacent to the passed-in button
	var slideUpButtonForm = function($button){
		console.log("fuzzfinders.js slideUpButtonForm");
	  $button.siblings().first().slideUp();
	};

	// View: Slide open or closed form and list content adjacent to large buttons
	var toggleFuzzfindersButtons = function($button){
		console.log("fuzzfinders.js toggleFuzzfindersButtons");
	  if (checkIfFormSectionHidden($button)){
			slideUpAllForms();
			removeSelectedClassFromButton($fuzzfindersButtons);
	    slideDownButtonForm($button);
	    addSelectedClassToButton($button);
	  } else {
	  	slideUpAllForms();
			removeSelectedClassFromButton($fuzzfindersButtons);
	  }
	};

	// View: determine if button form section is hidden
	var checkIfFormSectionHidden = function($button){
		console.log("fuzzfinders.js checkIfFormSectionHidden");
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
		console.log("fuzzfinders.js updateWags");
		$wags.text(value);
	};

	// View: reset form input controls
	var resetFormInputs = function(){
		console.log("fuzzfinders.js resetFormInputs");
		$("input[type='text']").val('');
		$("textarea").val("");
		$("select").prop("selectedIndex", 0);
	};

	// View: reset inputs and buttons on form submittal
	var resetViewOnFormSubmit = function($formElement){
		console.log("fuzzfinders.js resetViewOnFormSubmit");
		resetFormInputs();
		slideUpAllForms();
		removeSelectedClassFromButton($fuzzfindersButtons);
		removeImageUploadPreviews();
		resetImageUpload();
	};

	// View: toggle display of last-seen-placeholder and last-seen input fields
	var toggleDisplayLastSeenFormInputFields = function($lastSeen, $lastSeenPlaceholder){
		console.log("fuzzfinders.js toggleDisplayLastSeenFormInputFields");
		$lastSeen.toggle();
		$lastSeenPlaceholder.toggle();
		if($lastSeenPlaceholder.is(":hidden")){
			console.log("lastSeenPlaceholder is hidden");
			$lastSeen.focus();
		}
	};

	// View: Remove preview images for image upload
	var removeImageUploadPreviews = function(){
		console.log("fuzzfinders.js removeImageUploadPreviews");
		$(".image-upload-preview").children().remove();
	};

	// View: reset image upload button progress bar and text
	var resetImageUpload = function(){
		console.log("fuzzfinders.js resetImageUpload");
		$(".bar").remove();
		$("input.img_url").val("");
	};

	//========================== Controller ==========================//

	// Controller: Add event listener for lost pet form submit button
	var addEventListenerLostPetFormSubmit = function(){
		console.log("fuzzfinders.js addEventListenerLostPetFormSubmit");
		$lostPetForm.on("submit", function(event){
			event.preventDefault();
			var $form = $(this);
			var $formData = $form.serializeArray();
			var lastSeenObject = retrieveLastSeenObject($formData);
			if(lastSeenObject.value !== ""){
				var utcTime = convertLocalToUtc(lastSeenObject.value);
				lastSeenObject.value = utcTime;
			}
			lostPetFormSubmit($formData, $form);
			removeEventsLost();
		});
	};

	// Controller: Remove event listener for lost pet form submit button
	var removeEventListenerLostPetFormSubmit = function(){
		console.log("fuzzfinders.js removeEventListenerLostPetFormSubmit");
		$lostPetForm.off("submit");
	};

	// Controller: Add event listener for found pet form submit button
	var addEventListenerFoundPetFormSubmit = function(){
		console.log("fuzzfinders.js addEventListenerFoundPetFormSubmit");
		$foundPetForm.on("submit", function(event){
			event.preventDefault();
			var $form = $(this);
			var $formData = $form.serializeArray();
			var lastSeenObject = retrieveLastSeenObject($formData);
			if(lastSeenObject.value !== ""){
				var utcTime = convertLocalToUtc(lastSeenObject.value);
				lastSeenObject.value = utcTime;
			}
			foundPetFormSubmit($formData, $form);
			removeEventsFound();
		});
	};

	// Controller: Remove event listener for found pet form submit button
	var removeEventListenerFoundPetFormSubmit = function(){
		console.log("fuzzfinders.js removeEventListenerFoundPetFormSubmit");
		$foundPetForm.off("submit");
	};

	// Controller: Add event listener on focus in lost form last seen field
	var addEventListenerFocusLostLastSeenPlaceholderInput = function(){
		console.log("fuzzfinders.js addEventListenerFocusLostLastSeenPlaceholderInput");
		$lostLastSeenPlaceholder.on("focus", function(event){
			toggleDisplayLastSeenFormInputFields($lostLastSeen, $lostLastSeenPlaceholder);
			removeEventListenerFocusLostLastSeenPlaceholderInput();
		});
	};

	// Controller: Remove event listener for focus in lost form last seen field
	var removeEventListenerFocusLostLastSeenPlaceholderInput = function(){
		console.log("fuzzfinders.js removeEventListenerFocusLostLastSeenPlaceholderInput");
		$lostLastSeenPlaceholder.off("focus");
	};

	// Controller: Add Event Listener on focus in the found form last seen input field
	var addEventListenerFocusFoundLastSeenPlaceholderInput = function(){
		console.log("fuzzfinders.js addEventListenerFocusFoundLastSeenPlaceholderInput");
		$foundLastSeenPlaceholder.on("focus", function(event){
			// console.log("in focus!");
			toggleDisplayLastSeenFormInputFields($foundLastSeen, $foundLastSeenPlaceholder);
			removeEventListenerFocusFoundLastSeenPlaceholderInput();
		});
	};

	// Controller: Remove Event Listener for focus in found form last seen input field
	var removeEventListenerFocusFoundLastSeenPlaceholderInput = function(){
		console.log("fuzzfinders.js removeEventListenerFocusFoundLastSeenPlaceholderInput");
		$foundLastSeenPlaceholder.off("focus");
	};

	// Controller: Add event listener for blur out off Lost form last seen input field
	// if there is not a value in the datetime-local input field,
	// toggle display of the placeholder text input field
	// else retain datetime-local display and value
	var addEventListenerBlurLostLastSeenInput = function(){
		console.log("fuzzfinders.js addEventListenerBlurLostLastSeenInput");
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
		console.log("fuzzfinders.js removeEventListenerBlurLostLastSeenInput");
		$lostLastSeen.off("blur");
	};

	// Controller: Add event listener for blur out off Found form last seen input field
	// if there is not a value in the datetime-local input field,
	// toggle display of the placeholder text input field
	// else retain datetime-local display and value
	var addEventListenerBlurFoundLastSeenInput = function(){
		console.log("fuzzfinders.js addEventListenerBlurFoundLastSeenInput");
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
		console.log("fuzzfinders.js removeEventListenerBlurFoundLastSeenInput");
		$foundLastSeen.off("blur");
	};

	//--------------------- lost button ---------------------------//
	// Controller: bind events for lost pet form section
	var bindEventsLost = function(){
		console.log("fuzzfinders.js bindEventsLost");
		addEventListenerLostPetFormSubmit();
		addEventListenerFocusLostLastSeenPlaceholderInput();
		addEventListenerBlurLostLastSeenInput();
	};

	// Controller: remove event listeners for lost pet form section
	var removeEventsLost = function(){
		console.log("fuzzfinders.js removeEventsLost");
		// remove lost events
		removeEventListenerLostPetFormSubmit();
		removeEventListenerFocusLostLastSeenPlaceholderInput();
		removeEventListenerBlurLostLastSeenInput();
	};

	// Controller: Add event listener to lost button click
	var addEventListenerLostButtonClick = function(){
		console.log("fuzzfinders.js addEventListenerLostButtonClick");
		$lostPetButton.on("click", function(event){
			event.preventDefault();
			// determine if open or closed
			if(checkIfFormSectionHidden($lostPetButton)){
				// bind events
				removeEventsLost();
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
		console.log("fuzzfinders.js removeEventListenerLostButtonClick");
		$lostPetButton.off("click");
	};

	//----------------------- found button -------------------------//

	// bind events for found pet form section
	var bindEventsFound = function(){
		console.log("fuzzfinders.js bindEventsFound");
		addEventListenerFoundPetFormSubmit();
		addEventListenerFocusFoundLastSeenPlaceholderInput();
		addEventListenerBlurFoundLastSeenInput();
	};

	// remove events for found pet form section
	var removeEventsFound = function(){
		console.log("fuzzfinders.js removeEventsFound");
		removeEventListenerFoundPetFormSubmit();
		removeEventListenerFocusFoundLastSeenPlaceholderInput();
		removeEventListenerBlurFoundLastSeenInput();
	};

	// add event listener on click of found pet form button
	var addEventListenerFoundButtonClick = function(){
		console.log("fuzzfinders.js addEventListenerFoundButtonClick");
		$foundPetButton.on("click", function(event){
			event.preventDefault();
			console.log("FoundButtonClick");
			// determine if open or closed
			if(checkIfFormSectionHidden($foundPetButton)){
				// bind events
				removeEventsFound();
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
		console.log("fuzzfiners.js removeEventListenerFoundButtonClick");
		$foundPetButton.off("click");
	};

	//--------------------- reports button -------------------------//

  // bind events for found pet form section
  var bindEventsReports = function(){
  	console.log("fuzzfinders.js bindEventsReports");
  	// reports buttonevents
  };

  // remove events for found pet form section
  var removeEventsReports = function(){
  	console.log("fuzzfinders.js removeEventsReports");
  	// remove reports button events
  };

  // add event listener on click of found pet form button
  var addEventListenerReportButtonClick = function(){
  	console.log("fuzzfinders.js addEventListenerReportButtonClick");
    $reportButton.on("click", function(event){
      event.preventDefault();
      // determine if open or closed
      if(checkIfFormSectionHidden($reportButton)){
        // bind events
        removeEventsReports();
  			myApp.fuzzfinders.view.closeReportFilterForm();
        removeEventsLost();
        removeEventsFound();
        bindEventsReports();
      } else {
        // remove events
        removeEventsReports();
  			myApp.fuzzfinders.view.closeReportFilterForm();
       }
			toggleFuzzfindersButtons($reportButton);
    });
  };

  var removeEventListenerReportButtonClick = function(){
  	console.log("fuzzfinders.js removeEventListenerReportButtonClick");
    $reportButton.off("click");
  };

	//----------------------- page load ---------------------------//

	// Controller: initialize event listeners if on FuzzFinders Page
	var initializeFuzzfinders = (function(){
		if (myApp.checkForElement(".fuzzfinders-buttons")) {
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
