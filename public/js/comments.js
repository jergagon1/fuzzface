$(document).ready(function(){

$(document).on("click", ".submit-comment", function(event){
		event.preventDefault();
		console.log($(this))
		var currentUserId = $('.reports-list').data().currentid
		console.log(currentUserId)
		var reportId = $(this).data().id
		var formData = $('.comment-'+ reportId).val();
		console.log(formData);
		console.log(reportId);
		$.ajax({
			url: "http://localhost:3000/api/v1/reports/"+ reportId +"/comments",
			type: "post",
			dataType: "json",
			data: {
				comment: {
					user_id: currentUserId,
					content: formData
				}
			}
		})
		.done(function(response){
			console.log(response);
		// 	$("input[type='text']").val('');
		// 	$("textarea").val("");
		// 	$("select").prop("selectedIndex", 0);
		// 	$(".main-buttons").siblings().first().slideUp("slow");
		// 	$(".main-buttons").removeClass('selected-button');
		})
		.fail(function(){
    console.log("create comment fail");
  });
		
	});


});