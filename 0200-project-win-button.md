---
layout: page
title: "The Win Button"
linktext: "Win Button"
permalink: /workshop/win-button/
categories: ['project']
---

In this workshop, we'll walk through building a very, *very* simple game. The "game" is just a button that says "you win" when you click it. The twist is that the button is in a random location on the screen, and it's hidden until you move your mouse over it. My version looks like [this]({{site.baseurl}}/demo/win-button/).

## Getting started

In the last chapter, we saw how to use the JavaScript console to give the computer commands and ask it questions. In order to write more sophisticated programs, like games, the JavaScript console isn't going to cut it. The console only lets us write one "sentence" (in computing terms, a *statement*) at a time, and we want to assemble sentences into paragraphs and complete stories. The easiest way to do that is to create our own webpage and add JavaScript code to it.

Don't get *too* excited&emdash;the page we create won't be accessible on the web to anyone else, so you won't be able to send your friends a link to it just yet. We're going to create a file on your computer that describes a webpage in code, and tell Chrome to display that file. Here's the step-by-step guide:

1. **Download the project template**<br/>
   Click [this link]({{site.baseurl}}/scrolls-of-the-apprentice-template) to download the project template file. Save it as `win-button.html`. You'll be editing this file to do the project.

2. **Start your editor**<br/>
   If you haven't done so yet, download, install, and launch [Komodo Edit](http://www.activestate.com/komodo-edit/downloads).

3. **Open the template file**<br/>
   Open the template file in Komodo, using the `File > Open > File...` menu.

4. **Make sure the template displays in your browser**<br/>
   Switch back to Chrome, and open the template file using Chrome's `File > Open File...` menu. If you see a white rectangle surrounded by black, you're good to go.

## The code

When you open the template file in Komodo Edit, it will look something like this:

```html
<!DOCTYPE html>
<html><head><title>Template of the Apprentice</title><script type="text/javascript", src="http://benchristel.github.io/scrolls/js/lantern.js"></script><script type="text/javascript">
"use strict"

// Your code goes here.
// Lines beginning with two slashes are *comments*. The computer ignores them,
// but you can use them to leave notes for yourself.

</script></head><body></body></html>
```

Let's get a really simple program in here, just to check that everything's working. Add an `alert` command just below the block of comments, so the file looks like this:

```html
<!DOCTYPE html>
<html><head><title>Template of the Apprentice</title><script type="text/javascript", src="http://benchristel.github.io/scrolls/js/lantern.js"></script><script type="text/javascript">
"use strict"

// Your code goes here.
// Lines beginning with two slashes are *comments*. The computer ignores them,
// but you can use them to leave notes for yourself.

alert("It's aliiiiive!")

</script></head><body></body></html>
```

Refresh the template page in your browser, and a message box should pop up.

First, let's get a button on the screen.

```javascript
var button = Lantern.createButton()
```

Add this to your project template

## Questions

By now, you probably have some questions. Email them to me, so I can write a FAQ.
