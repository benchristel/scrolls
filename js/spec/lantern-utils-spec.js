"use strict"

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
})
