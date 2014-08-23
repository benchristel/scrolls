"use strict"

// METAL

var Lantern = (function($) {
  var copyMethods = function(src, dest) {
    for (var k in src) if (typeof src[k] === 'function') dest[k] = src[k]
  }

  return ($.makeObject = function(base) {
    var api = base || {},
        internal = Object.create(api),
        installedModules = []

    api.mod = api.mod || function() {
      var i, thisModule, sup = {}

      for(i = 0; i < arguments.length; i++) {
        thisModule = arguments[i]
        if(installedModules.indexOf(thisModule) === -1) {
          copyMethods(internal, sup)
          copyMethods(api, sup)
          thisModule.call(null, api, internal, sup)
          installedModules.push(thisModule)
        }
      }

      return api
    }

    return api
  })($)
})({})

var $ = Lantern

// MODULES

Lantern.mod(function($) {
  $.createModule = function() {
    var moduleDefinitions = arguments

    return function(object) {
      object = $.makeObject(object)

      if (!$.isFunction(object.mod)) {
        throw new Error("You tried to mod an object that doesn't have a .mod method. Only objects created with Lantern.createObject can be modded")
      }

      $.forAll(moduleDefinitions, function(definition) {
        object.mod(definition)
      })
      return object
    }
  }
})

// UTILITIES

Lantern.mod(function($) {
  // Value definition
  $.given   = function(val) { return val !== undefined }
  $.missing = function(val) { return val === undefined }
  $.default = function(val, _default) {
    return $.given(val) ? val : _default
  }

  // Barely-useful utility functions
  $.noOp = function() {}
  $.identity = function(x) { return x }

  // Type-checking functions
  $.isFunction = function(thing) { return typeof thing === 'function' }
  $.isArray    = function(thing) { return thing instanceof Array }
  $.isObject   = function(thing) { return thing instanceof Object && !$.isArray(thing) && !$.isFunction(thing) }
  $.isString   = function(thing) { return typeof thing === 'string' }
  $.isNumber   = function(thing) { return +thing === thing && !$.isInfinite(thing) }
  $.isInfinite = function(thing) { return thing === Infinity || thing === -Infinity }
  $.isBoolean  = function(thing) { return thing === true || thing === false }

  // Iteration
  $.forAll = function(array, fn) {
    fn = fn || $.noOp
    for(var i = 0; i < array.length; i++) {
      fn(array[i], i)
    }
    return array
  }

  $.forAllPropertiesOf = function(object, fn) {
    var i = 0, prop
    fn = fn || $.noOp
    for(prop in object) {
      if (Object.prototype.hasOwnProperty.call(object, prop)) {
        fn(prop, object[prop], i++)
      }
    }
    return object
  }

  $.remove = function(item, array) {
    for (var i = array.length-1; i >= 0; i--) {
      if (array[i] === item) {
        array.splice(i, 1)
      }
    }
    return array
  }

  $.call = function(fn, args) {
    if ($.isFunction(fn)) {
      return fn.apply(null, args)
    }
  }
})

// EVENT DISPATCH

$.makeEvents = $.createModule(function(api, self) {
  api.fireEvent = function(event, data) {
    $.forAll(self.callbacksFor(event), function(handler) {
      $.call(handler, [event, data])
    })
  }

  api.registerEventHandler = function(event, handler) {
    self.callbacksFor(event).push(handler)
  }

  api.removeEventHandler = function(event, handler) {
    $.remove(handler, self.callbacksFor(event))
  }

  api.clearEventHandlers = function(event) {
    self.callbacksFor(event).length = 0
  }

  self.eventCallbacks = {}
  self.callbacksFor = function(event) {
    self.eventCallbacks[event] = self.eventCallbacks[event] || []
    return self.eventCallbacks[event]
  }

  self.registrarFor = function(event) {
    var registrar = function(handler) {
      self.registerEventHandler(event, handler)
    }

    registrar.doNot = function(handler) {
      self.removeEventHandler(event, handler)
    }

    registrar.doNothing = function() {
      self.clearEventHandlers(event)
    }

    return registrar
  }
})

// PROPERTIES

