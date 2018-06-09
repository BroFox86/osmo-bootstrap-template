setVideoAutoplay();

function setVideoAutoplay() {
  "use strict";

  var topOffset    = 200,
      bottomOffset = 200;

  $.fn.isInViewport = function() {
    var elementTop     = $(this).offset().top,
        elementBottom  = elementTop + $(this).outerHeight(),
        viewportTop    = $(window).scrollTop(),
        viewportBottom = viewportTop + $(window).height();

    return (
      elementBottom > viewportTop + topOffset &&
      elementTop < viewportBottom - bottomOffset
    );
  };

  $(window).on("resize scroll", function() {
    $("[data-toggle='autoplay']").each(function() {
      if ($(this).isInViewport()) {
        $(this).get(0).play();
      } else {
        $(this).get(0).pause();
      }
    });
  });
}
