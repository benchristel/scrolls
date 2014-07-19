describe("Once", function() {
    var createResolveable = function() {
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

    describe("given a resolveable and a function", function() {
        it("returns a function", function() {
            var returned = Once(createResolveable(), function() {})
            expect(typeof returned).toEqual("function")
        })

        describe("the returned function", function() {
            it("has no immediate effect if the resolveable is not resolved", function() {
                var called = false
                var fn = Once(createResolveable(), function() { called = true })
                fn()
                expect(called).toBe(false)
            })

            it("queues calls and executes them all when the resolveable is resolved", function() {
                var sum = 0, r = createResolveable()
                var fn = Once(r, function(x) { sum += x })
                fn(1)
                fn(2)
                expect(sum).toBe(0)
                r.resolve()
                expect(sum).toBe(3)
            })

            it("executes calls immediately if the resolveable is already resolved", function() {
                var sum = 0, r = createResolveable()
                var fn = Once(r, function(x) { sum += x })
                fn(1)
                r.resolve()
                expect(sum).toBe(1)
                fn(2)
                expect(sum).toBe(3)
            })

            it("acts idempotently if the notifier is notified multiple times", function() {
                var sum = 0, r = createResolveable()
                var fn = Once(r, function(x) { sum += x })
                fn(1)
                r.resolve()
                r.resolve()
                expect(sum).toBe(1)
            })
        })
    })

    describe("given an array of resolveables and a function", function() {
        describe("when only some of the resolveables are resolved", function() {
            it("queues calls to the function", function() {
                var sum = 0, r = [createResolveable(), createResolveable()]
                r[0].resolve()
                var fn = Once(r, function(x) { sum += x })
                fn(1)
                expect(sum).toBe(0)
                r[1].resolve()
                expect(sum).toBe(1)
            })
        })

        describe("when all of the resolveables are resolved", function() {
            it("calls the function immediately", function() {
                var sum = 0, r = [createResolveable(), createResolveable()]
                r[0].resolve()
                r[1].resolve()
                var fn = Once(r, function(x) { sum += x })
                fn(1)
                expect(sum).toBe(1)
            })
        })
    })
})
