$(function() {
  window.createDirectUploadForms = function(){
    $('.directUpload').each(function(i, elem) {
      var fileInput = $(elem);
      var form = $(fileInput.parents('form:first'));
      var submitButton = form.find('input[type="submit"]');
      var progressBar = $("<div class='bar'></div>");
      var barContainer = $("<div class='progress'></div>").append(progressBar);
      var imagePreviewDiv = form.find(".image-upload-preview");

      fileInput.after(barContainer);

      fileInput.fileupload({
        fileInput: fileInput,
        url: gon.api_server + '/api/v1/images?user_email=' + gon.email + '&user_token=' + gon.auth_token,
        type: 'post',
        autoUpload: true,
        paramName: 'image',
        dataType: 'json',
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

          var url = data.jqXHR.responseJSON.image.normal.url;

          $('.img_url').val(url);

          // var input = $("<input />", {
          //   type: 'hidden',
          //   name: fileInput.attr('name'), //we don't have this
          //   value: url
          // });
          //
          // form.append(input);

          var imagePreview = '<img class="upload-preview-image" src="' + url + '">'
          imagePreviewDiv.html('');
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

  window.initializeDirectUpload = (function(){
    if (myApp.checkForElement(".directUpload")) {
      // on page with direct image uploads
      createDirectUploadForms();
    }
  })();
}); // close document ready
