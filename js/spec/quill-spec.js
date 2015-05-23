"use strict"

// Quick: Quick user interface construction kit

describe('Quill', function() {
    it('creates clickable buttons', function() {
        var button = Q.createButton()
        var clickCount = 0

        button.whenClicked(function(click) {
            clickCount = clickCount + 1
        })

        document.querySelector(".quill.button").click()

        expect(clickCount).toBe(1)
    })

    it('creates editable text fields', function() {
        var input = Q.createTextInput()

        document.querySelector(".quill.text-input").value = 'horse'
        input.registerInput()

        expect(input.text).toEqual('horse')

        input.text = 'cow'

        expect(document.querySelector(".quill.text-input").value).toEqual('cow')
    })

    //it('creates scrollable frames', function() {
    //    var frame = Q.createFrame()
    //
    //    frame.createButton()
    //    frame.createTextInput()
    //
    //    expect()
    //})
})
