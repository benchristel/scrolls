Scrolls of the Apprentice
=========================

[_Scrolls of the Apprentice_](benchristel.github.io/scrolls) aims to teach wizardly computer programming to complete beginners. It's currently hosted at [benchristel.github.io/scrolls](benchristel.github.io/scrolls).

Lantern
=======

Lantern is the JavaScript UI and utility library used in the SotA demos and projects. It provides a framework for:
- programmatically creating UI elements like buttons and text fields and reacting to user input.
- doing basic manipulation of arrays and objects, including iteration and shallow-copying
- creating objects with modular inheritance and private methods

Lantern is a special-purpose tool, not a silver bullet. There are some things that, by design, it does not do.

- It's very sloppy in its interactions with the DOM, relying on absolute positioning for layout. This is because SotA neither assumes nor furnishes knowledge of HTML.
- It is not optimized for performance. Lantern takes a purely functional-programming, non-OO approach to JS; it does not use `this` or add methods to object prototypes. As a result, Lantern objects have a larger memory footprint than objects created from prototypes. SotA purposely does not cover `this`, prototypes, or `new`, because of the pitfalls they present to students. The Lantern source is distributed unminified, with comments intact, in the hope that enterprising students might dissect the Lantern source and find something useful there.
- It is not compatible with many older browsers, including IE8, Firefox < 4.5, and Chrome < 19, and it never will be. Its API depends on features of ECMAScript5 that those browsers simply don't implement.
- It is not production-ready for "real" web applications, for all the reasons above. It's a toy framework, built around an idealized dialect of JavaScript, and intended only for use by students.

Modular Inheritance Philosophy
------------------------------

Lantern uses something which I'm calling modular inheritance because I haven't seen it anywhere else and don't know a better name for it. The closest analogy I can draw to another language is Ruby's mixin pattern. Modular inheritance builds objects by combining modules—small, often independent pieces of functionality. It bears some resemblance to classical inheritance in that the order in which modules are included is important; modules can override existing methods and call the original implementation, similar to the way `super` works in Ruby. Modular inheritance differs from Ruby's mixins in that modules can be instantiated. Because methods defined in a module enclose local variables in the module definition, there are three possible levels of member visibility: public, object-private, and module-private. Public members form the object's interface. Object-private members are not accessible from outside the object but can be accessed from inside other modules. Module-private members can only be accessed within the module that defines them.

```javascript
var makeMemoizedMethods = Lantern.createModule(function(pub, priv) {
  var memos = {}

  priv.defineMemoizedMethod = function(name, method) {
    pub[name] = function() { return memos[name] = memos[name] || method() }
  }

  pub.clearMemos = function() {
    memos = {}
  }
})

var myObject = makeMemoizedMethods()

myObject.mod(function(pub, priv) {
  priv.defineMemoizedMethod('meaningOfLife', function() {
    return /* some expensive calculation */
  })
})
```

If you're wondering where `myObject.extend` comes from, it's a bit of magic that gets added to any object that's been created from a module.

API Reference
-------------

