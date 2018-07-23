/*
 * Show the Shop button after DOM is loaded
 */

$(window).on("DOMContentLoaded resize", function() {
  if (window.matchMedia("(max-width: 768px)").matches) {
    setTimeout(function() {
      $(".menu-shop").addClass("is-visible");
    }, 500);
  }
});
