"use strict";

/*
 * Play main video when page load
 */
$( window ).on("load", function() {
  $("[data-toggle='mainVideo']").get( 0 ).play();
});

/*
 * Play/pause videos depending on their position on a screen
 */
function isInSpecifiedArea( elem ) {
  var elem = $( elem ),
    elemTop = elem.offset().top,
    elemBottom = elemTop + elem.outerHeight(),
    viewportTop = $( window ).scrollTop(),
    viewportBottom = viewportTop + $( window ).height(),
    offset = 200;

  return viewportBottom > elemTop + offset && viewportTop < elemBottom - offset
}

$( window ).on("resize scroll", function() {

  $("[data-toggle='video']").each(function() {

    if ( isInSpecifiedArea( this ) ) {

      $( this ).get( 0 ).play();

    } else {

      $( this ).get( 0 ).pause();
    }
  });
});
