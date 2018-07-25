//Startup is used to set the language of a logged user before rendering anything
if (Meteor.isClient) {
  Meteor.startup(() => {
    Tracker.autorun(() => {
      if(Meteor.user()){
        var lang = Meteor.user().profile.lang;
        TAPi18n.setLanguage(lang);
      }
      else{
        TAPi18n.setLanguage('en');
      }
    });
  });
}
