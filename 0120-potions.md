---
layout: page
title: 'JavaScript Functions'
linktext: Potions Class
permalink: /potions/
categories: []
---

So far, we've been working with one-line commands like these:

```javascript
var myButton = $.createButton()
```

```javascript
myButton.text = "Click me!"
```

These are great for making things happen on the screen right away. But what if we want to do something *when the button gets clicked*, like change the text from `"Click me!"` to `"That tickles!"`? A simple command won't work, because if we say

```javascript
myButton.text = "That tickles!"
```

it will take effect immediately. It would be great if we could write this command and tell the computer to just tuck it away for safekeeping until that button gets clicked. If only we could somehow take this command and _bottle it_, we could&mdash;

# Potions 101

> I can teach you how to bottle fame, brew glory, even put a stopper on death&mdash;if you aren't as big a bunch of dunderheads as I usually have to teach.
>
> &mdash; Professor Snape, via J.K. Rowling

Okay, Snape. We accept that challenge. Let's bottle Fame, shall we?

The only problem is, even I don't know how to write a JavaScript program that makes you famous. So we'll have to take a somewhat looser interpretation of Snape's words. Let's write a program that plays David Bowie's song "Fame" when you click a button.

We can play the song immediately by opening a Youtube video in a new window, like this (you might need to allow popups for this to work):

```javascript
window.open("http://www.youtube.com/watch?v=J-_30HA7rec")
```

To postpone the effect of this command, we need to wrap it in a _function_.

```javascript
var fame = function() {
    window.open("http://www.youtube.com/watch?v=J-_30HA7rec")
}
```

The curly braces `{ }` mark the start and end of the function. They're the bottle that holds our potent brew&mdash;without them, the `alert` command would take effect right away. We want to *bottle* Fame, not spray it all over the room like a deranged monkey. Curly braces are used for several different things in JavaScript, which is why we need the `function` keyword to tell the computer exactly what we're trying to do here.

It's an ancient tradition of code calligraphy to indent the commands inside a function. This makes no difference to how the code works, but it does make it a bit easier to read, especially when a function contains many lines.

Finally, we've got a couple of familiar pieces: `window.open` is just a command, like `alert` or `$.createButton`. `var fame = ` sticks a label on our freshly-brewed function. Now we can do this:

```javascript
fame()
```

and hear Bowie rock out. You can imagine that the parentheses `()` are the open mouth of the potion bottle, pouring Fame into the ears of the populace. If we just said `fame` without the parentheses, nothing would happen.

Now, we need to create a button and tell it to crack open our bottle of Fame when it gets clicked. Here's how we do that:

```javascript
var fameButton = $.createButton()
fameButton.whenClicked(fame)
```

The line `fameButton.whenClicked(fame)` is what tells the button to call the `fame` function when it gets clicked. Note that we didn't put the parentheses after `fame` here&mdash;that's important. If we'd said `fameButton.whenClicked(fame())`, that would invoke the `fame` function and load the Youtube video as soon as this line was executed.

Putting it all together:

```javascript
var fame = function() {
    window.open("http://www.youtube.com/watch?v=J-_30HA7rec")
}

var fameButton = $.createButton()
fameButton.whenClicked(fame)
```

So, you've now got a working David Bowie jukebox, and the word "fame" has stopped looking like a real word. Let's move on to something more adventurous.

## Side Effects

Functions can affect code outside th

```javascript
var health = 77

var heal = function() {
    health = health + 10
}
```

```javascript
var magic8BallButton = $.createButton()

var shake8Ball = function() {
    var message = $.pickRandomly(['yes','no','maybe'])
    return message
}

var displayMessage = function(message) {
    magic8BallButton.text = message
}

var generateAndDisplayMessage = function() {
    var message = shake8Ball()
    displayMessage(message)
}

magic8BallButton.whenClicked(generateAndDisplayMessage)
```
