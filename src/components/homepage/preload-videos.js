/* ==========================================================================
   Preload videos depending on visibility of their section.
   ========================================================================== */

function isInViewport(element) {
  "use strict";

  var elementTop     = $(element).offset().top,
      viewportBottom = $(window).scrollTop() + $(window).height();

  return elementTop < viewportBottom;
}

$(window).on("resize scroll", function() {
  $("[data-toggle='autoplayControl']").each(function() {
    if (isInViewport("section.coding")) {
      $("[data-toggle='autoplayControl']").attr("preload", "preload");
    }
  });
});
