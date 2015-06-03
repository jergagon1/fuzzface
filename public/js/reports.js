

$(document).ready(function(){
	console.log("hello");
	$(".lost-pet-form").on("submit", function(event){
		event.preventDefault();
		var formData = $(this).serialize();
		console.log(formData);
		$.ajax({
			url: "http://localhost:3001/api/v1/reports",
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
		})
		.fail(function(){
			console.log('fail');
		})


	});

	$(".found-pet-form").on("submit", function(event){
		event.preventDefault();
		var formData = $(this).serialize();
		console.log(formData);
		$.ajax({
			url: "http://localhost:3001/api/v1/reports",
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
		})
		.fail(function(){
			console.log('fail');
		})
	})

});