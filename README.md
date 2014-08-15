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

In contrast to classical inheritance (exemplified by Java) and prototypal inheritance (JavaScript), Lantern uses *modular inheritance* to organize application-level types. Under the modular inheritance paradigm, objects are built by *installing* one or more *modules* which define independent or loosely-coupled pieces of functionality. Modules may specify other modules as dependencies. The set of modules that are installed on an object can be thought of as defining the object's type. The object on which modules are installed is referred to as the *target*.

The order in which modules are installed can be significant, because modules may override methods from other modules and call the *`inherited`* (c.f. Java's *`super`*) implementation. Dependencies are guaranteed to be installed before the module that requires them unless there is a dependency cycle. Installation is idempotent. No module may be installed more than once on a given target, so once a module is installed, its place in the inheritance chain is fixed.

Lantern's implementation of modular inheritance allows modules to define members with three levels of visibility: *public*, *shared*, and *private*.
- **Public** properties can be accessed from any code with a reference to the object.
- **Shared** properties can only be accessed from modules installed on the object.
- **Private** variables (declared with `var`) can only be accessed within the module that defines them.

Method visibility example:

```javascript
var makeAwesome = Lantern.createModule(function(api, shared, inherited) {
  api.doAThing = function() {
    // delegate to the pre-existing implementation
    return inherited.doAThing() + secretSauce()
  }

  shared.doSomethingElse = function() {
    // the `inherited` object holds both public and shared inherited methods
    return inherited.doSomethingElse() + secretSauce()
  }

  // this is a private "method"
  var secretSauce = function() { return " but even more awesome" }
})
```
