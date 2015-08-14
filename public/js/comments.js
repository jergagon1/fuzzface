$(function(){

	$(document).on("click", ".submit-comment", function(event){
		event.preventDefault();
		var currentUserId = $('.reports-list').data().currentid;
		var reportId = $(this).data().id;
		var formData = $('.comment-'+ reportId).val();
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
			renderComment([response], reportId);
		})
		.fail(function(){
    	console.log("create comment fail");
  	});
	});

}); // close document ready