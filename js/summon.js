"use strict"

var Summon = (function() {
    var self = {}
    var scriptTarget = document.getElementsByTagName('head')[0]
    var thisScript = document.querySelector('[x-summon]')
    var scriptDomain

    var toSrc = function(urlSuffix) {
        if (scriptDomain) {
            return ""+scriptDomain+urlSuffix
        } else {
            return ""+urlSuffix
        }
    }

    if (!scriptTarget) {
        throw "Whoa there. You can't Summon if you don't have a <head>."
    }

    self.script = function(srcUrl) {
        var script = document.createElement('script')
        script.src = toSrc(srcUrl)
        scriptTarget.appendChild(script)
    }

    self.scripts = function() {
        for (var i = 0; i < arguments.length; i++) {
            self.script(arguments[i])
        }
    }

    if (thisScript) {
        scriptDomain = thisScript.getAttribute('x-prefix')
        self.script(thisScript.getAttribute('x-summon'))
    }

    return self
})()
