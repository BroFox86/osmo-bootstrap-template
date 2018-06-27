/*
 * Show the Shop button after DOM is loaded
 */

$(window).on("DOMContentLoaded resize", function() {
  if (window.matchMedia("(max-width: 768px)").matches) {
    setTimeout(function() {
      $(".main-nav-shop").addClass("is-visible");
    }, 500);
  }
});
