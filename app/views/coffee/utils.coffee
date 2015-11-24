$ ->
  if $('#comment-template').length
    Handlebars.registerPartial('comment', $('#comment-template').html())

  if $('#report-detail-title-template').length
    Handlebars.registerPartial('reportDetailTitle', $('#report-detail-title-template').html())

  if $('#report-field-template').length
    Handlebars.registerPartial('reportField', $('#report-field-template').html())

  Handlebars.registerHelper('lookupProp', (obj, prop) ->
    obj[prop]
  )

  Handlebars.registerHelper('if_eq', (a, b, opts) ->
    if (a == b)
      opts.fn(@)
    else
      opts.inverse(@)
  )
