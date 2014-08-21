---
layout: page
title: "Project 1: The Win Button"
linktext: "Project: Win Button"
permalink: /project/win-button/
---

Greetings! In this tutorial, we'll walk through building a very, *very* simple game. The game is literally just a button that says "you win" when you click it. The twist is that the button is in a random location on the screen, and it's hidden until you move your mouse over it. My version looks like [this]({{site.baseurl}}/demo/win-button/).

## Getting started

1. **Download the project template**<br/>
   Click [this link]({{site.baseurl}}/scrolls-of-the-apprentice-template) to download the project template file. Save it as `win-button.html`. You'll be editing this file to do the project.

2. **Start your editor**<br/>
   If you haven't done so yet, download, install, and launch [Komodo Edit](http://www.activestate.com/komodo-edit/downloads).

3. **Open the template file**<br/>
   Open the template file in Komodo, using the `File > Open > File...` menu.

4. **Make sure the template displays in your browser**<br/>
   Open the template file in Chrome, using the `File > Open File...` menu. If you see a white rectangle surrounded by black, you're good to go.

## The code

When you open the template file in Komodo Edit, it will look something like this, though probably with different colors:

```html
<!DOCTYPE html>
<html><head><title>Template of the Apprentice</title><script type="text/javascript", src="http://benchristel.github.io/scrolls/js/lantern.js"></script><script type="text/javascript">
"use strict"

// Your code goes here.
// Lines beginning with two slashes are *comments*. The computer ignores them,
// but you can use them to leave notes for yourself.

</script></head><body></body></html>
```

Let's get a really simple program in here, just to check that everything's working. Change the file so it looks like this:

```html
<!DOCTYPE html>
<html><head><title>Template of the Apprentice</title><script type="text/javascript", src="http://benchristel.github.io/scrolls/js/lantern.js"></script><script type="text/javascript">
"use strict"

alert("It's aliiiiive!")

</script></head><body></body></html>
```

In the example above, I've deleted the three lines of comments and added a JavaScript command, `alert("It's aliiiiive!")`. Refresh the template page in your browser, and a message box should pop up.


First, let's get a button on the screen.

```javascript
var button = Lantern.createButton()
```

Add this to your project template

## Questions

By now, you probably have some questions. Email them to me, so I can write a FAQ.
