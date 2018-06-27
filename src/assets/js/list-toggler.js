/* ==========================================================================
   Nested list toggler
   ========================================================================== */

(function() {
  
  var toggle = "[data-toggle='nestedList']",
      target = "[data-target='nestedList']";

  function handleNestedList(toggle, target) {
    var $body = $("body"),
        duration = 400;
  
    function click() {
      $(target).css("height", "auto");
      $(toggle).toggleClass("is-expanded");
      $(target).slideToggle(duration);
    }
  
    function mouseenter() {
      $(toggle).addClass("is-expanded");
      $(target).stop().slideDown(duration);
      $(target + " ul").animate({ top: "30px" }, duration);
    }
  
    function mouseleave() {
      $(toggle).removeClass("is-expanded")
      $(target).stop().slideUp(duration);
      $(target + " ul").animate({ top: "0" }, duration);
    }
  
    var height,
        executed = false,
        executedDesktop = false;
  
    $(window).on("DOMContentLoaded resize", function() {
  
      height = $(target).innerHeight;
      $(target).css("height", height);
  
      if (window.matchMedia("(max-width: 768px)").matches && executed == false) {
        $body
          .on("click", toggle, click)
          .off("mouseenter", toggle, mouseenter)
          .off("mouseleave", toggle, mouseleave);
        executed = true;
        executedDesktop = false;
  
      } else if (window.matchMedia("(min-width: 769px)").matches && executedDesktop == false) {
        $body
          .off("click", toggle, click)
          .on("mouseenter", toggle, mouseenter)
          .on("mouseleave", toggle, mouseleave);
        executedDesktop = true;
        executed = false;
      }
    });
  };
})
()



