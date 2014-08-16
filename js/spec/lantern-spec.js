"use strict"

var any = jasmine.any
var they = it

describe("Lantern modules", function() {
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

describe('Lantern UI', function() {
    describe('.createButton', function() {
        it('adds a button to the DOM', function() {
            var beforeCount = jQuery('button').length
            Lantern.createButton()
            var afterCount = jQuery('button').length
            expect(afterCount).toEqual(beforeCount + 1)
        })

        describe('the button', function() {
            it('can handle click events', function() {
                var button = Lantern.createButton()

                var called = false
                button.whenClicked(function() {
                    called = true
                })

                expect(called).toBe(false)

                jQuery('button').trigger('click')

                expect(called).toBe(true)
            })
        })
    })
})
