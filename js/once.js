var Blocker = function() {
    var subscribers = []
    var resolved = false

    return {
        onceResolved: function(callback) {
            if (resolved) {
                callback()
            }
            subscribers.push(callback)
        },
        isResolved: function() { return resolved },
        resolve: function() {
            if (resolved) return
            resolved = true
            for(var i = 0; i < subscribers.length; i++) {
                subscribers[i]()
            }
        }
    }
}

var Once = function(resolveables, fn) {
    var callQueue = [], alreadyCalled = false

    if (!(resolveables instanceof Array)) {
        resolveables = [resolveables]
    }

    var ready = function() {
        for (var i = 0; i < resolveables.length; i++) {
            if (!resolveables[i].isResolved()) return false
        }
        return true
    }

    for (var i = 0; i < resolveables.length; i++) {
        resolveables[i].onceResolved(function() {
            if (!ready()) return
            for (var k = 0; k < callQueue.length; k++) {
                fn.apply(null, callQueue[k].args)
            }
            callQueue.length = 0
        })
    }

    return function() {
        var args = Array.prototype.slice.apply(arguments)
        if (ready()) {
            return fn.apply(null, args)
        } else {
            var call = {args: args}
            callQueue.push(call)
            return call
        }
    }
}

var Idempotent = function(fn) {
    var cache, idem = function() {
        if (idem.called) {
            return cache
        } else {
            idem.called = true
            return cache = fn()
        }
    }
    idem.called = false
    return idem
}

var createDependency = function(url) {
    var blocker = Blocker()
    return Idempotent(function() {
        request(url).done(blocker.resolve)
    })
}

youtubeAPI = {}
youtubeAPI.install = Idempotent(function() {
    var blocker = Blocker()
    window.onYoutubeApiReady = function() {
        blocker.resolve()
    }
    requestYoutubeApi()

    return {
        done: blocker
    }
})

self.playVideo = $.once(youtubeAPI.install().done, function() {
    var video = youtubeAPI.getVideo(self.domElement)
    video.startPlaying()
})
