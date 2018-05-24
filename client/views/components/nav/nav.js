import { Template } from 'meteor/templating';

import './nav.html';

Template.nav.events({

  'click #logout'(event, instance) {
    Meteor.logout();
    Router.go('/login');
  },

  'click #change_fr'(event,instance){
    if(Meteor.user()){
      Meteor.users.update(Meteor.userId(), {$set: {"profile.lang": "fr"}});
    }
  },

  'click #change_en'(event,instance){
    if(Meteor.user()){
      Meteor.users.update(Meteor.userId(), {$set: {"profile.lang": "en"}});
    }
  },
});
