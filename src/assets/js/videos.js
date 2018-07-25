/*
 * Play/pause videos depending on their position on a screen
 */

function isInVisibleRange(element) {
  "use strict";

  var topOffset    = 200,
      bottomOffset = 200;

  var elementTop     = $(element).offset().top,
      elementBottom  = elementTop + $(element).outerHeight(),
      viewportTop    = $(window).scrollTop(),
      viewportBottom = viewportTop + $(window).height();

  return (
    elementBottom > viewportTop + topOffset &&
    elementTop < viewportBottom - bottomOffset
  );
}

$(window).on("resize scroll", function() {
  $("[data-toggle='video']").each(function() {
    if (isInVisibleRange(this)) {
      $(this).get(0).play();
    } else {
      $(this).get(0).pause();
    }
  });
});
