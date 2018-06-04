$.fn.isInViewport = function() {
  
  var elementTop     = $(this).offset().top,
      elementBottom  = elementTop + $(this).outerHeight(),
      viewportTop    = $(window).scrollTop(),
      viewportBottom = viewportTop + $(window).height();
  
  return elementBottom > (viewportTop + 400) && elementTop < (viewportBottom - 200);
};

$(window).on("resize scroll", function() {
  $(".coding-video").each(function() {
    if ($(this).isInViewport()) {
      $(this).get(0).play();
    } else {
      $(this).get(0).pause();
    }
  })
});