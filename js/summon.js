var Summon = (function() {
    var self = {}
    var scriptTarget = document.getElementsByTagName('head')[0]
    var thisScript = document.querySelector('[x-summon]')

    if (!scriptTarget) {
        throw "Whoa there. You can't Summon if you don't have a <head>."
    }

    self.script = function(srcUrl) {
        var script = document.createElement('script')
        script.src = srcUrl
        scriptTarget.appendChild(script)
    }

    self.scripts = function() {
        for (var i = 0; i < arguments.length; i++) {
            self.addScript(arguments[i])
        }
    }

    if (thisScript) {
        self.script(thisScript.getAttribute('x-summon'))
    }

    return self
})()
