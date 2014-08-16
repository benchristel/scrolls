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
      $target.register(event, handler)
    }

    registrar.doNot = function(handler) {
      $.remove(event, _target.callbacksFor(event))
    }

    registrar.doNothing = function() {
      $.clear(_target.callbacksFor(event))
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

Lantern.mod(function($) {
  var addElement = function(tag) {
    var elem = document.createElement(tag || 'div')

    appendToScreen(elem)
    return elem
  }

  var appendToScreen = function(elem) {
    //_.uiElements.push(elem)
    addElementsToDom(/*$.screen*/ document.getElementsByTagName('body')[0], [elem])
  }

  var addElementsToDom = function(parent, elements) {
    if (!parent || !$.isArray(elements)) return
    $.forAll(elements, function(elem) {
      parent.appendChild(elem)
    })
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

  $.makeUiElement = $.createModule(
      $.makeEvents,
      $.makeConstants,
      $.makePositionable,
      $.makePropertyChangeEvents,
    function(api, shared) {
      shared.domElement = addElement(api.tag)

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
        { //id:   _.generateHtmlId()
          top:  0
        , left: 0
        , height: 50
        , width:  100
        , visible: true
        , text: ''
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
        shared.setText(api.text)
        shared.setAttributes(shared.htmlAttributes())
        shared.setEventHandlers() // TODO: is this line needed?
      }

      api.registerEventHandler('propertyChanged', function() { api.redraw() })

      shared.setText = function(value) {
        shared.domElement.innerHTML = value //$.htmlEscape(value)
      }

      shared.setAttributes = function(attrs) {
        $.forAllPropertiesOf(attrs, function(name, value) {
          shared.domElement.setAttribute(name, value)
        })
      }

      shared.htmlAttributes = function() {
        return {
          style: shared.toCss()
          //id: ui.id
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
          , 'position' : 'absolute'
          , 'font-size' : toNumericString(api.fontSize)+'px'
          , 'white-space' : 'pre-wrap'
          , 'overflow-x' : 'hidden'
          , 'overflow-y' : (api.scrollable ? 'auto' : 'hidden')
          , 'cursor' : api.cursor
          }
        return css
      }
    }
  )

  var makeTextInputDefinition = function(target, _target) {
    _target.tag = 'input'
  }

  $.makeTextInput = $.createModule(
      makeTextInputDefinition,
      $.makeUiElement
  )

  $.createButton = function() {
    var button = $.makeUiElement({tag: 'button'})
    button.redraw()
    return button
  }
})

var Lantern2 = Lantern

var Lantern = (function (undefined) {
  var $additions = {} // the prototype of Lantern, to which clients can add their own gizmos

  var $ = Object.create($additions) // the Lantern zygote
  var _ = {} // container for private properties
  var $private = _
  var $public  = $

  $.additions = $additions

  var $publicConst = function (properties) {
    eachProperty(properties, function(k, v) {
      Object.defineProperty($, k, {writable: false, value: v})
    })
  }

  $public.settings = {}
  $public.settings.framesPerSecond = 60
  $public.settings.screen = null // the DOM element where Lantern controls will be placed
                                 // TODO: shouldn't this be private?

  $public.COLOR =
    { black: '#000'
    , white: '#fff'
    , gray:  '#808080'
    , lightGray: '#c0c0c0'
    , darkGray:  '#404040'
    , red:     '#f00'
    , green:   '#0f0'
    , blue:    '#00f'
    , yellow:  '#ff0'
    , cyan:    '#0ff'
    , magenta: '#f0f'
    }

  $public.htmlEscape = function(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
  }

  $public.htmlUnescape = function(s) {
    return String(s)
        .replace(/&gt;/g,   '>')
        .replace(/&lt;/g,   '<')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g,  '&')
  }

  // Array utility functions

  $public.copy = function(thing) {
    var copy
    if ($.isArray(thing)) {
      copy = thing.slice(0)
    } else if ($.isObject(thing)) {
      copy = {}
      $.forAllPropertiesOf(thing, function(name, val) {
        copy[name] = val
      })
    }
    return copy
  }

  $public.replace = function(array, newContents) {
    array.length = 0
    Array.prototype.push.apply(array, newContents)
    return array
  }

  $public.sum = function(array) {
    var sum = 0
    $.forAll(array, function(x) {
      sum += x
    })
    return sum
  }

  $public.repeat = function(nTimes, fn) {
    fn = $.init(fn, $.identity)
    var count = 0
    while (count < nTimes) {
      fn(count++)
    }
  }

  $public.generate = function(n, fn) {
    var generated = new Array(n)
    $.repeat(n, function(i) { generated[i] = fn() })
    return generated
  }

  $public.clear = function(array) {
    array.length = 0
    return array
  }

  $public.everySecond = function(fn) { return window.setInterval(fn, 1000) }

  // UI
  $public.clearScreen = function() {
    _.resetTurtle()
    _.removeAllElementsFromDom()
    $.clear(_.uiElements)
  }

  $private.turtleX = 0
  $private.turtleY = 0
  $private.resetTurtle = function() { _.turtleX = _.turtleY = 0 }
  $private.uiElements = []
  $private.appendToScreen = function(elem) {
    _.uiElements.push(elem)
    _.addElementsToDom($.screen, [elem])
  }

  $private.removeAllElementsFromDom = function() {
    if (!$.screen || !$.isArray(_.uiElements)) return
    $.forAll(_.uiElements, function(elem) {
      $.screen.removeChild(elem)
    })
  }

  $private.nextId = 0
  $private.generateHtmlId = function(prefix) {
    prefix = $.init(prefix, 'lantern-element-')
    return String(prefix) + _.nextId++
  }

  // ----------- //
  // UI ELEMENTS //
  // ----------- //

  $public.createButton = function() {
    var self = _.createUiElement({tag: 'button'})

    self.cursor = 'pointer'

    return self
  }

  $public.createTextDisplay = function() {
    var self = _.createUiElement({tag: 'div'})

    return self
  }

  $public.createTextInput = function() {
    var self = _.createUiElement({tag: 'input'}, function(self, secret) {
      secret.setText = function(value) {
        if (secret.domElement.value !== value) {
          secret.domElement.value = value
        }
      }

      var updateTextAttributeFromInput = function() {
        if (self.text !== secret.domElement.value) {
          self.text = secret.domElement.value
          secret.dispatch.receiveEvent('inputChanged')
        }

      }

      secret.dispatch.register({ inputMayHaveChanged:  updateTextAttributeFromInput})
    })

    return self
  }

  /*
  // when the screen is set, remove any created UI elements from the old screen
  // and add them to the new one.
  var _screen = function(v) {
    if ($.given(v) && v !== _screen.d) {
      _.removeAllElementsFromDom()
      _screen.d = v
      _.addElementsToDom(_screen.d, _.uiElements)
    }
    return _screen.d
  }
  _screen.d = null
  Object.defineProperty($, 'screen', {set: _screen, get: _screen, configurable: false})

  var $dispatch = _.addEventDispatcher($)

  $.addProperties($
  , { whenPageLoadFinishes: $dispatch.registrar('pageLoaded')
    , whenKeyPressed:       $dispatch.registrar('keyPressed')
    }
  , { writable: false }
  )

  $.addProperties($, { main: $.noOp})

  $.extend(window, 'onload', function() {
    var body = document.getElementsByTagName("body")[0]

    $.extend(body, 'onkeypress', $dispatch('keyPressed'))

    $.screen = body

    _.addElementsToDom(_screen.d, _.uiElements)

    $.main()

    $dispatch.receiveEvent('pageLoaded')
  })
  */

  return $
})()

Lantern.$noConflict = $
Object.freeze(Lantern)
var $ = Lantern2
var Lantern = Lantern2
