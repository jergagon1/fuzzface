$ ->
  Handlebars.registerPartial('comment', $('#comment-template').html())
  Handlebars.registerPartial('reportDetailTitle', $('#report-detail-title-template').html())
  Handlebars.registerPartial('reportField', $('#report-field-template').html())
  Handlebars.registerHelper('lookupProp', (obj, prop) ->
    obj[prop]
  )
