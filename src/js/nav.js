/* ==========================================================================
   Menu toggle
   ========================================================================== */

  $("[data-toggle='nav']").click(function() {

    $( this ).toggleClass("is-expanded");

    $("[data-target='nav']").toggleClass("is-visible");
  });

/* ==========================================================================
   Game list
   ========================================================================== */

(function() {
  var $body = $("body"),
    toggle = "[data-toggle='gameList']",
    target = "[data-target='gameList']",
    inner = "[data-inner='gameList']",
    duration = 300,
    isDesktop,
    isMobile;

  function click() {
    $( target ).css( "height", "auto" ).slideToggle( duration );
  };

  function mouseenter() {
    $( target )
      .css("height", "")
      .stop()
      .slideDown( duration );

    $( inner )
      .addClass("is-visible");
  };

  function mouseleave() {
    $( target )
      .stop()
      .slideUp( duration );

    $( inner )
      .removeClass("is-visible");
  };

  function toggleListener() {
    var pageWidth = document.documentElement.clientWidth,
      desktopWidth = 768;

    if ( pageWidth < desktopWidth && !isMobile ) {

      $body
        .on( "click", toggle, click )
        .off( "mouseenter", toggle, mouseenter )
        .off( "mouseleave", toggle, mouseleave );

      isMobile = true;

      isDesktop = false;
    };

    if ( pageWidth >= desktopWidth && !isDesktop ) {

      $body
        .off( "click", toggle, click )
        .on( "mouseenter", toggle, mouseenter )
        .on( "mouseleave", toggle, mouseleave );

      isMobile = false;

      isDesktop = true;
    };
  };

  $( window ).on( "DOMContentLoaded resize", toggleListener );

  // Prevent text selection
  $( toggle ).on("mousedown", function( event ) {
    event.preventDefault();
  });
})();