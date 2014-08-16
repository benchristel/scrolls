"use strict"

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

    describe('a Lantern object', function() {
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
