"use strict"

var Q = {}

;(function() {
    var appendElement = function(parent, tag, className) {
        var element = document.createElement(tag)
        element.className = className
        element.style.position = 'absolute'
        parent.appendChild(element)
        return element
    }

    var property = function(object, name, setter) {
        var value

        Object.defineProperty(object, name, {
            enumerable: true,
            configurable: false,
            get: function() {
                return value
            },
            set: function(newValue) {
                var oldValue = value
                value = newValue
                setter(newValue, oldValue)
            }
        })
    }

    Q.createButton = function() {
        var element = appendElement(document.body, 'div', 'quill button')

        var button = {}

        button.whenClicked = function(handler) {
            element.onclick = handler
        }
        return button
    }

    Q.createTextInput = function() {
        var element = appendElement(document.body, 'input', 'quill text-input')

        var input = {}
        var props = {}

        property(input, 'text', function(value) {
            props.text = value
            if (element.value !== props.text) {
                element.value = props.text
            }
        })

        input.registerInput = function() {
            input.text = element.value
        }

        element.addEventListener('input', input.registerInput)

        return input
    }
})()


Object.freeze(Q);
