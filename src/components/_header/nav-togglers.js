$("[data-toggle='menuToggler']").click(function() {
  $(this).toggleClass("is-expanded");
  $("[data-target='navList']").toggleClass("is-visible");
});

$("[data-toggle='nestedList']").click(function() {
  $(this).toggleClass("is-expanded");
  $("[data-target='nestedList']").slideToggle(400);
});
