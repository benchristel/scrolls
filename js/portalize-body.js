"use strict"

//var oldOnload = window.onload
//window.onload = function() {
Lantern.whenPageLoaded(function () {
  //if(oldOnload) oldOnload.apply(window, arguments)
  var body = document.getElementsByTagName('body')[0]

  Lantern.portalize(body)

  body.style.padding = 0
  body.style.margin = 0
  body.style.bottom = 0
  body.style.height = '100%'
  Lantern.portal.top = 50
  Lantern.portal.width = 1000
  Lantern.portal.height = 600
  Lantern.portal.color = 'white'
})
