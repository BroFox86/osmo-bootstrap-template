/* ==========================================================================
   Mobile menu toggler
   ========================================================================== */

   $("[data-toggle='menuToggler']").click(function() {
    $(this).toggleClass("is-expanded");
    $("[data-target='navList']").toggleClass("is-visible");
  });

/* ==========================================================================
   Nested list toggler
   ========================================================================== */

(function() {
  var toggle   = "[data-toggle='gameList']",
      target   = "[data-target='gameList']",
      wrapper  = "[data-translate='gameList']",
      $body    = $("body"),
      duration = 360;

    function click() {
      $(target)
        .css("height", "auto")
        .slideToggle(duration);
    }

    function mouseenter() {
      $(target)
        .css("height", "")
        .stop()
        .slideDown(duration);
      $(wrapper)
        .stop()
        .animate({ top: "0px" }, duration);
    }

    function mouseleave() {
      $(target)
        .stop()
        .slideUp(duration);
      $(wrapper)
        .stop()
        .animate({ top: "0" }, duration);
    }

    var mobile = window.matchMedia("(max-width: 768px)"),
        desktop = window.matchMedia("(min-width: 769px)"),
        isThrottledMobile = false,
        isThrottledDesktop = false;

    $(window).on("DOMContentLoaded resize", function() {
      if (mobile.matches && isThrottledMobile == false) {
        $body
          .on("click", toggle, click)
          .off("mouseenter", toggle, mouseenter)
          .off("mouseleave", toggle, mouseleave);

        isThrottledMobile = true;
        isThrottledDesktop = false;
      }

      if (desktop.matches && isThrottledDesktop == false) {
        $body
          .off("click", toggle, click)
          .on("mouseenter", toggle, mouseenter)
          .on("mouseleave", toggle, mouseleave);

        isThrottledDesktop = true;
        isThrottledMobile = false;
      }

      // Prevent text selection
      $(toggle).on("mousedown", function(e) {
        e.preventDefault();
      });
    });
}) ()