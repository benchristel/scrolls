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

    describe(".createArray", function() {
        it("has an __id__ property", function() {
            expect($.createArray().__id__).not.toEqual(undefined)
        })

        describe("given no arguments", function() {
            it("returns an empty array", function() {
                var subject = $.createArray()
                expect(subject instanceof Array).toBe(true)
                expect(subject.length).toBe(0)
            })
        })

        describe("given arguments", function() {
            it("returns an array of the arguments", function() {
                expect($.createArray(34, 'lamb', 'chops')).toEqual([34, 'lamb', 'chops'])
            })
        })
    })

    describe(".createStatBlock", function() {
        it("has an __id__ property", function() {
            expect($.createStatBlock().__id__).not.toEqual(undefined)
        })

        describe("given no arguments", function() {
            it("returns an empty object", function() {
                expect($.createStatBlock()).toEqual({})
            })
        })

        describe("given arguments", function() {
            it("returns an object with the arguments as keys", function() {
                expect($.createStatBlock('str', 'dex', 'con', 'int', 'wis', 'cha')).toEqual({str: null, dex: null, con: null, int: null, wis: null, cha: null})
            })
        })
    })

    describe(".createSet", function() {
        var set, item

        beforeEach(function() {
            set = $.createSet()
            item = $.createStatBlock()
        })

        describe("given no arguments", function() {
            it("returns a set with size = 0", function() {
                expect($.createSet().size).toEqual(0)
            })
        })

        describe("given 5 arguments", function() {
            it("returns a set with size = 5", function() {
                set = $.createSet('hello', 3, null, item, true)
                expect(set.size).toEqual(5)
            })

            it("returns a set containing each of the arguments", function() {
                set = $.createSet('hello', 3, null, item, true)
                expect(set.contains('hello')).toEqual(true)
                expect(set.contains(3)).toEqual(true)
                expect(set.contains('3')).toEqual(false)
                expect(set.contains(null)).toEqual(true)
                expect(set.contains(item)).toEqual(true)
                expect(set.contains(true)).toEqual(true)
            })
        })

        it('has a size property that cannot be changed by meddling metalhands', function() {
            expect(set.size).toEqual(0)
            set.size = 1
            expect(set.size).toEqual(0)
        })

        describe("adding a stat block to the set", function() {
            it('increases the size of the set by 1', function() {
                expect(set.size).toEqual(0)
                set.add($.createStatBlock())
                expect(set.size).toEqual(1)
            })

            describe("when the set already contains it", function() {
                it("does not change the count", function() {
                    set.add(item)
                    set.add(item)
                    expect(set.size).toEqual(1)
                })

                it("does not add duplicate items to the set", function() {
                    var yielded = []
                    var indices = []

                    set.add(item)
                    set.add(item)

                    set.forEach(function(it, i) { yielded.push(it); indices.push(i) })
                    expect(yielded).toEqual([item])
                    expect(indices).toEqual([0])
                })
            })

            it('makes the set contain the item', function() {
                expect(set.contains(item)).toBe(false)
                set.add(item)
                expect(set.contains(item)).toBe(true)
            })

            it('makes iterating over the set yield the item', function() {
                var yielded = [], indices = []
                set.forEach(function(it) { yielded.push(it) })
                expect(yielded).toEqual([])

                set.add(item)

                set.forEach(function(it, i) { yielded.push(it); indices.push(i) })
                expect(yielded).toEqual([item])
                expect(indices).toEqual([0])
            })
        })

        describe("removing a stat block from the set", function() {
            it("decreases the count by 1", function() {
                set.add(item)
                expect(set.size).toEqual(1)
                set.remove(item)
                expect(set.size).toEqual(0)
            })

            it("returns the item if the set contained it", function() {
                set.add(item)
                expect(set.remove(item)).toBe(item)
            })

            it('returns undefined if the set did not contain the item', function() {
                expect(set.remove(item)).toBe(undefined)
            })
        })

        describe("adding a thing with no __id__ property to the set", function() {
            var number = 0, string = "hello"
            beforeEach(function() {
                item = number
            })

            it('increases the size of the set by 1', function() {
                expect(set.size).toEqual(0)
                set.add($.createStatBlock())
                expect(set.size).toEqual(1)
            })

            describe("when the set already contains it", function() {
                it("does not change the count", function() {
                    set.add(item)
                    set.add(item)
                    expect(set.size).toEqual(1)
                })

                it("does not add duplicate items to the set", function() {
                    var yielded = []
                    var indices = []

                    set.add(item)
                    set.add(item)

                    set.forEach(function(it, i) { yielded.push(it); indices.push(i) })
                    expect(yielded).toEqual([item])
                    expect(indices).toEqual([0])
                })
            })

            it('makes the set contain the item', function() {
                expect(set.contains(item)).toBe(false)
                set.add(item)
                expect(set.contains(item)).toBe(true)
            })

            it('makes iterating over the set yield the item', function() {
                var yielded = [], indices = []
                set.forEach(function(it) { yielded.push(it) })
                expect(yielded).toEqual([])

                set.add(item)

                set.forEach(function(it, i) { yielded.push(it); indices.push(i) })
                expect(yielded).toEqual([item])
                expect(indices).toEqual([0])
            })
        })

        describe("removing a thing with no __id__ from the set", function() {
            it("decreases the count by 1", function() {
                set.add(0)
                expect(set.size).toEqual(1)
                set.remove(0)
                expect(set.size).toEqual(0)
            })

            it("returns the item if the set contained it", function() {
                set.add(false)
                expect(set.remove(false)).toBe(false)
            })

            it('returns undefined if the set did not contain the item', function() {
                expect(set.remove("not there")).toBe(undefined)
            })
        })
    })
})
