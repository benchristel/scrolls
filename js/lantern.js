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
  var nextId = 0
  var grantId = function(o) {
    Object.defineProperty(o, '__id__', {configurable: false, enumerable: false, value: nextId++})
  }

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

  $.repeat = function(times, fn) {
    var count = 0
    while (count++ < times) fn(count)
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

  $.createArray = function() {
    var len, array = new Array(len = arguments.length), i = 0
    for (;i < len; i++) {
      array[i] = arguments[i]
    }
    grantId(array)
    return array
  }

  $.createStatBlock = function() {
    var obj = {}, i = 0, len = arguments.length
    for (;i < len; i++) {
      obj[arguments[i]] = null
    }
    grantId(obj)
    return obj
  }

  $.createSet = function() {
    var api = $.createStatBlock('size', 'add', 'remove'), container = {}, listContainer = [], size = 0, i

    Object.defineProperty(api, 'size', {set: $.noOp, get: function() { return size }, configurable: false, enumerable: false})

    api.add = function(item) {
      var currentValue, id

      if (item && (id = item.__id__)) {
        currentValue = container[id]
        if (!currentValue) {
          size++
          container[id] = item
        }
      } else if (listContainer.indexOf(item) === -1) {
        listContainer.push(item)
        size++
      }
    }

    api.contains = function(item) {
      return (item && (item.__id__ in container)) ||
             (listContainer.indexOf(item) > -1)
    }

    api.remove = function(item) {
      if (item && container[item.__id__]) {
        delete container[item.__id__]
        size--
        return item
      } else if (listContainer.indexOf(item) > -1) {
        $.remove(item, listContainer)
        size--
        return item
      } // else return undefined
    }

    api.forEach = function(fn) {
      var i = 0, id, k
      for(id in container) {
        fn(container[id], i++)
      }
      for(k = 0; k < listContainer.length; k++) {
        fn(listContainer[k], i++)
      }
    }

    for(i = 0; i < arguments.length; i++) {
      api.add(arguments[i])
    }

    return api
  }
})

// EVENT DISPATCH

