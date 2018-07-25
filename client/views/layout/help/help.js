//If a # is given in the url then get on this part of the page
Template.help.onRendered(function() {
  var hash = window.location.hash;
  if ($(hash).length) {  // if hash exists on page
    $('html,body').animate({
      scrollTop: $(hash).offset().top
    }, 200);
  }
});