$.makePropertyChangeEvents = $.createModule($.makeEvents, function(api, self) {
  var props = self.propertyValues = {}
  self.defineProperty = function(name, value) {
    props[name] = value
    var descriptor =
        { enumerable:   true
        , configurable: false
        , get: function() { return props[name] }
        , set: function(newValue) {
            var oldValue = props[name]
            props[name] = newValue
            $.call(self.fireEvent, ['propertyChanged', {property: name, oldValue: oldValue, newValue: newValue}])
          }
        }
    Object.defineProperty(api, name, descriptor)
  }
})

$.makeAliasedProperties = $.createModule(function(api, self) {
  self.aliasProperty = function(alias, name) {
    var descriptor =
        { enumerable:   false
        , configurable: false
        , get: function() { return api[name] }
        , set: function(newValue) { api[name] = newValue }
        }
    Object.defineProperty(api, alias, descriptor)
  }
})

$.makeConstants = $.createModule(function(api, self) {
  var constants = self.constantValues = {}
  self.defineConstant = function(name, value) {
    constants[name] = value
    var descriptor =
        { enumerable:   true
        , configurable: false
        , get: function() { return constants[name] }
        , set: function() { throw "You can't change the value of "+name }
        }
    Object.defineProperty(api, name, descriptor)
  }
})

$.makePositionable = $.createModule(function(self) {
  self.top    = 0
  self.left   = 0
  self.height = 0
  self.width  = 0

  self.centerHorizontallyOn = function(other) {
    self.left = other.left + other.width / 2 - self.width / 2
  }

  self.centerVerticallyOn = function(other) {
    self.top = other.top + other.height / 2 - self.height / 2
  }

  self.putAbove = function(other, spacing) {
    self.top = other.top - self.height - (spacing || 0)
  }

  self.putBelow = function(other, spacing) {
    self.top = other.top + other.height + (spacing || 0)
  }
})

