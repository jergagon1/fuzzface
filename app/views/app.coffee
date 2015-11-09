window.distance = (lat1, lon1, lat2, lon2) ->
  radlat1 = Math.PI * lat1 / 180
  radlat2 = Math.PI * lat2 / 180
  radlon1 = Math.PI * lon1 / 180
  radlon2 = Math.PI * lon2 / 180
  theta = lon1 - lon2
  radtheta = Math.PI * theta / 180
  dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
  dist = Math.acos(dist)
  dist = dist * 180 / Math.PI
  dist = dist * 60 * 1.1515
  # if unit == 'K'
  #   dist = dist * 1.609344
  # if unit == 'N'
  #   dist = dist * 0.8684
  dist


$signInForm = $('form.signIn')
$signUpForm = $('form.signUp')

Cookies.set('distance', '1.5') unless Cookies.get('distance')

updateMenu = ->
  $.each($('.adjust-distance > li').find('a'), (el) ->
    miles = $(@).parent().data('miles')

    $(@).html("#{miles} miles")
  )

  $('.adjust-distance > li[data-miles="' + Cookies.get('distance') + '"]').find('a').html(
    "#{Cookies.get('distance')} miles <span class='glyphicon glyphicon-ok'></span>"
  )


updateDistance = (distance) ->
  Cookies.set('distance', distance)
  updateMenu()

$ ->
  $('.datetimepicker').datetimepicker(
    format: 'd/m/Y H:i A'
    # formatTime: 'H:i A'
    step: 30
    ampm: true
    maxDate: 0
  ).inputmask '99/99/9999 [9]9:99 **' # TODO: fix mask for dates

  updateMenu()

  $('.adjust-distance a').click ->
    miles = $(@).parent().data('miles')
    updateDistance(miles)

    false


  # $('.dropdown-toggle').dropdown()

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
