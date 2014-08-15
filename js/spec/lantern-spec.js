"use strict"

var any = jasmine.any
var they = it

describe('Strict Mode', function() {
    it("is in effect", function() {
        var obj = {}, caught
        Object.freeze(obj);
        try {
            obj.haha = 'no'
        } catch(e) {
            caught = e
        }
        expect(caught).not.toBe(undefined)
    })
})

describe('Lantern', function() {
    describe('.makeObject', function() {
        it("returns the object it's given", function() {
            var obj = {}
            expect(Lantern.makeObject(obj)).toBe(obj)
        })

        it("creates an object if given none", function() {
            expect(typeof Lantern.makeObject()).toEqual('object')
        })

        describe('the returned object', function() {
            beforeEach(function() {
                this.object = Lantern.makeObject()
            })

            it('has a mod method', function() {
                expect(typeof Lantern.makeObject().mod).toEqual('function')
            })
        })
    })

    describe('Lantern::Object', function() {
        beforeEach(function() {
            this.object = Lantern.makeObject()
        })

        describe('.mod', function() {
            it('modifies the original object', function() {
                this.object.mod(function(self) {
                    self.foo = 'bar'
                })

                expect(this.object.foo).toEqual('bar')
            })

            it('returns the original object', function() {
                var returned = this.object.mod(function(self) {
                    self.foo = 'bar'
                })

                expect(returned).toBe(this.object)
            })

            it('does not allow modification by the same function more than once', function() {
                var setFoo = function(self) {
                    self.foo = 'bar'
                }

                this.object.mod(setFoo)
                expect(this.object.foo).toEqual('bar')
                this.object.foo = 'quaxxor'
                this.object.mod(setFoo)
                expect(this.object.foo).toEqual('quaxxor')
            })

            it('passes the object, private container, super of the object, and super of the private container to the module function', function() {
                this.object.mod(function(self, _self, original, _original) {
                    self.getSecret = function() { return _self.secret }
                    _self.secret = 'be sure to drink your ovaltine'
                })

                expect(this.object.secret).toBe(undefined)
                expect(this.object.getSecret()).toBe('be sure to drink your ovaltine')
            })

            it('allows methods defined in the function passed to mod to call super methods', function() {
                this.object.mod(function(self, _self) {
                    self.getSecret = function() { return "From the depths of my soul: " + _self.getSecret() }
                    _self.getSecret = function() { return _self.secret }
                    _self.secret = 'be sure to drink your ovaltine'
                })

                expect(this.object.secret).toBe(undefined)
                expect(this.object.getSecret()).toEqual('From the depths of my soul: be sure to drink your ovaltine')

                this.object.mod(function(self, _self, sup, _sup) {
                    self.getSecret = function() {
                        return 'From ages past: ' + sup.getSecret()
                    }

                    _self.getSecret = function() {
                        return _sup.getSecret().toUpperCase()
                    }
                })

                expect(this.object.getSecret()).toEqual('From ages past: From the depths of my soul: BE SURE TO DRINK YOUR OVALTINE')
            })
        })
    })

    describe('.createModule', function() {
        beforeEach(function() {
            this.f = function(target) {
                target.foo = 1
            }
            this.setFoo = Lantern.createModule(this.f)
            this.obj = Lantern.makeObject()
        })

        it('given a mod definition, returns a function that, given an object, mods the object', function() {
            expect(this.obj.foo).toBe(undefined)
            this.setFoo(this.obj)
            expect(this.obj.foo).toBe(1)
        })

        it('can define a module with dependencies on other modules', function() {
            var defineFoo = Lantern.createModule(function(target, _target) {
                _target.foo = function() { return 1 }
            })

            var publicizeFoo = Lantern.createModule(
                defineFoo,
                function(target, _target, sup, _sup) {
                    target.foo = function() { return "Foo is " + _sup.foo() }
                }
            )

            publicizeFoo(this.obj)

            expect(this.obj.foo()).toEqual("Foo is 1")
        })

        it('does not re-add dependencies if the object has already installed them', function() {
            var defineFoo = Lantern.createModule(function(target) {
                target.fooCounter++
            })

            var obj = {fooCounter: 0}
            defineFoo(obj)
            expect(obj.fooCounter).toBe(1)

            var publicizeFoo = Lantern.createModule(
                defineFoo, function() {}
            )

            publicizeFoo(obj)

            expect(obj.fooCounter).toBe(1)
        })
    })

    describe('a Lantern module', function() {
        beforeEach(function() {
            this.f = function(target) {
                target.foo = 1
            }
            this.setFoo = Lantern.createModule(this.f)
            this.obj = Lantern.makeObject()
        })

        it('returns the modded object', function() {
            expect(this.setFoo(this.obj)).toBe(this.obj)
        })

        it('creates a new object if given none', function() {
            var obj = this.setFoo()
            expect(obj.foo).toBe(1)
        })

        it('defines the mod method if given an object that does not implement it', function() {
            var obj = this.setFoo({})
            expect(obj.mod).not.toBe(undefined)
        })

        it('can be passed back to .createModule to create compound modules', function() {
            var makeFoo = Lantern.createModule(function(target, _target) {
                target.foo = function() { return _target.foo }
            })
            var makeBar = Lantern.createModule(function(target, _target, sup) {
                target.bar = function() { return sup.foo() + 1 }
                _target.foo = 1
            })
            var makeFooAndBar = Lantern.createModule(makeFoo, makeBar)

            var obj = makeFooAndBar()

            expect(obj.foo()).toEqual(1)
            expect(obj.bar()).toEqual(2)
        })
    })

    describe('.makeObject', function() {
        it("returns a new object with an extend method", function() {
            var obj1 = Lantern.makeObject()
            var obj2 = Lantern.makeObject()
            expect(typeof obj1.mod).toEqual('function')
            expect(obj2).not.toBe(obj1)
        })
    })
})

