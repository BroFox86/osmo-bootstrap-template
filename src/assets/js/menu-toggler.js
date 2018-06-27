/* ==========================================================================
   Mobile menu toggler
   ========================================================================== */

$("[data-toggle='menuToggler']").click(function() {
  $(this).toggleClass("is-expanded");
  $("[data-target='navList']").toggleClass("is-visible");
});
