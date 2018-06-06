$("[data-toggle='menuToggler']").click(function() {
  $(this).toggleClass("is-expanded");
  $("[data-target='navList']").toggleClass("is-visible");
});

$("[data-toggle='navListNested']").click(function() {
  $(this).addClass("is-expanded");
  $("[data-target='navListNested']").slideToggle(400);
});