describe("Lantern utilities", function() {
    describe(".given", function() {
        it("returns true given 1", function() {
            expect(Lantern.given(1)).toBe(true)
        })

        it("returns true given false", function() {
            expect(Lantern.given(false)).toBe(true)
        })

        it("returns true given null", function() {
            expect(Lantern.given(null)).toBe(true)
        })

        it("returns false given undefined", function() {
            expect(Lantern.given(undefined)).toBe(false)
        })
    })

    describe(".missing", function() {
        it("returns false given false", function() {
            expect(Lantern.missing(false)).toBe(false)
        })

        it("returns false given null", function() {
            expect(Lantern.missing(null)).toBe(false)
        })

        it("returns true given undefined", function() {
            expect(Lantern.missing(undefined)).toBe(true)
        })
    })

    describe(".default", function() {
        describe("when the first argument is defined", function() {
            it("returns the first argument", function() {
                expect(Lantern.default(false)).toBe(false)
                expect(Lantern.default(1)).toBe(1)
            })
        })

        describe("when the first argument is not defined", function() {
            it("returns the second argument", function() {
                expect(Lantern.default(undefined, 1)).toBe(1)
            })
        })
    })

    describe(".identity", function() {
        it("returns the first argument", function() {
            expect(Lantern.identity(1)).toBe(1)
        })
    })

    describe(".isObject", function() {
        it("returns true iff given an object", function() {
            expect(Lantern.isObject({})).toBe(true)
            expect(Lantern.isObject([])).toBe(false)
            expect(Lantern.isObject(function() {})).toBe(false)
            expect(Lantern.isObject("")).toBe(false)
            expect(Lantern.isObject(1)).toBe(false)
            expect(Lantern.isObject(true)).toBe(false)
            expect(Lantern.isObject(null)).toBe(false)
            expect(Lantern.isObject()).toBe(false)
        })
    })

    describe(".isArray", function() {
        it("returns true iff given an array", function() {
            expect(Lantern.isArray({})).toBe(false)
            expect(Lantern.isArray([])).toBe(true)
            expect(Lantern.isArray(function() {})).toBe(false)
            expect(Lantern.isArray("")).toBe(false)
            expect(Lantern.isArray(1)).toBe(false)
            expect(Lantern.isArray(true)).toBe(false)
            expect(Lantern.isArray(null)).toBe(false)
            expect(Lantern.isArray()).toBe(false)
        })
    })

    describe(".isFunction", function() {
        it("returns true iff given a function", function() {
            expect(Lantern.isFunction({})).toBe(false)
            expect(Lantern.isFunction([])).toBe(false)
            expect(Lantern.isFunction(function() {})).toBe(true)
            expect(Lantern.isFunction("")).toBe(false)
            expect(Lantern.isFunction(1)).toBe(false)
            expect(Lantern.isFunction(true)).toBe(false)
            expect(Lantern.isFunction(null)).toBe(false)
            expect(Lantern.isFunction()).toBe(false)
        })
    })

    describe(".isString", function() {
        it("returns true iff given a string", function() {
            expect(Lantern.isString({})).toBe(false)
            expect(Lantern.isString([])).toBe(false)
            expect(Lantern.isString(function() {})).toBe(false)
            expect(Lantern.isString("")).toBe(true)
            expect(Lantern.isString(1)).toBe(false)
            expect(Lantern.isString(true)).toBe(false)
            expect(Lantern.isString(null)).toBe(false)
            expect(Lantern.isString()).toBe(false)
        })
    })

    describe(".isNumber", function() {
        it("returns true iff given a number", function() {
            expect(Lantern.isNumber({})).toBe(false)
            expect(Lantern.isNumber([])).toBe(false)
            expect(Lantern.isNumber(function() {})).toBe(false)
            expect(Lantern.isNumber("")).toBe(false)
            expect(Lantern.isNumber(1)).toBe(true)
            expect(Lantern.isNumber(0/0)).toBe(false)
            expect(Lantern.isNumber(1/0)).toBe(false)
            expect(Lantern.isNumber(true)).toBe(false)
            expect(Lantern.isNumber(null)).toBe(false)
            expect(Lantern.isNumber()).toBe(false)
        })
    })

    describe(".isInfinite", function() {
        it("returns true iff given an infinite quantity", function() {
            expect(Lantern.isInfinite(1)).toBe(false)
            expect(Lantern.isInfinite(0/0)).toBe(false)
            expect(Lantern.isInfinite(1/0)).toBe(true)
            expect(Lantern.isInfinite(-1/0)).toBe(true)
        })
    })

    describe(".isBoolean", function() {
        it("returns true iff given a boolean", function() {
            expect(Lantern.isBoolean(1)).toBe(false)
            expect(Lantern.isBoolean(true)).toBe(true)
            expect(Lantern.isBoolean(false)).toBe(true)
            expect(Lantern.isBoolean(0)).toBe(false)
            expect(Lantern.isBoolean()).toBe(false)
        })
    })

    describe(".forAll", function() {
        it("calls the given function with each element of the array and the index", function() {
            var nums = [1, 2, 3, 4]
            var results = []
            $.forAll(nums, function(n, i) {
                results.push(n*2+i)
            })
            expect(results).toEqual([2,5,8,11])
        })

        it("returns the given array", function() {
            var nums = [1, 2, 3, 4]
            var returned = $.forAll(nums, function() {})
            expect(returned).toBe(nums)
        })
    })

    describe(".forAllPropertiesOf", function() {
        it("calls the given function with each key and value of the object, and an arbitrary sequence number", function() {
            var obj = {foo: 1, bar: 2, baz: 3}
            var result = {}
            var sequence = []
            $.forAllPropertiesOf(obj, function(k, v, i) {
                result[k.toUpperCase()] = v*2
                sequence.push(i)
            })
            expect(result).toEqual({FOO: 2, BAR: 4, BAZ: 6})
            expect(sequence).toEqual([0,1,2])
        })

        it("returns the given array", function() {
            var nums = [1, 2, 3, 4]
            var returned = $.forAll(nums, function() {})
            expect(returned).toBe(nums)
        })
    })

    describe(".remove", function() {
        it("removes all instances of the element from the array", function() {
            var a = [1]
            $.remove(1, a)
            expect(a).toEqual([])

            a = [2, 1, 3, 1]
            $.remove(1, a)
            expect(a).toEqual([2, 3])
        })
    })

    describe(".call", function() {
        it("calls the given function and returns the result", function() {
            var fn = function() { return 1 }
            expect($.call(fn)).toBe(1)
        })

        it("accepts an array of arguments as the second parameter", function() {
            var fn = function(x) { return x+1 }
            expect($.call(fn, [2])).toBe(3)
        })

        it("returns undefined if given something other than a function", function() {
            expect($.call()).toBe(undefined)
            expect($.call(1)).toBe(undefined)
        })
    })

    describe(".makePropertyChangeEvents", function() {
        it("adds a private method defineProperty to the given object", function() {
            var obj = $.makeObject()
            obj.mod(function(self, _self) {
                expect(_self.defineProperty).toBe(undefined)
            })
            $.makePropertyChangeEvents(obj)
            obj.mod(function(self, _self) {
                expect(typeof _self.defineProperty).toEqual('function')
            })
        })

        describe("the added defineProperty method", function() {
            it("lets modules define properties that fire a propertyChanged event when set", function() {
                var obj = $.makePropertyChangeEvents(Lantern.makeObject())
                obj.fire = function() {}
                obj.mod(function(self, _self) {
                    _self.defineProperty('foo', 1)
                })

                var spy = spyOn(obj, 'fireEvent')

                obj.foo = 2

                expect(spy).toHaveBeenCalledWith('propertyChanged', any(Object))
            })
        })

        describe("the defined properties", function() {
            they("are settable and gettable", function() {
                var obj = $.makePropertyChangeEvents(Lantern.makeObject())

                obj.mod(function(self, _self) {
                    _self.defineProperty('foo', 1)
                    _self.defineProperty('greeting', "hi")
                })

                expect(obj.foo).toBe(1)
                expect(obj.greeting).toEqual("hi")
                obj.foo = 2
                expect(obj.foo).toBe(2)
                expect(obj.greeting).toEqual("hi")
            })
        })
    })

    describe('.makeAliasedProperties', function() {
        it('creates an object with a private aliasProperty method', function() {
            var obj = $.makeObject()

            obj.mod(function(target, _target) {
                expect(_target.aliasProperty).toBe(undefined)
            })

            $.makeAliasedProperties(obj)

            obj.mod(function(target, _target) {
                expect(typeof _target.aliasProperty).toEqual('function')
            })
        })

        describe(".aliasProperty", function() {
            it("defines a non-enumerable property", function() {
                var obj = $.makeAliasedProperties()

                obj.mod(function(self, _self) {
                    _self.aliasProperty('colour', 'color')
                })

                obj.colour = 'blue'

                $.forAllPropertiesOf(obj, function(k) {
                    expect(k).not.toEqual('colour')
                })
            })

            it("makes setting and getting the alias the same as setting and getting the property", function() {
                var obj = $.makeAliasedProperties()
                obj.color = 'blue'

                obj.mod(function(self, _self) {
                    _self.aliasProperty('colour', 'color')
                })

                expect(obj.colour).toEqual('blue')
                expect(obj.color).toEqual('blue')
                obj.colour = 'green'
                expect(obj.color).toEqual('green')
                expect(obj.colour).toEqual('green')
                obj.color = 'red'
                expect(obj.color).toEqual('red')
                expect(obj.colour).toEqual('red')
            })
        })
    })

    describe('.makeEvents', function() {
        it('adds public fireEvent and registerEventHandler methods to the given object', function() {
            var obj = $.makeEvents()

            var eventCount = 0
            obj.registerEventHandler('exampleEvent', function() {
                eventCount++
            })
            obj.fireEvent('exampleEvent')
            expect(eventCount).toBe(1)
            obj.fireEvent('otherEvent')
            expect(eventCount).toBe(1)
            obj.fireEvent('exampleEvent')
            expect(eventCount).toBe(2)
        })

        describe('.removeEventHandler', function() {
            it('causes the event handler not to be called when the event is fired', function() {
                var obj = $.makeEvents()

                var eventCount = 0
                var count = function() {
                    eventCount++
                }

                obj.registerEventHandler('foo', count)
                obj.fireEvent('foo')

                expect(eventCount).toBe(1)

                obj.removeEventHandler('foo', count)

                obj.fireEvent('foo')

                expect(eventCount).toBe(1)
            })
        })

        describe('.clearEventHandlers', function() {
            it('causes all event handlers not to be called when the event is fired', function() {
                var obj = $.makeEvents()

                var eventCount1 = 0, eventCount2 = 0
                var count1 = function() {
                    eventCount1++
                }
                var count2 = function() {
                    eventCount2++
                }

                obj.registerEventHandler('foo', count1)
                obj.registerEventHandler('foo', count2)
                obj.fireEvent('foo')

                expect(eventCount1).toBe(1)
                expect(eventCount2).toBe(1)

                obj.clearEventHandlers('foo')

                obj.fireEvent('foo')

                expect(eventCount1).toBe(1)
                expect(eventCount2).toBe(1)
            })
        })
    })

    describe('.makeConstants', function() {
        it('adds a private defineConstant method to the object', function() {
            var obj = $.makeConstants()

            obj.mod(function(target, _target) {
                _target.defineConstant('PI', 3.14159)
            })

            expect(obj.PI).toBeCloseTo(3.14159, 0.0001)
            expect(function() { obj.PI = 1 }).toThrow("You can't change the value of PI")
        })
    })
})