Lantern.mod(function($, $internal) {
  $internal.uiElements = []

  var addElement = function(tag) {
    var elem = document.createElement(tag || 'div')

    appendToPortal(elem)
    return elem
  }

  var appendToPortal = function(elem) {
    $internal.uiElements.push(elem)
    if ($internal.portalDomElement) {
      addElementsAsChildrenOf($internal.portalDomElement, elem)
    }
  }

  var addElementsAsChildrenOf = function(parent, elements) {
    if (!parent) return
    if ($.isArray(elements)) {
      $.forAll(elements, function(elem) {
        parent.appendChild(elem)
      })
    } else {
      parent.appendChild(elements)
    }
  }

  var toNumericString = function(thing) {
    if (!thing) {
      return '0'
    }
    return String(Number(thing))
  }

  var toCss = function(obj) {
    var ary = []
    $.forAllPropertiesOf(obj, function(k, v) {
      ary.push(k + ":" + v + ";")
    })

    return ary.join("")
  }

  var nextId = 0
  var generateHtmlId = function() {
    return 'lantern-element-'+(nextId++)
  }

  $.makeUiElement = $.createModule(
      $.makeEvents,
      $.makeConstants,
      $.makePositionable,
      $.makePropertyChangeEvents,
    function(api, self) {
      self.domElement = document.createElement(api.tag || 'div') //addElement(api.tag)

      api.appendChild = function(childDomElement) {
        self.domElement.appendChild(childDomElement)
      }
      api.appendTo = function(parent) {
        parent.appendChild(self.domElement)
      }

      $.forAllPropertiesOf(
        { whenClicked:             self.registrarFor('clicked')
        , whenMouseEnters:         self.registrarFor('mouseEnters')
        , whenMouseLeaves:         self.registrarFor('mouseLeaves')
        , whenMouseMoves:          self.registrarFor('mouseMoves')
        , whenKeyPressed:          self.registrarFor('keyPressed')
        , whenKeyReleased:         self.registrarFor('keyReleased')
        , whenInputChanged:        self.registrarFor('inputChanged')
        },
        self.defineConstant
      )

      self.setEventHandlers = function(attrs) {
        var el = self.domElement
        el.onclick     = function() { api.fireEvent('clicked') }
        el.onmouseover = function() { api.fireEvent('mouseEnters') }
        el.onmouseout  = function() { api.fireEvent('mouseLeaves') }
        el.onmousemove = function() { api.fireEvent('mouseMoves') }
        el.onkeydown   = function() { api.fireEvent('keyPressed') }

        el.onkeyup = function() {
          self.withoutRedrawing(function() {
            api.fireEvent('inputMayHaveChanged')
          })
          api.fireEvent('keyReleased')
          api.redraw()
        }
        el.onchange = function() {
          self.withoutRedrawing(function() {
            api.fireEvent('inputMayHaveChanged')
          })
          api.fireEvent('changed')
          api.redraw()
        }
      }
      self.setEventHandlers()

      self.withoutRedrawing = function(fn) {
        var old = api.redraw
        api.redraw = $.noOp
        fn()
        api.redraw = old
      }

      $.forAllPropertiesOf(
        { id:   generateHtmlId()
        , top:  0
        , left: 0
        , height: 50
        , width:  100
        , visible: true
        , color: 'white'
        , borderWidth: 1
        , borderColor: 'lightGray'
        , scrollable: false
        , cursor: 'auto'
        , data: {} // this property is not used by Lantern; it's for the user to store their own data
        },
        self.defineProperty
      )

      api.redraw = function () {
        self.setAttributes(self.htmlAttributes())
      }

      api.registerEventHandler('propertyChanged', function() { api.redraw() })

      self.setAttributes = function(attrs) {
        $.forAllPropertiesOf(attrs, function(name, value) {
          self.domElement.setAttribute(name, value)
        })
      }

      self.htmlAttributes = function() {
        return {
          style: self.toCss()
        , id: api.id
        }
      }

      self.toCss = function() { return toCss(self.asCss()) }
      self.asCss = function() {
        var css =
          { 'top'    : toNumericString(api.top)+'px'
          , 'left'   : toNumericString(api.left)+'px'
          , 'height' : toNumericString(api.height)+'px'
          , 'width'  : toNumericString(api.width)+'px'
          , 'color'  : api.textColor //$.COLOR[target.textColor]
          , 'background-color' : api.color //$.COLOR[target.color]
          , 'display' : (api.visible ? 'block' : 'none')
          , 'border-color' : api.borderColor //$.COLOR[target.borderColor]
          , 'border-width' : toNumericString(api.borderWidth)+'px'
          , 'border-style' : 'solid'
          , 'position' : 'absolute'
          , 'font-size' : toNumericString(api.fontSize)+'px'
          , 'white-space' : 'pre-wrap'
          , 'overflow-x' : 'hidden'
          , 'overflow-y' : (api.scrollable ? 'auto' : 'hidden')
          , 'cursor' : api.cursor
          , 'z-index' : -1
          }
        return css
      }
    }
  )

  $internal.makeRelativePositionedElement = $.createModule(
    $.makeUiElement,
    function(self, shared, inherited) {
      shared.asCss = function() {
        var css = inherited.asCss()
        css.position = 'relative'
        css['margin-left'] = 'auto'
        css['margin-right'] = 'auto'
        return css
      }
    }
  )

  $internal.makeTextContainerElement = $.createModule(
    $.makeUiElement,
    function(api, self, inherited) {
      $.forAllPropertiesOf(
        { text: ''
        , fontSize: 20
        , textColor: 'black'
        },
        self.defineProperty
      )

      api.redraw = function() {
        inherited.redraw()
        self.domElement.innerHTML = self.getDisplayText()
      }

      self.getDisplayText = function() {
        return self.text
      }
    }
  )

  $.createButton = function() {
    var button = $internal.makeTextContainerElement({tag: 'button'})
    $internal.uiElements.push(button)
    button.appendTo($.portal)
    button.redraw()
    return button
  }
})

Lantern.mod(function($, $shared) {
  $.background = $.makeUiElement().mod(function(self, shared, inherited) {
    shared.asCss = function() {
      var css = inherited.asCss()
      delete css.height
      css.width = '100%'
      css.top = '0'
      css.bottom = '0'
      css.border = 'none'
      return css
    }
  })
  $.background.id = 'lantern-background'
  $.background.color = 'black'

  $.portal = $shared.makeRelativePositionedElement()
  $.portal.top = 50
  $.portal.width = 1000
  $.portal.height = 600
  $.portal.id = 'lantern-portal'
  $.portal.appendTo($.background)

  var oldOnload = window.onload
  window.onload = function() {
    if(oldOnload) oldOnload.apply(window, arguments)
    var body = document.getElementsByTagName('body')[0]
    body.setAttribute('style', 'padding:0;margin:0')
    $.background.appendTo(body)

    $.forAll($shared.uiElements, function(elem) {
      elem.appendTo($.portal)
    })
  }
})

Lantern.$noConflict = $
var $ = Lantern
