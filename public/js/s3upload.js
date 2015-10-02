$(function() {
  var createDirectUploadForms = function(){
    $('.directUpload').each(function(i, elem) {
      var fileInput = $(elem);
      // console.log(fileInput);
      var form = $(fileInput.parents('form:first'));
      var submitButton = form.find('input[type="submit"]');
      var progressBar = $("<div class='bar'></div>");
      var barContainer = $("<div class='progress'></div>").append(progressBar);
      var imagePreviewDiv = form.find(".image-upload-preview");
      fileInput.after(barContainer);
      // console.log(gon);
      fileInput.fileupload({
        fileInput: fileInput,
        url: gon.s3_hash.urlstring,
        type: 'POST',
        autoUpload: true,
        formData: gon.s3_hash.fields,
        paramName: 'file', // S3 does not like nested name fields i.e. name="user[avatar_url]"
        dataType: 'XML', // S3 returns XML if success_action_status is set to 201
        replaceFileInput: false,
        progressall: function(e, data) {
          var progress = parseInt(data.loaded / data.total * 100, 10);
          progressBar.css('width', progress + '%')
        },
        start: function(e) {
          submitButton.prop('disabled', true);
          progressBar.
          css('background', 'green').
          css('display', 'block').
          css('width', '0%').
          text("Loading...");
        },
        done: function(e, data) {
          submitButton.prop('disabled', false);
          progressBar.text("Uploading done");

          // extract key and generate URL from response
          var key = $(data.jqXHR.responseXML).find("Key").text();
          //var url = gon.s3_hash.urlstring + key;
          url = $(data.jqXHR.responseText).find("Location").text()
          // console.log(data);
          $(".img_url").val(url);
          // console.log(url);
          // create hidden field
          var input = $("<input />", {
            type: 'hidden',
            name: fileInput.attr('name'), //we don't have this
            value: url
          })
          form.append(input);
          var imagePreview = '<img class="upload-preview-image" src="' + url + '">'
          console.log(imagePreview);
          imagePreviewDiv.append(imagePreview);
        },
        fail: function(e, data) {
          submitButton.prop('disabled', false);
          progressBar.
          css("background", "red").
          text("Failed");
        }
      });
    });
  };

  var initializeDirectUpload = (function(){
    if (myApp.checkForElement(".directUpload")) {
      // on page with direct image uploads
      createDirectUploadForms();
    }
  })();

}); // close document ready
