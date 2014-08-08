"use strict"

var Lantern2 = (function() {
  var constructor = function(sub) {
    return function(params) {
      var api = {}, internal = {}
      api.extend = function(extension, params) {
        var copy = {}, internalCopy = {}, prop
        for (prop in internal)
          if (Object.prototype.hasOwnProperty.call(internal, prop)) internalCopy[prop] = internal[prop]

        for(prop in api)
          if (Object.prototype.hasOwnProperty.call(api, prop)) copy[prop] = api[prop]

        extension.call(null, api, internal, copy, internalCopy, params)
        return api
      }
      return api.extend(sub, params)
    }
  }

  return constructor(function($) {
    $.constructor = constructor
  })()
})()

Lantern2.extend(function($, _) {
  $.test = "it works"
  $.publicAccessor = function() { return $.test }
  _.pri = 'seeecrets'
  $.setter = function(val) { _.pri = val }
  $.getter = function(val) { return _.pri }
})

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

  // Value definition
  $public.given   = function(val) { return val !== undefined }
  $public.missing = function(val) { return val === undefined }
  $public.init    = function(val, _default) {
    return $.given(val) ? val : _default
  }

  // Barely-useful utility functions
  $public.noOp = function() {}
  $public.identity = function(x) { return x }

  // Type-checking functions
  $public.isFunction = function(thing) { return typeof(thing) === 'function' }
  $public.isArray    = function(thing) { return thing instanceof Array }
  $public.isObject   = function(thing) { return thing instanceof Object }
  $public.isNumber   = function(thing) { return (+thing === thing) }

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
  $public.forAll = function(array, fn) {
    fn = $.init(fn, $.identity)
    var transformed = new Array(array.length)
    for(var i = 0; i < array.length; i++) {
      transformed[i] = fn(array[i], i)
    }
    return transformed
  }

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

  $public.firstOf = function(array) {
    return array[0]
  }

  $public.restOf = function(array, start) {
    // TODO: rename or alias to allButFirst()? e.g. allButFirst(2, args)
    start = $.init(start, 1)
    return Array.prototype.slice.call(arguments, [start, array.length])
  }

  $public.lastOf = function(array) {
    return array[array.length-1]
  }

  $public.drawFirst = function(deck) {
    return deck.shift()
  }

  $public.drawLast = function(deck) {
    return deck.pop()
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

  // Object utility functions
  $public.forAllPropertiesOf = function(object, fn) {
    fn = $.init(fn, $.identity)
    var accumulated = []
    for(var prop in object) {
      if (Object.prototype.hasOwnProperty.call(object, prop)) {
        accumulated.push(fn(prop, object[prop]))
      }
    }
    return accumulated
  }

  $public.merged = function(obj1, obj2) {
    return $.merge($.copy(obj1), obj2)
  }

  $public.merge = function(obj1, obj2) {
    $.forAllPropertiesOf(obj2, function(k, v) {
      obj1[k] = v
    })
    return obj1
  }

  // Randomness
  $public.rollD = function(sides) {
    return Math.ceil(Math.random() * sides)
  }

  $public.pickRandomly = function(array) {
    return array[$.rollD(array.length)-1]
  }

  $public.drawRandomly = function(array) {
    var index = $.rollD(array.length) - 1
    var drawn = array[index]
    array.splice(index, 1)
    return drawn
  }

  // this simulates a riffle shuffle, which is not particularly random.
  // for more randomness, use $.scramble(array)
  $public.shuffle = function(array, nTimes) {
    var deck = array, stacks, card
    nTimes = $.init(nTimes, 1)
    $.repeat(nTimes, function() {
      stacks = $.cut(deck)
      deck = []
      while (stacks[0].length && stacks[1].length) {
        card = $.drawFirst($.pickRandomly(stacks))
        deck.push(card)
      }
      deck = deck.concat(stacks[0], stacks[1])
    })
    return $.replace(array, deck)
  }

  $public.scramble = function(array) {
    var scrambled = []
    while(array.length) {
      scrambled.push($.drawRandomly(array))
    }
    return $.replace(array, scrambled)
  }

  // Function utilities
  $public.call = function(fn, args, thisVal) {
    if ($.isFunction(fn)) {
      return fn.apply(thisVal || $, args)
    }
    return undefined
  }

  $public.extend = function(object, method, extension) {
    var originalMethod = object[method]
    return object[method] = $.extended(originalMethod, extension)
  }

  $public.extended = function(fn, extension) {
    return function() {
      $.call(fn, arguments, this)
      return $.call(extension, arguments, this)
    }
  }

  $public.addProperties = function(object, props, options) {
    options = $.init(options, {})
    var writable = $.init(options.writable, true)
    $.forAllPropertiesOf(props, function(name, value) {
      (function () {
        var _propertyValue = value
        var descriptor =
            { enumerable:   $.init(options.enumerable, true)
            , configurable: false
            , get: function() { return _propertyValue }
            }
        if (writable) {
          descriptor.set = function(newValue) {
            var oldValue = _propertyValue
            _propertyValue = newValue
            $.call(object.receiveEvent, ['propertyChanged', name, oldValue, newValue], object)
          }
        }
        Object.defineProperty(object, name, descriptor)
      })()
    })
    return $
  }

  $public.aliasProperties = function(object, aliases) {
    $.forAllPropertiesOf(aliases, function(alias, name) {
      var descriptor =
          { enumerable:   false
          , configurable: false
          , set: function(newValue) { object[name] = newValue }
          , get: function() { return object[name] }
          }
      Object.defineProperty(object, alias, descriptor)
    })
    return $
  }

  $public.seal = function(obj) { return Object.seal(obj) }

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

  $private.cap = function(s) { return s.charAt(0).toUpperCase()+s.slice(1, s.length) }

  $private.addEventDispatcher = function(host) {
    var d = function(eventName) {
      return function(eventData) {
        d.receiveEvent(eventName, eventData)
      }
    }

    var promises = []
    var received = {}

    d.receiveEvent = function(eventName, rawData) {
      var cb = d.registeredCallbacks[eventName]
      var data = d.process(rawData)
      received[eventName] = true
      if ($.isArray(cb)) {
        $.forAll(cb, function(c) { $.call(c, [data]) })
      }
      $.forAll(promises, function(promise) {
        promise.oath.resolve()
      })
    }

    d.process = $.identity

    d.register = function(handlerMapping) {
      d.unregister(handlerMapping) // prevent handlers from being registered more than once
      $.forAllPropertiesOf(handlerMapping, function(eventName, handlers) {
        d.registeredCallbacks[eventName] = $.init(d.registeredCallbacks[eventName], [])
        // TODO: $.init(handle.registeredCallbacks, eventName, []) would be cool
        if ($.isArray(handlers)) {
          var map = {}
          $.forAll(handlers, function(handler) {
            map[eventName] = handler
          })
          d.register(map)
        } else if ($.isFunction(handlers)) {
          d.registeredCallbacks[eventName].push(handlers)
        } else {
          throw "Can't register event handler for "+eventName+": "+handlers
        }
      })
    }

    d.unregister = function(handlerMapping) {
      $.forAllPropertiesOf(handlerMapping, function(eventName, handlers) {
        // TODO: $.init(handle.registeredCallbacks, eventName, []) would be cool
        if ($.isArray(handlers)) {
          var map = {}
          $.forAll(handlers, function(handler) {
            map[eventName] = handler
            d.unregister(map)
          })
        } else if ($.isFunction(handlers)) {
          if ($.isArray(d.registeredCallbacks[eventName])) {
            $.remove(handlers, d.registeredCallbacks[eventName])
          }
        } else {
          throw "Can't unregister event handler for "+eventName+": "+handlers
        }
      })
    }

    d.registrar = function(eventName) {
      var registrar = function() {
        var map = {}
        map[eventName] = $.forAll(arguments)
        d.register(map)
      }

      registrar.doNot = function() {
        var map = {}
        map[eventName] = $.forAll(arguments)
        d.unregister(map)
      }

      registrar.doNothing = function() {
        d.registeredCallbacks[eventName] = []
      }

      return registrar
    }

    d.registeredCallbacks = {}

    $.addProperties(host,
      { receiveEvent: d.receiveEvent
      , subscribeTo: d.register
      }
    , {writable: false}
    )

    return d
  }

  $public.constructor = function() {
    var subs = arguments
    var constructor = function(params) {
      var api = {}, internal = {}
      api.extend = function(extension, params) {
        $.call(extension, [api, internal, params])
        return api
      }
      $.forAll(subs, function(sub) {
        $.call(sub, [api, internal, params])
      })

      return api
    }
    return constructor
  }

  $private.nextId = 0
  $private.generateHtmlId = function(prefix) {
    prefix = $.init(prefix, 'lantern-element-')
    return String(prefix) + _.nextId++
  }

  // ----------- //
  // UI ELEMENTS //
  // ----------- //

  $private.createUiElement = function(params, extender) {
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

    $.call(extender, [ui, secret])

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

  return $
})()

Lantern.$noConflict = $
Object.freeze(Lantern)
var $ = Lantern
