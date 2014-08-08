"use strict"
describe("Lantern UI elements", function() {
    afterEach(function() {
       Lantern.clearScreen()
    })

    describe("A Lantern text display", function() {
        beforeEach(function() {
            this.elem = $.createTextDisplay()
            spyOn(this.elem, 'redraw')
        })

        it("has a settable text property", function() {
            expect(this.elem.text).not.toBe('it worked')
            this.elem.text = 'it worked'
            expect(this.elem.text).toBe('it worked')
        })

        it("calls its redraw method when its properties are changed", function() {
            expect(this.elem.redraw).not.toHaveBeenCalled()
            this.elem.text = 'it worked'
            expect(this.elem.redraw).toHaveBeenCalled()
        })

        it("can have a click handler set", function() {
            var called = false
            this.elem.whenClicked(function() { called = true })
            this.elem.receiveEvent('clicked')
            expect(called).toBe(true)
        })

        it("can have multiple click handlers set", function() {
            var called1 = false, called2 = false
            this.elem.whenClicked(function() { called1 = true })
            this.elem.whenClicked(function() { called2 = true })
            this.elem.receiveEvent('clicked')
            expect(called1).toBe(true)
            expect(called2).toBe(true)
        })

        it("can't have the same click handler registered multiple times", function() {
            var called = 0, cb = function() { called++ }
            this.elem.whenClicked(cb)
            this.elem.whenClicked(cb)
            this.elem.receiveEvent('clicked')
            expect(called).toBe(1)
        })

        it("can have click handlers removed", function() {
            var called1 = 0, called2 = 0,
                inc1 = function() { called1++ },
                inc2 = function() { called2++ }
            this.elem.whenClicked(inc1)
            this.elem.whenClicked(inc2)
            this.elem.receiveEvent('clicked')
            this.elem.whenClicked.doNot(inc1)
            this.elem.receiveEvent('clicked')
            expect(called1).toBe(1)
            expect(called2).toBe(2)
        })

        it("can have click handlers cleared and re-added", function() {
            var called = 0,
                inc = function() { called++ }
            this.elem.whenClicked(inc)
            this.elem.receiveEvent('clicked')
            this.elem.whenClicked.doNothing()
            this.elem.receiveEvent('clicked')
            expect(called).toBe(1)
            this.elem.whenClicked(inc)
            this.elem.receiveEvent('clicked')
            expect(called).toBe(2)
        })
    })

    describe("a.centerHorizontallyOn(b)", function() {
        beforeEach(function() {
            this.a = $.createButton()
            this.a.width = 10

            this.b = $.createButton()
            this.b.left = 50
            this.b.width = 100
        })

        it("center-aligns a on b", function() {
            expect(this.a.left).not.toEqual(95)
            this.a.centerHorizontallyOn(this.b)
            expect(this.a.left).toEqual(95)
        })
    })

    describe("a.centerVerticallyOn(b)", function() {
        beforeEach(function() {
            this.a = $.createButton()
            this.a.height = 10

            this.b = $.createButton()
            this.b.top = 50
            this.b.height = 100
        })

        it("center-aligns a on b", function() {
            expect(this.a.top).not.toEqual(95)
            this.a.centerVerticallyOn(this.b)
            expect(this.a.top).toEqual(95)
        })
    })

    describe("x.putBelow(y, z)", function() {
        it("positions the top edge of x z units below the bottom of y", function() {
            var y = $.createButton()
            y.top = 50
            y.height = 100
            var x = $.createButton()
            x.putBelow(y, 10)
            expect(x.top).toEqual(160)
        })
    })

    describe("x.putBelow(y)", function() {
        it("positions the top edge of x at the bottom of y", function() {
            var y = $.createButton()
            y.top = 50
            y.height = 100
            var x = $.createButton()
            x.putBelow(y)
            expect(x.top).toEqual(150)
        })
    })

    describe("x.putAbove(y, z)", function() {
        it("positions the bottom edge of x z units above the top of y", function() {
            var y = $.createButton()
            y.top = 200
            var x = $.createButton()
            x.height = 100
            x.putAbove(y, 10)
            expect(x.top).toEqual(90)
        })
    })

    describe("x.putAbove(y)", function() {
        it("positions the bottom edge of x at the top of y", function() {
            var y = $.createButton()
            y.top = 200
            var x = $.createButton()
            x.height = 100
            x.putAbove(y)
            expect(x.top).toEqual(100)
        })
    })

    describe("x.putAbove(y)", function() {
        it("positions the bottom edge of x at the top of y", function() {
            var y = $.createButton()
            y.top = 200
            var x = $.createButton()
            x.height = 100
            x.putAbove(y)
            expect(x.top).toEqual(100)
        })
    })
})
