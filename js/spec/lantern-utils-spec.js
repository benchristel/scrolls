"use strict"

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

describe('Lantern2 bootstrapping', function() {
    it("defines good stuff", function() {
        expect(Lantern2).not.toBe(undefined)

        var spawnTurtle = Lantern2.constructor(function(shell, guts) {
            shell.greet = function() { return guts.inside }
            guts.inside = "poo"
        })

        var turtle = spawnTurtle()
        expect(turtle.greet()).toEqual("poo")
        expect(turtle.guts).toBe(undefined)
        expect(turtle.inside).toBe(undefined)

        turtle.extend(function(shell, guts, old) {
            guts.inside = "gold"
            shell.greet = function() {
                return "hi! I'm full of " + old.greet()
            }
        })

        expect(turtle.greet()).toEqual("hi! I'm full of gold")
    })
})

describe('Lantern', function() {
    afterEach(function() {
       Lantern.clearScreen()
    })

    it("exists", function() {
        expect(Lantern).not.toBe(undefined)
    })

    it("is aliased as $", function() {
        expect($).toEqual(Lantern)
    })

    describe(".additions", function() {
        it("lets me add a .myStuff property and access it with $.myStuff", function() {
            expect($.myStuff).toBe(undefined)
            $.additions.myStuff = "shtoo"
            expect($.myStuff).toEqual("shtoo")
        })

        it("but I can't add stuff directly to Lantern", function() {
            var caught
            try {
                $.haha = 'no'
            } catch(e) {
                caught = e
            }
            expect($.haha).toBe(undefined)
            expect(caught).not.toBe(undefined)
        })
    })

    describe(".given", function() {
        it("returns true when passed (1)", function() {
            expect($.given(1)).toBe(true)
        })

        it("returns true when passed (null)", function() {
            expect($.given(null)).toBe(true)
        })

        it("returns false when passed (undefined)", function() {
            expect($.given(undefined)).toBe(false)
        })
    })

    describe(".missing", function() {
        it("returns false when passed (1)", function() {
            expect($.missing(1)).toBe(false)
        })

        it("returns false when passed (null)", function() {
            expect($.missing(null)).toBe(false)
        })

        it("returns true when passed (undefined)", function() {
            expect($.missing(undefined)).toBe(true)
        })
    })

    describe(".init", function() {
        it("returns its first argument when it is defined", function() {
            var v = 0
            v = $.init(v, 1)
            expect(v).toBe(0)
        })

        it("returns its second argument when the first is not defined", function() {
            var v
            v = $.init(v, 1)
            expect(v).toBe(1)
        })
    })

    describe(".isFunction", function() {
        it("returns true when given a function", function() {
            expect($.isFunction(function(){})).toBe(true)
        })

        it("returns false when given 1", function() {
            expect($.isFunction(1)).toBe(false)
        })
    })

    describe(".isArray", function() {
        it("returns true when given an array", function() {
            expect($.isArray([])).toBe(true)
        })

        it("returns false when given an object", function() {
            expect($.isArray({})).toBe(false)
        })
    })

    describe(".isObject", function() {
        it("returns true when given an object", function() {
            expect($.isObject({})).toBe(true)
        })

        it("returns true when given an array", function() {
            expect($.isObject([])).toBe(true)
        })

        it("returns true when given a function", function() {
            expect($.isObject(function(){})).toBe(true)
        })

        it("returns false when given a string", function() {
            expect($.isObject("abc")).toBe(false)
        })
    })

    describe(".isNumber", function() {
        it("returns true when given a positive integer", function() {
            expect($.isNumber(1)).toBe(true)
        })

        it("returns true when given a positive float", function() {
            expect($.isNumber(2.4)).toBe(true)
        })

        it("returns true when given a negative integer", function() {
            expect($.isNumber(-10)).toBe(true)
        })

        it("returns true when given a negative float", function() {
            expect($.isNumber(-3.4)).toBe(true)
        })

        it("returns false when given NaN", function() {
            expect($.isNumber(0/0)).toBe(false)
        })

        it("returns true when given +Infinity", function() {
            expect($.isNumber(1/0)).toBe(true)
        })

        it("returns true when given -Infinity", function() {
            expect($.isNumber(-1/0)).toBe(true)
        })

        it("returns false when given a numeric string", function() {
            expect($.isNumber("12")).toBe(false)
        })
    })

    describe(".toNumericString", function() {
        it("returns '12' when given (12)", function() {
            expect($.toNumericString(12)).toBe('12')
        })

        it("returns '-1.5' when given (-1.5)", function() {
            expect($.toNumericString(-1.5)).toBe('-1.5')
        })

        it("returns '0' when given null", function() {
            expect($.toNumericString(null)).toBe('0')
        })

        it("returns '0' when given (undefined)", function() {
            expect($.toNumericString(undefined)).toBe('0')
        })

        it("returns '0' when given (false)", function() {
            expect($.toNumericString(false)).toBe('0')
        })

        it("returns '1' when given (true)", function() {
            expect($.toNumericString(true)).toBe('1')
        })

        it("normalizes numeric strings", function() {
            expect($.toNumericString('-14.5')).toBe('-14.5')
        })
    })

    describe(".toCss", function() {
        it("returns CSS-formatted attr/value pairs when given an object", function() {
            expect($.toCss(
                {one: 1, two: 2}
            )).toBe("one:1;two:2;")
        })
    })

    describe(".htmlEscape", function() {
        it("escapes angle brackets, ampersands, and quotes", function() {
            expect($.htmlEscape(
                '<br>&amp;"hi"'
            )).toBe("&lt;br&gt;&amp;amp;&quot;hi&quot;")
        })
    })

    describe(".htmlUnescape", function() {
        it("unescapes angle brackets, ampersands, and quotes", function() {
            expect($.htmlUnescape(
                "&lt;br&gt;&amp;amp;&quot;hi&quot;"
            )).toBe('<br>&amp;"hi"')
        })
    })

    describe(".cut", function() {
        it("returns two empty arrays given an empty array", function() {
            expect($.cut([])).toEqual([[], []])
        })

        it("returns two arrays of lengths 2 and 3 given an array of length 5", function() {
            expect($.cut([1,2,3,4,5])).toEqual([[1,2], [3,4,5]])
        })

        it("returns two arrays of length 2 given an array of length 4", function() {
            expect($.cut([1,2,3,4])).toEqual([[1,2], [3,4]])
        })
    })

    describe(".remove", function() {
        it("returns the array with all occurrences of the item removed", function() {
            var a = [1, 2, 3, 2, 5]
            expect($.remove(2, a)).toEqual([1, 3, 5])
        })

        it("destructively modifies the array", function() {
            var a = [1, 2, 3, 2, 5]
            $.remove(2, a)
            expect(a).toEqual([1, 3, 5])
        })
    })

    describe(".replace", function() {
        it("destructively replaces the contents of an array", function() {
            var old = [1, 2, 3, 2, 5]
            var neu = [0, 1, 0]
            $.replace(old, neu)
            expect(old).toEqual([0, 1, 0])
        })

        it("returns the modified array", function() {
            var old = [1, 2, 3, 2, 5]
            var neu = [0, 1, 0]
            expect($.replace(old, neu)).toEqual([0, 1, 0])
        })
    })

    describe(".sum", function() {
        it("sums numbers in the array", function() {
            var a = [1, 2, 3, 4, -1]
            expect($.sum(a)).toBe(9)
        })
    })

    describe(".firstOf", function() {
        it("returns the first element of the array", function() {
            expect($.firstOf(['first', 'middle', 'last'])).toBe('first')
        })

        it("returns undefined when given an empty array", function() {
            expect($.firstOf([])).toBe(undefined)
        })
    })

    describe(".lastOf", function() {
        it("returns the last element of the array", function() {
            expect($.lastOf(['first', 'middle', 'last'])).toBe('last')
        })

        it("returns undefined when given an empty array", function() {
            expect($.lastOf([])).toBe(undefined)
        })
    })

    describe(".copy", function() {
        it("copies arrays", function() {
            var a1 = [1,2,3]
            var a2 = $.copy(a1)
            a2.push(4)
            expect(a2).toEqual([1,2,3,4])
            expect(a2).not.toEqual(a1)
        })

        it("copies objects", function() {
            var o1 = {baz: 'quux'}
            var o2 = $.copy(o1)
            o2.foo = 'bar'
            expect(o2).toEqual({foo: 'bar', baz: 'quux'})
            expect(o2).not.toEqual(o1)
        })
    })

    describe(".merge", function() {
        it("merges the properties of two objects", function() {
            expect(
                $.merge({a: 1}, {b: 2})
            ).toEqual({a: 1, b: 2})
        })

        it("prefers values from the second object to those from the first", function() {
            expect(
                $.merge({a: 1}, {a: 2})
            ).toEqual({a: 2})
        })

        it("destructively modifies the first object", function() {
            var a = {a: 1}
            $.merge(a, {b: 2})
            expect(a).toEqual({a: 1, b: 2})
        })
    })

    describe(".merged", function() {
        it("merges the properties of two objects", function() {
            expect(
                $.merged({a: 1}, {b: 2})
            ).toEqual({a: 1, b: 2})
        })

        it("prefers values from the second object to those from the first", function() {
            expect(
                $.merged({a: 1}, {a: 2})
            ).toEqual({a: 2})
        })

        it("does not destructively modify either object", function() {
            var a = {a: 1}
            var b = {b: 2}
            $.merged(a, b)
            expect(a).toEqual({a: 1})
            expect(b).toEqual({b: 2})
        })
    })

    describe(".call", function() {
        it("calls the given function with the given arguments", function() {
            expect($.call(
                function(x, y) { return x + y },
                [1,2]
            )).toBe(3)
        })

        it("uses the third argument as the value of `this`", function() {
            expect($.call(
                function() { return this.a },
                [],
                {a: 1}
            )).toBe(1)
        })

        it("returns undefined if the first argument is not a function", function() {
            expect($.call(
                'foo'
            )).toBe(undefined)
        })

        it("calls the function with no arguments if no arguments array is given", function() {
            expect($.call(
                function() { return 4 }
            )).toBe(4)
        })
    })

    describe(".addProperties", function() {
        it("adds the properties to the object, initializing their values", function() {
            var obj = {}
            $.addProperties(obj, {foo: null, bar: 5})
            expect(obj.foo).toBe(null)
            expect(obj.bar).toBe(5)
        })

        it("makes properties writable by default", function() {
            var obj = {}
            $.addProperties(obj, {foo: null, bar: 5})
            obj.foo = 1
            obj.bar = 2
            expect(obj.foo).toBe(1)
            expect(obj.bar).toBe(2)
        })

        describe("with {writable: false}", function() {
            it("makes attempts to write to the property fail with an error (in strict mode)", function() {
                var obj = {}
                $.addProperties(obj, {name: 'Uireb'}, {writable: false})
                expect(obj.name).toBe('Uireb')

                var caught = false
                try {
                    obj.name = 'Daffy Duck'
                } catch(e) {
                    caught = true
                }

                expect(caught).toBe(true)
                expect(obj.name).toBe('Uireb')
            })
        })
    })

    describe(".aliasProperties", function() {
        beforeEach(function() {
            this.obj = {color: 'red'}
            $.aliasProperties(this.obj, {colour: 'color'})
        })

        it("makes accessing the alias the same as accessing the property", function() {
            expect(this.obj.color).toBe('red')
            expect(this.obj.colour).toBe('red')
            this.obj.color = 'blue'
            expect(this.obj.colour).toBe('blue')
        })

        it("makes setting the alias the same as setting the property", function() {
            this.obj.colour = 'blue'
            expect(this.obj.color).toBe('blue')
            expect(this.obj.colour).toBe('blue')
        })
    })

    describe(".aliasProperties on a non-writable property", function() {
        beforeEach(function() {
            this.obj = {}
            $.addProperties(this.obj, {color: 'red'}, {writable: false})
            $.aliasProperties(this.obj, {colour: 'color'})
        })

        it("makes accessing the alias the same as accessing the property", function() {
            expect(this.obj.color).toBe('red')
            expect(this.obj.colour).toBe('red')
        })

        it("makes the alias non-writable", function() {
            var caught = false
            try {
                this.obj.colour = 'blue'
            } catch(e) {
                caught = true
            }
            expect(caught).toBe(true)
            expect(this.obj.color).toBe('red')
            expect(this.obj.colour).toBe('red')
        })
    })

    describe(".swear", function() {
        it("promises to do a thing once resolve() is called", function() {
            var done = false
            var doAThing = function() { done = true }
            var oath = $.swear().to(doAThing)
            expect(done).toBe(false)
            oath.resolve()
            expect(done).toBe(true)
        })

        it("does it immediately if resolve() has already been called", function() {
            var done = false
            var doIt = function() { done = true }
            var oath = $.swear()
            oath.resolve()
            expect(done).toBe(false)
            oath.to(doIt)
            expect(done).toBe(true)
        })

        it("queues multiple promises and resolves them in order", function() {
            var done = []
            var doOne = function() { done.push(1) }
            var doTwo = function() { done.push(2) }
            var oath = $.swear().to(doOne).and(doTwo)
            expect(done).toEqual([])
            oath.resolve()
            expect(done).toEqual([1,2])
        })

        it("calls queued callbacks at most once if resolve() is called multiple times", function() {
            var done = []
            var doOne = function() { done.push(1) }
            var oath = $.swear().to(doOne)
            expect(done).toEqual([])
            oath.resolve()
            oath.resolve()
            expect(done).toEqual([1])
        })
    })
})