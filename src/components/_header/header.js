$("[data-toggle='menuToggler']").click(function() {
  $(this).toggleClass("is-expanded");
  $("[data-target='navList']").toggleClass("is-visible");
});

$("[data-toggle='slide']").click(function() {
  $(this).addClass("is-expanded");
  $("[data-target='slide']").slideToggle(400);
});
