(function(){
  "use strict";

  var scrollbar = 15,
      viewportwidth, viewportheight;

  if (typeof window.innerWidth != "undefined") {
    viewportwidth  = window.innerWidth; 
    viewportheight = window.innerHeight;
  }

  $("body").append(
    '<p id="viewport">' + (viewportwidth - scrollbar) + "x" + viewportheight + "</p>"
  );

  $(window).resize(function() {
    if (typeof window.innerWidth != "undefined") {
      viewportwidth  = window.innerWidth;
      viewportheight = window.innerHeight;
    }
    $("#viewport").html( (viewportwidth - scrollbar) + "x" + viewportheight);
  });

  $("#viewport").css({
    position: "fixed",
    bottom: "0",
    left: "1%",
    "z-index": "9999",
    color: "blue"
  });
})()
