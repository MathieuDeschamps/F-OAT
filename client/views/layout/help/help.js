Template.help.onRendered(function() {
  var hash = window.location.hash;
  if ($(hash).length) {  // if hash exists on page
    $('html,body').animate({
      scrollTop: $(hash).offset().top
    }, 200);
  }
});
