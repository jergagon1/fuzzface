$(document).ready(function(){

	$('body').on('click', '.report', function() {
		$(this).find('.more-report-info').toggle();
		console.log($(this));
		var id = $(this).data().reportid
		console.log(id)
		$('.comment-div-'+id).toggle();
	});

	var updateWags = function(value) {
		$(".wags").text(value)
	}
	// lost pet form submission
	$(".lost-pet-form").on("submit", function(event){
		event.preventDefault();
		var formData = $(this).serialize();
		console.log(formData);
		$that = $(this)
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
			console.log('fail');
		})
	});

	// found pet form submission
	$(".found-pet-form").on("submit", function(event){
		event.preventDefault();
		var formData = $(this).serialize();
		console.log(formData);
		that = $(this)
		$.ajax({
			url: "http://localhost:3000/api/v1/reports",
			type: "post",
			dataType: "json",
			data: formData
		})
		.done(function(response){
			console.log(response);
			// debugger
			$("input[type='text']").val('');
			$("textarea").val("");
			$("select").prop("selectedIndex", 0);
			updateWags(response.wags)
			// debugger
			that.parent().slideUp("slow");
			that.parent().parent().children(":first").removeClass("selected-button");
		})
		.fail(function(){
			console.log('fail');
		})
	});



});