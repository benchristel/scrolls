---
layout: page
title: A Backstage Tour of your Web Browser
linktext: The JavaScript Console
permalink: /workshop/javascript-console/
categories: ['project']
---

Every website you visit has code behind it that controls how the site looks and behaves. The Chrome web browser (and most other web browsers) give you tools to tinker with this code.

To get to those tools, click the menu icon to the right of the URL bar and select the `Tools > JavaScript Console` menu. You'll see a panel pop up at the bottom of the browser. This is the JavaScript Console, which lets you converse with the computer (in code, of course). You can ask it questions or give it commands.

For example, if you type in the command below and hit enter, the computer will pop up an alert box on the screen.

```javascript
alert("I prepared explosive runes this morning")
```

Alternatively, you could ask it how many pixels wide the browser window is:

```javascript
window.innerWidth
```

Or what six times nine equals:

```javascript
6 * 9
```

The computer replies to everything you say in this chat-like conversation. If you use `alert`, as in the first example, its response is `undefined`&mdash;this is JavaScript's way of silently doing your bidding. If you ask it a question, it responds with the answer. For example, my computer informs me that `6 * 9` is `42`, and that my `window.innerWidth` is `1440` pixels.

You'll also notice that the computer tries to help you out. If you type `window.inner`, it will suggest the completions `window.innerHeight` and `window.innerWidth`.

## A Number-Guessing Game

<script type="text/javascript">
var secretNumber = null
var guessCount = 0
var startGame = function() {
  console.log("Use these commands to play the game:\nguess(25)\nquit()\nrestart()")
  secretNumber = Math.floor(Math.random() * 100) + 1
  return "I'm thinking of a number between 1 and 100!"
}

var guess = function(number) {
  if (!$.isNumber(number)) {
    return "You need to guess a number. Try this: guess(50)"
  }

  if (!$.isNumber(secretNumber)) {
    return "You haven't started a game yet! Try this: startGame()"
  }

  guessCount = guessCount + 1
  if (number === secretNumber) {
    finalCount = guessCount
    guessCount = 0
    secretNumber = null
    return number + " is right! You got it in " + finalCount + " tries. Use the startGame() command to play again."
  } else if (number > secretNumber) {
    return number + " is too high."
  } else if (number < secretNumber) {
    return number + " is too low."
  }
}

var quit = function() {
  secretNumber = null
  guessCount = 0
  return "Bye!"
}

var restart = startGame
</script>

To demonstrate the power of the JavaScript console, I've added the code for a simple number-guessing game to this particular page. When you start the game, the computer picks a random number between 1 and 100 and lets you guess what the number is. It'll tell you if the guess is too high or too low and let you guess again until you get it right. You can start the game (and get more instructions) with this command:

```javascript
startGame()
```

Interestingly, there's a strategy that will let you win the game in 7 guesses or fewer, every time. I'll let you think for a bit about what it might be. In the next chapter, you'll see how to build your own programs from sequences of JavaScript commands.
