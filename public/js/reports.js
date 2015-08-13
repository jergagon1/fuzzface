$(document).ready(function(){

	// in reports list - show add'l info for a report w/ comments on click
	$('body').on('click', '.report', function() {
		$(this).find('.more-report-info').toggle();
		// console.log($(this));
		var id = $(this).data().reportid;
		// console.log(id);
		$('.comment-div-'+id).toggle();
	});

	// update the user wags count when they submit a found pet report
	var updateWags = function(value) {
		$(".wags").text(value);
	};

	// lost pet form submission
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
			$(".main-buttons").siblings().first().slideUp("slow");
			$(".main-buttons").removeClass('selected-button');
		})
		.fail(function(){
			console.log('lost pet form submission failed');
		})
	});

	// found pet form submission
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

}); // document ready