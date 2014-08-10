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
    describe('.createObject', function() {
        it("returns the object it's given", function() {
            var obj = {}
            expect(Lantern.createObject(obj)).toBe(obj)
        })

        it("creates an object if given none", function() {
            expect(typeof Lantern.createObject()).toEqual('object')
        })

        describe('the returned object', function() {
            beforeEach(function() {
                //this.spawner = Lantern.createSpawner(function() {})
                this.object = Lantern.createObject()
            })

            it('has an extend method', function() {
                expect(typeof this.object.extend).toEqual('function')
            })

            describe('extending the created object', function() {
                it('modifies the original object', function() {
                    this.object.extend(function(self) {
                        self.foo = 'bar'
                    })

                    expect(this.object.foo).toEqual('bar')
                })

                it('returns the original object', function() {
                    var returned = this.object.extend(function(self) {
                        self.foo = 'bar'
                    })

                    expect(returned).toBe(this.object)
                })

                it('passes the object, private container, super of the object, and super of the private container to the extender function', function() {
                    this.object.extend(function(self, _self, original, _original) {
                        self.getSecret = function() { return _self.secret }
                        _self.secret = 'be sure to drink your ovaltine'
                    })

                    expect(this.object.secret).toBe(undefined)
                    expect(this.object.getSecret()).toBe('be sure to drink your ovaltine')
                })

                it('allows methods defined by the extender to call super methods', function() {
                    this.object.extend(function(self, _self) {
                        self.getSecret = function() { return "From the depths of my soul: " + _self.getSecret() }
                        _self.getSecret = function() { return _self.secret }
                        _self.secret = 'be sure to drink your ovaltine'
                    })

                    expect(this.object.secret).toBe(undefined)
                    expect(this.object.getSecret()).toEqual('From the depths of my soul: be sure to drink your ovaltine')

                    this.object.extend(function(self, _self, sup, _sup) {
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

            describe('extending with multiple extender functions', function() {
                it('calls the extenders in order', function() {
                    var addFoo = function(self) {
                        self.foo = function() { return "foo" }
                    }
                    var addBar = function(self, _, sup) {
                        self.foo = function() { return sup.foo() + 'bar' }
                    }

                    expect(this.object.extend(addFoo, addBar).foo()).toEqual('foobar')
                })
            })
        })
    })

    describe('.extender', function() {
        beforeEach(function() {
            this.f = function(target) {
                target.foo = 1
            }
            this.setFoo = Lantern.extender(this.f)
            this.obj = Lantern.createObject()
        })

        it('given an extension function, returns a function that, given an object, extends the object with the extension function', function() {
            expect(this.obj.foo).toBe(undefined)
            this.setFoo(this.obj)
            expect(this.obj.foo).toBe(1)
        })

        it('given multiple extension functions, returns a function that, given an object, extends the object with each extension function in order', function() {
            var setFooAndBar = Lantern.extender(
                function(target) {
                    target.foo = 1
                    target.baz = []
                },
                function(target) {
                    target.bar = 2
                    target.baz.push(1)
                }
            )

            expect(this.obj.foo).toBe(undefined)

            setFooAndBar(this.obj)

            expect(this.obj.foo).toBe(1)
            expect(this.obj.bar).toBe(2)
            expect(this.obj.baz).toEqual([1])
        })

        describe('the returned function', function() {
            it('returns the extended object', function() {
                expect(this.setFoo(this.obj)).toBe(this.obj)
            })

            it('raises an error if called with an object that does not implement .extend', function() {
                var _this = this
                expect(function() {
                    _this.setFoo({})
                }).toThrowError("You tried to extend an object that doesn't have an .extend method. Only objects created with Lantern.createObject can be extended")
            })
        })
    })

    describe('.createObject', function() {
        it("returns a new object with an extend method", function() {
            var obj1 = Lantern.createObject()
            var obj2 = Lantern.createObject()
            expect(typeof obj1.extend).toEqual('function')
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

    describe(".addProperties", function() {
        it("adds private methods defineProperty, aliasProperty, and defineConstant to the given object", function() {
            var obj = $.createObject()
            obj.extend(function(self, _self) {
                expect(_self.defineProperty).toBe(undefined)
            })
            $.addProperties(obj)
            obj.extend(function(self, _self) {
                expect(typeof _self.defineProperty).toEqual('function')
                expect(typeof _self.aliasProperty).toEqual('function')
            })
        })

        describe("the added defineProperty method", function() {
            it("lets extenders define properties that fire a propertyChanged event when set", function() {
                var obj = $.addProperties(Lantern.createObject())
                obj.fire = function() {}
                obj.extend(function(self, _self) {
                    _self.defineProperty('foo', 1)
                })

                var spy = spyOn(obj, 'fire')

                obj.foo = 2

                expect(spy).toHaveBeenCalledWith('propertyChanged', any(Object))
            })
        })

        describe("the defined properties", function() {
            they("are settable and gettable", function() {
                var obj = $.addProperties(Lantern.createObject())

                obj.extend(function(self, _self) {
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

        describe(".aliasProperty", function() {
            it("defines a non-enumerable property", function() {
                var obj = $.addProperties(Lantern.createObject())

                obj.extend(function(self, _self) {
                    _self.defineProperty('color', 'blue')
                    _self.aliasProperty('colour', 'color')
                })

                $.forAllPropertiesOf(obj, function(k) {
                    expect(k).not.toEqual('colour')
                })
            })

            it("makes setting and getting the alias the same as setting and getting the property", function() {
                var obj = $.addProperties(Lantern.createObject())

                obj.extend(function(self, _self) {
                    _self.defineProperty('color', 'blue')
                    _self.aliasProperty('colour', 'color')
                })

                var changed = []
                obj.fire = function(eventName, event) {
                    if (eventName === 'propertyChanged') {
                        changed.push(event.property)
                    }
                }

                expect(obj.colour).toEqual('blue')
                expect(obj.color).toEqual('blue')
                obj.colour = 'green'
                expect(obj.color).toEqual('green')
                expect(obj.colour).toEqual('green')
                obj.color = 'red'
                expect(obj.color).toEqual('red')
                expect(obj.colour).toEqual('red')
                expect(changed).toEqual(['color', 'color'])
            })
        })
    })
})
