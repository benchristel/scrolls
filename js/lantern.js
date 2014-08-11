"use strict"

// KERNEL

var Lantern = (function($) {
  var copyMethods = function(from, to, fn) {
    for (var k in from) if (typeof from[k] === 'function') to[k] = from[k]
  }

  return ($.createObject = function(base) {
    var api = base || {},
        internal = {},
        modules = []

    api.extend = api.extend || function() {
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

// MODULES

Lantern.extend(function($) {
  $.module = function() {
    var moduleDefinitions = arguments

    return function(object) {
      object = $.createObject(object)

      if (!$.isFunction(object.extend)) {
        throw new Error("You tried to extend an object that doesn't have an .extend method. Only objects created with Lantern.createObject can be extended")
      }

      $.forAll(moduleDefinitions, function(definition) {
        object.extend(definition)
      })
      return object
    }
  }
})

// UTILITIES

Lantern.extend(function($) {
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


// PROPERTIES

Lantern.extend(function($) {
  $.addProperties = $.module(function(target, _target) {
    var props = _target.propertyValues = {}
    _target.defineProperty = function(name, value) {
      props[name] = value
      var descriptor =
          { enumerable:   true
          , configurable: false
          , get: function() { return props[name] }
          , set: function(newValue) {
              var oldValue = props[name]
              props[name] = newValue
              $.call(target.fire, ['propertyChanged', {property: name, oldValue: oldValue, newValue: newValue}])
            }
          }
      Object.defineProperty(target, name, descriptor)
    }

    _target.aliasProperty = function(alias, name) {
      var descriptor =
          { enumerable:   false
          , configurable: false
          , get: function() { return target[name] }
          , set: function(newValue) { target[name] = newValue }
          }
      Object.defineProperty(target, alias, descriptor)
    }
  })
})

var Lantern2 = Lantern

// EVENT DISPATCH

Lantern.extend(function($, _) {
  $.addEvents = $.module(function($target, _target) {
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
})

// UI

// base

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

  // Conversion
  $public.toNumericString = function(thing) {
    if ($.missing(thing)) {
      return '0'
    }
    return String(Number(thing))
  }

  $public.toCss = function(obj) {
    return $.forAllPropertiesOf(obj, function(k, v) {
      return k + ":" + v + ";"
    }).join("")
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

  $public.rotated = function(array, numPositions) {
    numPositions = $.init(numPositions, 1)
    sliceIndex = (array.length - numPositions) % array.length
    if (sliceIndex < 0) sliceIndex += array.length
    var beginning = array.slice(0, sliceIndex)
    var end = array.slice(sliceIndex, array.length)
    return end.concat(beginning)
  }

  $public.rotate = function(array, numPositions) {
    $.replace(array, $.rotated(array, numPositions))
    return array
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

  $public.cut = function(array) {
    var middle = Math.floor(array.length / 2)
    return [array.slice(0,middle), array.slice(middle, array.length)]
  }

  $public.remove = function(item, array) {
    for (var i = array.length-1; i >= 0; i--) {
      if (array[i] === item) {
        array.splice(i, 1)
      }
    }
    return array
  }

  $public.clear = function(array) {
    array.length = 0
    return array
  }

  // Time
  $public.now = function() { return Number(new Date()) }

  $public.everySecond = function(fn) { return window.setInterval(fn, 1000) }

  // UI
  $public.clearScreen = function() {
    _.resetTurtle()
    _.removeAllElementsFromDom()
    $.clear(_.uiElements)
  }

  // Other Utilities
  $public.swear = function() {
    var resolved = false, queued = []
    var oath =
    { to: function(fn) {
        if (resolved) {
          $.call(fn)
        } else {
          queued.push(fn)
        }
        return oath
      }
    , resolve: function() {
        resolved = true
        $.forAll(queued, function(fn) { $.call(fn) })
        $.clear(queued)
        return oath
      }
    }
    oath.and = oath.to
    return oath
  }

  $private.turtleX = 0
  $private.turtleY = 0
  $private.resetTurtle = function() { _.turtleX = _.turtleY = 0 }
  $private.uiElements = []
  $private.appendToScreen = function(elem) {
    _.uiElements.push(elem)
    _.addElementsToDom($.screen, [elem])
  }

  $private.addElement = function(tag, attrs) {
    attrs = $.init(attrs, {})
    var elem = document.createElement(tag || 'div')

    for(var attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        elem.setAttribute(attr, attrs[attr])
      }
    }
    _.appendToScreen(elem)
    return elem
  }

  $private.addElementsToDom = function(parent, elements) {
    if (!parent || !$.isArray(elements)) return
    $.forAll(elements, function(elem) {
      parent.appendChild(elem)
    })
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

  $private.createUiElement = function(params, module) {
    params = $.init(params, {})
    var secret = $.init(secret, {})
    var ui = {}

    secret.domElement = _.addElement(params.tag)

    var dispatch = secret.dispatch = _.addEventDispatcher(ui)

    $.addProperties(ui,
      { whenClicked:             dispatch.registrar('clicked')
      , whenMouseEnters:         dispatch.registrar('mouseEnters')
      , whenMouseLeaves:         dispatch.registrar('mouseLeaves')
      , whenMouseMoves:          dispatch.registrar('mouseMoves')
      , whenKeyPressed:          dispatch.registrar('keyPressed')
      , whenKeyReleased:         dispatch.registrar('keyReleased')
      , whenInputChanged:        dispatch.registrar('inputChanged')
      }
    , { writable: false }
    )

    secret.setEventHandlers = function(attrs) {
      var el = secret.domElement
      el.onclick     = dispatch('clicked')
      el.onmouseover = dispatch('mouseEnters')
      el.onmouseout  = dispatch('mouseLeaves')
      el.onmousemove = dispatch('mouseMoves')
      el.onkeydown   = dispatch('keyPressed')

      el.onkeyup = function() {
        secret.withoutRedrawing(function() {
          dispatch.receiveEvent('inputMayHaveChanged')
        })
        dispatch.receiveEvent('keyReleased')
        ui.redraw()
      }
      el.onchange = function() {
        secret.withoutRedrawing(function() {
          dispatch.receiveEvent('inputMayHaveChanged')
        })
        dispatch.receiveEvent('changed')
        ui.redraw()
      }
    }

    secret.withoutRedrawing = function(fn) {
      var old = ui.redraw
      ui.redraw = $.noOp
      fn()
      ui.redraw = old
    }

    $.addProperties(ui,
      { id:   _.generateHtmlId()
      , top:  _.turtleY
      , left: _.turtleX
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
      })

    _.turtleX += 100
    if (_.turtleX > 800) {
      _.turtleX = 0
      _.turtleY += 50
    }

    ui.centerHorizontallyOn = function(other) {
      ui.left = other.left + other.width / 2 - ui.width / 2
    }

    ui.centerVerticallyOn = function(other) {
      ui.top = other.top + other.height / 2 - ui.height / 2
    }

    ui.putAbove = function(other, spacing) {
      ui.top = other.top - ui.height - $.init(spacing, 0)
    }

    ui.putBelow = function(other, spacing) {
      ui.top = other.top + other.height + $.init(spacing, 0)
    }

    ui.redraw = function () {
      secret.setText(ui.text)
      secret.setAttributes(secret.htmlAttributes())
      secret.setEventHandlers() // TODO: is this line needed?
    }

    dispatch.register({propertyChanged: function() { ui.redraw() }})

    secret.setText = function(value) {
      secret.domElement.innerHTML = $.htmlEscape(value)
    }

    secret.setAttributes = function (attrs) {
      $.forAllPropertiesOf(attrs, function(name, value) {
        secret.domElement.setAttribute(name, value)
      })
    }

    secret.htmlAttributes = function () {
      return $.merge({
        style: secret.toCss(),
        id: ui.id
      }, $.call(secret.htmlAttributes.extension) || {})
    }

    secret.toCss = function() { return $.toCss(secret.asCss()) }
    secret.asCss = function() {
      var css =
        { 'top'    : $.toNumericString(ui.top)+'px'
        , 'left'   : $.toNumericString(ui.left)+'px'
        , 'height' : $.toNumericString(ui.height)+'px'
        , 'width'  : $.toNumericString(ui.width)+'px'
        , 'color'  : $.COLOR[ui.textColor]
        , 'background-color' : $.COLOR[ui.color]
        , 'display' : (ui.visible ? 'block' : 'none')
        , 'border-color' : $.COLOR[ui.borderColor]
        , 'border-width' : $.toNumericString(ui.borderWidth)+'px'
        , 'position' : 'absolute'
        , 'font-size' : $.toNumericString(ui.fontSize)+'px'
        , 'white-space' : 'pre-wrap'
        , 'overflow-x' : 'hidden'
        , 'overflow-y' : (ui.scrollable ? 'auto' : 'hidden')
        , 'cursor' : ui.cursor
        }
      return css
    }

    $.call(module, [ui, secret])

    ui.redraw()

    $.seal(ui)
    return ui
  }

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
