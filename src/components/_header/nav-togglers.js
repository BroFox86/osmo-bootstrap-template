$("[data-toggle='menuToggler']").click(function() {
  $(this).toggleClass("is-expanded");
  $("[data-target='navList']").toggleClass("is-visible");
});

$("[data-toggle='gameList']").click(function() {
  $(this).toggleClass("is-expanded");
  $("[data-target='gameList']").slideToggle(400);
});