$.makeEvents = $.createModule(function(api, self) {
  api.fireEvent = function(event, data) {
    $.forAll(self.callbacksFor(event), function(handler) {
      $.call(handler, [data])
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

Lantern.makeEvents(Lantern)

/*
 * PROPERTIES
 */

$.makeConfiguredProperties = $.createModule($.makeEvents, function(api, self) {
  var props = self.propertyValues = {}
  self.defineProperty = function(name, value) {
    //props[name] = value
    var setterName = 'set_'+name
    var descriptor =
        { enumerable:   true
        , configurable: false
        , get: function() { return props[name] }
        , set: function(newValue) {
            var oldValue = props[name]
            props[name] = newValue
            self[setterName] && self[setterName](newValue, oldValue)
          }
        }
    Object.defineProperty(api, name, descriptor)
    api[name] = value
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
    var formattedAttributes = []
    $.forAllPropertiesOf(obj, function(k, v) {
      formattedAttributes.push(k + ":" + v + ";")
    })

    return formattedAttributes.join("")
  }

  var nextId = 0
  var generateHtmlId = function() {
    return 'lantern-element-'+(nextId++)
  }

  $.IMAGE_RESIZE =
    { FILL:        'fill'
    , FIT:         'fit'
    , STRETCH:     'stretch'
    , TILE:        'tile'
    , ACTUAL_SIZE: 'actualSize'
    }

  var getBackgroundSize = function(imageResize) {
    if (imageResize == $.IMAGE_RESIZE.ACTUAL_SIZE || self.imageResize == $.IMAGE_RESIZE.TILE)
      return 'auto'
    if (imageResize == $.IMAGE_RESIZE.FILL)
      return 'cover'
    if (imageResize == $.IMAGE_RESIZE.FIT)
      return 'contain'
    if (imageResize == $.IMAGE_RESIZE.STRETCH)
      return '100% 100%'
    //var allowedValues = []
    //$.forAllPropertiesOf($.IMAGE_RESIZE, function(k,v) { allowedValues.push(v) })
    //throw "Unrecognized value ("+self.imageResize+") for imageResize. Try one of these: "+allowedValues.join(", ")
  }

  $.makeUiElement = $.createModule(
      $.makeEvents,
      $.makeConstants,
      $.makePositionable,
      $.makeConfiguredProperties,
    function(api, self) {
      self.domElement = document.createElement(api.tag || 'div')

      api.appendChild = function(childDomElement) {
        self.domElement.appendChild(childDomElement)
      }
      api.appendTo = function(parent) {
        if (parent) {
          parent.appendChild(self.domElement)
        }
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

      var def = function(name, value, setter) {
        self['set_'+name] = setter
        self.defineProperty(name, value)
      }
      var el = self.domElement, style = el.style
      el.onclick     = function() { api.fireEvent('clicked') }
      el.onmouseover = function() { api.fireEvent('mouseEnters') }
      el.onmouseout  = function() { api.fireEvent('mouseLeaves') }
      el.onmousemove = function() { api.fireEvent('mouseMoves') }
      el.onkeydown   = function() { api.fireEvent('keyPressed') }

      self.updateTransform = function() {
        style.transform = "rotate("+self.rotation+"deg)" // translate("+toNumericString(self.left)+"px,"+toNumericString(self.top)+"px)"
      }

      self.updateTransformOrigin = function() {
        style.transformOrigin = toNumericString(self.pivotX * 100)+"% "+toNumericString(self.pivotY * 100)+"%"
      }

      self.updateBackgroundImage = function() {
        style.backgroundImage = (self.imageUrl ? "url("+self.imageUrl+")" : 'none')
        style.backgroundRepeat = (self.imageResize == $.IMAGE_RESIZE.TILE ? 'repeat' : 'no-repeat')
        style.backgroundSize = getBackgroundSize(self.imageResize)
        style.backgroundPosition = 'center'
      }

      def('id',       generateHtmlId(), function(v) { el.id = v })
      def('top',      50,  function(v) { style.top = toNumericString(v)+'px' })
      def('left',     50,  function(v) { style.left = toNumericString(v)+'px' })
      def('rotation', 0,   self.updateTransform)
      def('pivotX',   0.5, self.updateTransformOrigin)
      def('pivotY',   0.5, self.updateTransformOrigin)
      def('height',   50,  function(v) { style.height = toNumericString(v)+'px' })
      def('width',    100, function(v) { style.width = toNumericString(v)+'px' })
      def('visible', true, function(v) { style.display = (v ? 'block' : 'none') })
      def('color', 'white', function(v) { style.backgroundColor = v })
      def('borderWidth', 1, function(v) { style.borderWidth = toNumericString(v)+'px' })
      self.set_borderColor = function(v) { style.borderColor = v }
      def('borderColor', 'lightGray')
      self.set_scrollable = function(v) { style.overflowY = (v ? 'auto' : 'hidden') }
      def('scrollable', false)
      self.set_cursor = function(v) { style.cursor = v }
      def('cursor', 'auto')
      def('imageUrl', null, self.updateBackgroundImage)
      def('imageResize', $.IMAGE_RESIZE.FIT, self.updateBackgroundImage)
      def('zIndex', 1, function(v) { style.zIndex = Math.floor(v) } )

      style.position = 'absolute'

      self.restoreFactoryDefaults = function() {
        self.whenClicked.doNothing()
        self.whenMouseEnters.doNothing()
        self.whenMouseLeaves.doNothing()
        self.whenMouseMoves.doNothing()
        self.whenKeyPressed.doNothing()
        self.whenKeyReleased.doNothing()
        self.whenInputChanged.doNothing()

        self.visible = true
      }

      api.destroy = function() {
        api.__tombstone__ = true
        self.visible = false
      }

      api.restore = function() {
        if ( ! self.__tombstone__) return
        api.__tombstone__ = null
        self.restoreFactoryDefaults()
      }
    }
  )

  $internal.makeRelativePositionedElement = $.createModule(
    $.makeUiElement,
    function(api, self, inherited) {
      var style = self.domElement.style
      style.position = 'relative'
      style.marginLeft = 'auto'
      style.marginRight = 'auto'
    }
  )

  $internal.makeTextContainerElement = $.createModule(
    $.makeUiElement,
    function(api, self, inherited) {
      var el = self.domElement, style = self.domElement.style
      self.set_text = function(v) { el.innerHTML = v }
      self.defineProperty('text', '')
      self.set_fontSize = function(v) { style.fontSize = String(v)+'px' }
      self.defineProperty('fontSize', 20)
      self.set_textColor = function(v) { style.color = v }
      self.defineProperty('textColor', 'black')
    }
  )

  $.createButton = function() {
    var button = $internal.makeTextContainerElement({tag: 'button'})
    $internal.uiElements.push(button)
    button.appendTo($.portal)
    return button
  }
})

Lantern.mod(function($, $shared) {
  $.background = $.makeUiElement().mod(function(api, self, inherited) {
    var style = self.domElement.style
    self.set_height = null
    style.height = null
    self.set_width = null
    style.width = '100%'
    self.set_top = null
    style.top = 0
    self.set_left = null
    style.left = 0
    style.bottom = 0
    style.transform = null
    self.set_borderWidth = null
    self.set_borderColor = null
    style.border = 'none'
  })

  $.background.id = 'lantern-background'
  $.background.color = 'black'

  $.portal = $shared.makeRelativePositionedElement()
  $.portal.id = 'lantern-portal'
  $.portal.borderWidth = 0
  $.portal.top = $.portal.left = 0
  $.portal.appendTo($.background)

  $.portalize = function(container) {
    $.background.appendTo(container)

    $.forAll($shared.uiElements, function(elem) {
      elem.appendTo($.portal)
    })
  }
})



Lantern.mod(function($api, $) {
  var HELD_KEYS = {}

  var KEYS_BY_CODE = {
    27: 'esc', 192:'`', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7', 56: '8', 57: '9', 48: '0', 189: '-', 187: '+',
    81: 'q', 87: 'w', 69: 'e', 82: 'r', 84: 't', 89: 'y', 85: 'u', 73: 'i', 79: 'o', 80: 'p', 219: '[', 221: ']', 220: '\\',
    65: 'a', 83: 's', 68: 'd', 70: 'f', 71: 'g', 72: 'h', 74: 'j', 75: 'k', 76: 'l', 186: ';', 222: "'",
    90: 'z', 88: 'x', 67: 'c', 86: 'v', 66: 'b', 78: 'n', 77: 'm', 188: ',', 190: '.', 191: '/',
    8: 'backspace', 13: 'return', 16: 'shift', 17:'control', 18:'alt', 91:'left meta', 93: 'right meta', 37:'left', 38:'up', 39:'right', 40:'down', 36: 'home', 46: 'delete', 33:'page up', 34:'page down', 35: 'end', 112: 'f1', 113: 'f2', 114: 'f3', 115: 'f4', 116: 'f5', 117: 'f6', 118: 'f7', 119: 'f8', 9: 'tab'
  }

  $api.whenPageLoaded = $.registrarFor('PageLoaded')
  $api.whenKeyPressed = $.registrarFor('KeyPressed')
  $api.whenKeyReleased = $.registrarFor('KeyReleased')

  $api.isKeyHeld = function(keyName) {
    return !!HELD_KEYS[keyName]
  }

  window.addEventListener('load', function(loadEvent) {
    $.fireEvent('PageLoaded')
  })

  window.addEventListener('keydown', function(keyEvent) {
    var keyName = KEYS_BY_CODE[keyEvent.keyCode]
    console.log("down "+keyName)

    if (!HELD_KEYS[keyName]) {
      HELD_KEYS[keyName] = true
      $.fireEvent('KeyPressed', {key: keyName})
    }
  })

  window.addEventListener('keyup', function(keyEvent) {
    var keyName = KEYS_BY_CODE[keyEvent.keyCode]

    if (HELD_KEYS[keyName]) {
      HELD_KEYS[keyName] = false
      $.fireEvent('KeyReleased', {key: keyName})
    }
  })
})

/* ========= */
/* ANIMATION */
/* ========= */

Lantern.mod(function($api, $) {
  var msPerFrame = 10
  var prevFrameTime = Date.now()
  var frameCallback = function() {
    var now = Date.now()
    $.fireEvent('frame', {secondsSinceLastFrame: (now - prevFrameTime) / 1000})
    prevFrameTime = now
    requestAnimationFrame(frameCallback)
  }
  var frameInterval = requestAnimationFrame(frameCallback)

  $api.everyFrame = $.registrarFor('frame')

  $api.makeAnimatable = $.createModule(function(api, self) {
    api.startAnimating = function(property, end, durationSeconds) {
      var t = 0
      var start = self[property]
      var updateAnimation = function(event) {
        t += event.secondsSinceLastFrame
        if (t >= durationSeconds) {
          api[property] = end
          $.everyFrame.doNot(updateAnimation)
        } else {
          api[property] = start + (end - start) * t / durationSeconds
        }
      }
      $.everyFrame(updateAnimation)
    }
  })

  $api.startAnimation = function(object, property, target, duration) {
    var from = object[property], to = target, elapsed = 0
    var animator = $.makeEvents({
      from: function(v) {
        from = v
        return animator
      },
      to: function(v) {
        to = v
        return animator
      },
      inMilliseconds: function(v) {
        duration = v
        return animator
      }
    }).mod(function(api, animator) {
      api.andThen = animator.registrarFor('animationDone')
    })

    var updateAnimation = function() {
      elapsed = elapsed + msPerFrame
      object[property] = from + (to - from) * (elapsed / duration)
      if ((to - from > 0 && object[property] >= to) ||
          (to - from < 0 && object[property] <= to)
         ) {
        object[property] = to
        $.everyFrame.doNot(updateAnimation)
        animator.fireEvent('animationDone')
      }
    }

    $.everyFrame(updateAnimation)

    return animator
  }
})

/* ================ */
/* RESOURCE LOADING */
/* ================ */

Lantern.mod(function ($api, $) {
  $.obtainImage = function() {
    return new Image()
  }

  $api.preloadResources = function(resourceUrls) {
    var leftToLoad = resourceUrls.length
    var preloader = $.makeEvents().mod(function(api, self) {
      api.whenFinishedLoading = self.registrarFor('finishedLoading')
    })

    var loadOne = function() {
      if(!--leftToLoad) preloader.fireEvent('finishedLoading')
    }

    $.forAll(resourceUrls, function(url) {
      var img = $.obtainImage()
      img.onload = loadOne
      img.src = url
    })

    return preloader
  }
})

/* ================ */
/* OBJECT RECYCLING */
/* ================ */

Lantern.mod(function($api, $) {
  $.legions = []

  $api.Legion = function() {
    var legionApi = {}, instances = [], tombstones = []

    legionApi.all = function(fn) {
      var i, inst
      for(i = 0; i < instances.length; i++) {
        inst = instances[i]
        if ( ! inst.__tombstone__) fn(inst)
      }
    }

    var makeMember = $.createModule(function(api, self, inherited) {
      api.destroy = function() {
        if ( ! api.__tombstone__) {
          inherited.destroy()
          tombstones.push(api)
        }
      }
    })

    legionApi.create = function() {
      var instance = tombstones.pop()
      if ( ! instance) {
        instance = $.createButton()
        makeMember(instance)
        instances.push(instance)
      } else {
        instance.restore()
      }
      $.call(legionApi.builder, [instance])
      return instance
    }

    return legionApi
  }
})



Lantern.$noConflict = $
var $ = Lantern
