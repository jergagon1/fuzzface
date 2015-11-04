$signInForm = $('form.signIn')
$signUpForm = $('form.signUp')


$ ->
  if $signInForm || $signUpForm
    if $signUpForm
      $signUpForm.submit ->
        username = $('input[name="username"]', $signUpForm).val()
        zipcode = $('input[name="zipcode"]', $signUpForm).val()
        email = $('input[type="email"]', $signUpForm).val()
        password = $('input[type="password"]', $signUpForm).val()

        if email && password && username
          $.ajax(
            '/sign_up'
            type: 'post'
            dataType: 'json'
            data: {
              email: email, password: password,
              zipcode: zipcode, username: username
            }
          ).done((response) ->
            error = response.error || response.errors

            if !error
              location.href = '/'
              return

            errorText = ''

            $.each error, (key, value) ->
              errorText += "<li class=\"text-danger\"><strong>#{key.replace(/^./, key[0].toUpperCase())}</strong>: #{$.unique(value).join(',')}</li>"

            $('#signUpErrors').html("<ul>#{errorText}</ul>")
          )
        else
          $('#signUpErrors').text('You must fill required fields')

        false
    if $signInForm
      $signInForm.submit ->
        email = $('input[type="email"]', $signInForm).val()
        password = $('input[type="password"]', $signInForm).val()

        if email && password
          $.ajax(
            '/sign_in'
            type: 'post'
            dataType: 'json'
            data: { email: email, password: password }
          ).done((response) ->
            error = response.error || response.errors

            if !error
              location.href = '/'
              return
            $('#signInErrors').text error
          )
        else
          $('#signInErrors').text('You must fill both email and password fields')

        false
