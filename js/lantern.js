"use strict"

// KERNEL

var Lantern = (function($) {
  var copyMethods = function(from, to, fn) {
    for (var k in from) if (typeof from[k] === 'function') to[k] = from[k]
  }

  return ($.makeObject = function(base) {
    var api = base || {},
        internal = {},
        modules = []

    api.mod = api.mod || function() {
      var module,
          sup = {},
          internalSup = {}

      for(var i = 0; i < arguments.length; i++) {
        module = arguments[i]
        if(modules.indexOf(module) === -1) {
          copyMethods(internal, internalSup)
          copyMethods(api, sup)
          module.call(null, api, internal, sup, internalSup)
          modules.push(module)
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
        throw new Error("You tried to mod an object that doesn't have an .mod method. Only objects created with Lantern.createObject can be modded")
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

  // Call
  $.call = function(fn, args) {
    if ($.isFunction(fn)) {
      return fn.apply(null, args)
    }
  }
})

// EVENT DISPATCH

$.makeEvents = $.createModule(function($target, _target) {
  $target.fireEvent = function(event, data) {
    $.forAll(_target.callbacksFor(event), function(handler) {
      $.call(handler, [event, data])
    })
  }

  $target.registerEventHandler = function(event, handler) {
    _target.callbacksFor(event).push(handler)
  }

  $target.removeEventHandler = function(event, handler) {
    $.remove(handler, _target.callbacksFor(event))
  }

  $target.clearEventHandlers = function(event) {
    _target.callbacksFor(event).length = 0
  }

  _target.eventCallbacks = {}
  _target.callbacksFor = function(event) {
    _target.eventCallbacks[event] = _target.eventCallbacks[event] || []
    return _target.eventCallbacks[event]
  }

  _target.registrarFor = function(event) {
    var registrar = function(handler) {
      $target.registerEventHandler(event, handler)
    }

    registrar.doNot = function(handler) {
      $target.removeEventHandler(event, handler)
    }

    registrar.doNothing = function() {
      $target.clearEventHandlers(event)
    }

    return registrar
  }
})

// PROPERTIES

$.makePropertyChangeEvents = $.createModule($.makeEvents, function(api, shared) {
  var props = shared.propertyValues = {}
  shared.defineProperty = function(name, value) {
    props[name] = value
    var descriptor =
        { enumerable:   true
        , configurable: false
        , get: function() { return props[name] }
        , set: function(newValue) {
            var oldValue = props[name]
            props[name] = newValue
            $.call(api.fireEvent, ['propertyChanged', {property: name, oldValue: oldValue, newValue: newValue}])
          }
        }
    Object.defineProperty(api, name, descriptor)
  }
})

$.makeAliasedProperties = $.createModule(function(api, shared) {
  shared.aliasProperty = function(alias, name) {
    var descriptor =
        { enumerable:   false
        , configurable: false
        , get: function() { return api[name] }
        , set: function(newValue) { api[name] = newValue }
        }
    Object.defineProperty(api, alias, descriptor)
  }
})

$.makeConstants = $.createModule(function(api, shared) {
  var constants = shared.constantValues = {}
  shared.defineConstant = function(name, value) {
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
    function(api, shared) {
      shared.domElement = document.createElement(api.tag || 'div') //addElement(api.tag)

      api.appendChild = function(childDomElement) {
        shared.domElement.appendChild(childDomElement)
      }
      api.appendTo = function(parent) {
        parent.appendChild(shared.domElement)
      }

      $.forAllPropertiesOf(
        { whenClicked:             shared.registrarFor('clicked')
        , whenMouseEnters:         shared.registrarFor('mouseEnters')
        , whenMouseLeaves:         shared.registrarFor('mouseLeaves')
        , whenMouseMoves:          shared.registrarFor('mouseMoves')
        , whenKeyPressed:          shared.registrarFor('keyPressed')
        , whenKeyReleased:         shared.registrarFor('keyReleased')
        , whenInputChanged:        shared.registrarFor('inputChanged')
        },
        shared.defineConstant
      )

      shared.setEventHandlers = function(attrs) {
        var el = shared.domElement
        el.onclick     = function() { api.fireEvent('clicked') }
        el.onmouseover = function() { api.fireEvent('mouseEnters') }
        el.onmouseout  = function() { api.fireEvent('mouseLeaves') }
        el.onmousemove = function() { api.fireEvent('mouseMoves') }
        el.onkeydown   = function() { api.fireEvent('keyPressed') }

        el.onkeyup = function() {
          shared.withoutRedrawing(function() {
            api.fireEvent('inputMayHaveChanged')
          })
          api.fireEvent('keyReleased')
          api.redraw()
        }
        el.onchange = function() {
          shared.withoutRedrawing(function() {
            api.fireEvent('inputMayHaveChanged')
          })
          api.fireEvent('changed')
          api.redraw()
        }
      }

      shared.withoutRedrawing = function(fn) {
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
        , fontSize: 20
        , textColor: 'black'
        , color: 'white'
        , borderWidth: 1
        , borderColor: 'lightGray'
        , scrollable: false
        , cursor: 'auto'
        , data: {} // this property is not used by Lantern; it's for the user to store their own data
        },
        shared.defineProperty
      )

      api.redraw = function () {
        shared.setAttributes(shared.htmlAttributes())
        shared.setEventHandlers() // TODO: is this line needed?
      }

      api.registerEventHandler('propertyChanged', function() { api.redraw() })

      shared.setAttributes = function(attrs) {
        $.forAllPropertiesOf(attrs, function(name, value) {
          shared.domElement.setAttribute(name, value)
        })
      }

      shared.htmlAttributes = function() {
        return {
          style: shared.toCss()
        , id: api.id
        }
      }

      shared.toCss = function() { return toCss(shared.asCss()) }
      shared.asCss = function() {
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
    function(self, shared, __, inherited) {
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
    function(api, shared, inherited) {
      shared.defineProperty('text', '')

      api.redraw = function() {
        inherited.redraw()
        shared.domElement.innerHTML = shared.getDisplayText()
      }

      shared.getDisplayText = function() {
        return api.text
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
  $.background = $.makeUiElement().mod(function(self, shared, __, inherited) {
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
