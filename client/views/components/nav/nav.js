import { Template } from 'meteor/templating';

import './nav.html';

Template.nav.events({

  'click #logout'(event, instance) {
    Meteor.logout();
    Router.go('/login');
  },

  'click #change_fr'(event,instance){
    TAPi18n.setLanguage("fr");
  },

  'click #change_en'(event,instance){
    TAPi18n.setLanguage("en");
  },
});
