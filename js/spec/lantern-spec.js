"use strict"

var any = jasmine.any
var they = it

describe("Lantern modules", function() {
    describe(".makeConfiguredProperties", function() {
        it("adds a private method defineProperty to the given object", function() {
            var obj = $.makeObject()
            obj.mod(function(self, _self) {
                expect(_self.defineProperty).toBe(undefined)
            })
            $.makeConfiguredProperties(obj)
            obj.mod(function(self, _self) {
                expect(typeof _self.defineProperty).toEqual('function')
            })
        })

        describe("the defined properties", function() {
            they("are settable and gettable", function() {
                var obj = $.makeConfiguredProperties(Lantern.makeObject())

                obj.mod(function(published, self) {
                    self.defineProperty('foo', 1)
                    self.defineProperty('greeting', "hi")
                })

                expect(obj.foo).toBe(1)
                expect(obj.greeting).toEqual("hi")
                obj.foo = 2
                expect(obj.foo).toBe(2)
                expect(obj.greeting).toEqual("hi")
            })

            they("are public regardless of whether they are set on the published or shared facet", function() {
                var obj = $.makeConfiguredProperties(Lantern.makeObject())

                obj.mod(function(pub, self) {
                    self.defineProperty('a', 'a1')
                    self.defineProperty('b', 'b1')

                    pub.a = 'a2'
                    self.b = 'b2' // this calls the setter method on the prototype of `self`, which is `pub`.
                                  // TODO: figure out if this is actually ECMAScript-specified behavior, or just Google
                })

                expect(obj.a).toEqual('a2')
                expect(obj.b).toEqual('b2')
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

        it('makes the button a child of the element with id `lantern-portal`', function() {
            var beforeCount = jQuery('#lantern-portal button').length
            Lantern.createButton()
            var afterCount = jQuery('#lantern-portal button').length
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

            it('has a text property that sets innerHTML', function() {
                Lantern.createButton().mod(function(button, _) {
                    expect(_.domElement.innerHTML).toEqual('')
                    button.text = 'hi'
                    expect(_.domElement.innerHTML).toEqual('hi')
                })
            })

            it('has a color property that sets background-color', function() {
                Lantern.createButton().mod(function(button, _) {
                    expect(_.domElement.style.backgroundColor).toEqual('white')
                    button.color = 'green'
                    expect(_.domElement.style.backgroundColor).toEqual('green')
                })
            })

            it('has a textColor property that sets css color', function() {
                Lantern.createButton().mod(function(button, _) {
                    expect(_.domElement.style.color).toEqual('black')
                    button.textColor = 'red'
                    expect(_.domElement.style.color).toEqual('red')
                })
            })

            it('has a top property that sets css top', function() {
                Lantern.createButton().mod(function(button, _) {
                    expect(_.domElement.style.top).toEqual('50px')
                    button.top = 123
                    expect(_.domElement.style.top).toEqual('123px')
                })
            })

            it('has a left property that sets css left', function() {
                Lantern.createButton().mod(function(button, _) {
                    expect(_.domElement.style.left).toEqual('50px')
                    button.left = 123
                    expect(_.domElement.style.left).toEqual('123px')
                })
            })

            it('has a rotation property that sets transform', function() {
                Lantern.createButton().mod(function(button, _) {
                    expect(_.domElement.style.transform).toEqual('rotate(0deg)')
                    button.rotation = 10
                    expect(_.domElement.style.transform).toEqual('rotate(10deg)')
                })
            })

            it('has a width property that sets css width', function() {
                Lantern.createButton().mod(function(button, _) {
                    expect(_.domElement.style.width).toEqual('100px')
                    button.width = 123
                    expect(_.domElement.style.width).toEqual('123px')
                })
            })

            it('has a height property that sets css width', function() {
                Lantern.createButton().mod(function(button, _) {
                    expect(_.domElement.style.height).toEqual('50px')
                    button.height = 123
                    expect(_.domElement.style.height).toEqual('123px')
                })
            })

            it('has a pivotX property that sets transform-origin', function() {
                Lantern.createButton().mod(function(button, _) {
                    expect(_.domElement.style.transformOrigin).toEqual('50% 50% 0px')
                    button.pivotX = 0.9
                    expect(_.domElement.style.transformOrigin).toEqual('90% 50% 0px')
                })
            })

            it('has a pivotY property that sets transform-origin', function() {
                Lantern.createButton().mod(function(button, _) {
                    expect(_.domElement.style.transformOrigin).toEqual('50% 50% 0px')
                    button.pivotY = 0.9
                    expect(_.domElement.style.transformOrigin).toEqual('50% 90% 0px')
                })
            })

            it('has a visible property that sets css display', function() {
                Lantern.createButton().mod(function(button, _) {
                    expect(_.domElement.style.display).toEqual('block')
                    button.visible = false
                    expect(_.domElement.style.display).toEqual('none')
                })
            })

            it('has an imageUrl property that sets css background-image', function() {
                Lantern.createButton().mod(function(button, _) {
                    expect(_.domElement.style.backgroundImage).toEqual('none')
                    button.imageUrl = 'http://example.com'
                    expect(_.domElement.style.backgroundImage).toEqual('url(http://example.com/)')
                })
            })

            it('has an imageResize property that sets css background-size', function() {
                Lantern.createButton().mod(function(button, _) {
                    expect(_.domElement.style.backgroundSize).toEqual('contain')
                    button.imageResize = 'fill'
                    expect(_.domElement.style.backgroundSize).toEqual('cover')
                })
            })

            it('has a borderWidth property that sets css border-width', function() {
                Lantern.createButton().mod(function(button, _) {
                    expect(_.domElement.style.borderWidth).toEqual('1px')
                    button.borderWidth = 11
                    expect(_.domElement.style.borderWidth).toEqual('11px')
                })
            })

            it('has a zIndex property that sets css z-index to an integer', function() {
                Lantern.createButton().mod(function(button, _) {
                    expect(_.domElement.style.zIndex).toEqual('1')
                    button.zIndex = 1000.12345
                    expect(_.domElement.style.zIndex).toEqual('1000')
                })
            })

            it('has a fontSize property that sets CSS font size', function() {
                Lantern.createButton().mod(function(button, _) {
                    expect(_.domElement.style.fontSize).toEqual('20px')
                    button.fontSize = 16
                    expect(_.domElement.style.fontSize).toEqual('16px')
                })
            })
        })
    })
})

describe('Lantern.preloadResources', function() {
    it('loads a list of image urls', function() {
        var obtainedImages = []

        Lantern.mod(function(_, $) {
            spyOn($, 'obtainImage').and.callFake(function() {
                var img = {onload: null}
                obtainedImages.push(img)
                return img
            })
        })

        var resourceLoader = Lantern.preloadResources(
            ['https://www.e.com/one.jpg',
             'https://www.e.com/two.jpg'
            ]
        )

        expect(obtainedImages[0].src).toEqual('https://www.e.com/one.jpg')
        expect(obtainedImages[1].src).toEqual('https://www.e.com/two.jpg')

        var doneLoading = false
        resourceLoader.whenFinishedLoading(function() {
            doneLoading = true
        })

        expect(doneLoading).toBe(false)
        obtainedImages[1].onload()
        expect(doneLoading).toBe(false)
        obtainedImages[0].onload()
        expect(doneLoading).toBe(true)
    })
})

describe('Lantern Animations', function() {
    it('can animate an object property', function() {
        var duck = $.makeAnimatable({speed: 0})
        duck.startAnimating('speed', 100, 0.5)
        expect(duck.speed).toEqual(0)
        $.fireEvent('frame', {secondsSinceLastFrame: 0.25})
        expect(duck.speed).toEqual(50)
        $.fireEvent('frame', {secondsSinceLastFrame: 0.25})
        expect(duck.speed).toEqual(100)
        $.fireEvent('frame', {secondsSinceLastFrame: 0.25})
        expect(duck.speed).toEqual(100)
    })

    it('triggers a callback when the animation completes', function() {
        var duck = {speed: 0}, done = false
        var announceDone = function() { done = true }
        Lantern.startAnimation(duck, 'speed', 100, 40).andThen(announceDone)
        $.repeat(3, function() { $.fireEvent('frame') })
        expect(done).toBe(false)
        $.fireEvent('frame')
        expect(done).toBe(true)
    })
})

describe('the Lantern portal', function() {
    it('is relatively positioned', function() {
        Lantern.portal.mod(function(_, portal) {
            expect(portal.domElement.style.position).toEqual('relative')
        })
    })

    it('has top = left = 0', function() {
        Lantern.portal.mod(function(_, portal) {
            expect(portal.domElement.style.top).toEqual('0px')
            expect(portal.domElement.style.left).toEqual('0px')
        })
    })
})
