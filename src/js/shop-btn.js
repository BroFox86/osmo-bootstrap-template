/*
 * Show the Shop button after DOM load
 */

"use strict";

$( window ).on( "DOMContentLoaded resize", function() {

  if ( window.matchMedia("(max-width: 768px)").matches ) {

    setTimeout(function() {
      $(".menu .shop-btn").addClass("is-visible");
    }, 500);
  }
});
