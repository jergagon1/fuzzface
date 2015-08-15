$(function(){

	// Hide/collapse the lost or found forms or the reports list if open on page load
	var hideAllForms = function () {
		$(".fuzzfinders-buttons").siblings().hide();
	};

	// Add event listener for large buttons to show or hide form and list content on click
	var toggleFuzzfindersButtons = function(){
		$(".fuzzfinders-buttons").on("click", function(event){
		  event.preventDefault();
		  if ($(this).siblings().first().is(":hidden")){
		    $(this).siblings().first().slideDown("slow");
		    $(this).addClass("selected-button");
		  } else {
		    $(this).siblings().first().slideUp();
		    $(this).removeClass("selected-button");
		  }
		});
	};

	// in reports list - show add'l info for a report w/ comments on click
	var showReportDetailsEventHandler = function(){
		$('body').on('click', '.report', function() {
			$(this).find('.more-report-info').toggle();
			// console.log($(this));
			var id = $(this).data().reportid;
			// console.log(id);
			$('.comment-div-'+id).toggle();
		});
	};

	// update the user wags count when they submit a found pet report
	var updateWags = function(value) {
		$(".wags").text(value);
	};

	// lost pet form submission
	var lostPetFormSubmitEventHandler = function(){
		$(".lost-pet-form").on("submit", function(event){
			event.preventDefault();
			var formData = $(this).serialize();
			console.log(formData);
			$.ajax({
				url: "http://localhost:3000/api/v1/reports",
				type: "post",
				dataType: "json",
				data: formData
			})
			.done(function(response){
				console.log(response);
				$("input[type='text']").val('');
				$("textarea").val("");
				$("select").prop("selectedIndex", 0);
				$(".fuzzfinders-buttons").siblings().first().slideUp("slow");
				$(".fuzzfinders-buttons").removeClass('selected-button');
			})
			.fail(function(){
				console.log('lost pet form submission failed');
			})
		});
	};

	// found pet form submission
	var foundPetFormSubmitEventHandler = function(){
		$(".found-pet-form").on("submit", function(event){
			event.preventDefault();
			var formData = $(this).serialize();
			console.log(formData);
			$that = $(this);
			$.ajax({
				url: "http://localhost:3000/api/v1/reports",
				type: "post",
				dataType: "json",
				data: formData
			})
			.done(function(response){
				console.log(response);
				$("input[type='text']").val("");
				$("textarea").val("");
				$("select").prop("selectedIndex", 0);
				updateWags(response.wags)
				$that.parent().slideUp("slow");
				$that.parent().parent().children(":first").removeClass("selected-button");
			})
			.fail(function(){
				console.log('found pet form submission failed');
			})
		});
	};

	// Run functions if on FuzzFinders Page
	if (checkForElement(".fuzzfinders-buttons")) {
		hideAllForms();
		toggleFuzzfindersButtons();
		showReportDetailsEventHandler();
		lostPetFormSubmitEventHandler();
		foundPetFormSubmitEventHandler();
	}

}); // close document ready