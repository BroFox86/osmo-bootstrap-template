"use strict";

/**
 * Display viewport size of the page.
 * @class
 * @param {string[]} styles - Array of styles.
 * @author Daur Gamisonia <daurgam@gmail.com>
 * @version 1.0.6
 * @example
 * var displayViewportSize = new Viewport([
 *   "position: fixed",
 *   "bottom: 0"
 * ]);
*/
function ViewportIndicator( styles ) {
  var cssText = "";
  var indicator;

  (function generateCssText() {
    for ( var i = 0; i < styles.length; i++ ) {
      cssText += styles[i] + ";"
    }
  })();

  (function generateIndicator() {
    indicator = document.createElement("div");

    indicator.id = "viewport";

    indicator.style.cssText = cssText;

    document.body.appendChild( indicator );
  })();

  function display() {
    var userAgent = window.navigator.userAgent;
    var viewportWidth;
    var viewportHeight;

    if ( userAgent.match(/Chrome|Firefox|Opera|Edge|Trident/) ) {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;

    } else if ( userAgent.match(/Safari/) ) {
      // Safari doesn't include scrollbar into viewport size.
      viewportWidth = document.documentElement.clientWidth;
      viewportHeight = document.documentElement.clientHeight;

    } else {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
    }

    indicator.textContent = viewportWidth + "x" + viewportHeight;
  }

  ["DOMContentLoaded", "resize"].forEach(function( item ) {
    window.addEventListener( item, display );
  });
}

var viewport = new ViewportIndicator([
  "position: fixed",
  "z-index: 9999",
  "bottom: 0",
  "left: 1%",
  "background: white",
  "color: blue"
]);