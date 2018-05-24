import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Projects} from '../../../../lib/collections/Project.js';
import './dashboard.html';
import {Requests} from '../../../utils/requests.js'

Template.dashboard.helpers({

  //retourne les projets de l'utiliateur courant.
  projects(){
    return Projects.find({ $or: [ { owner: Meteor.user().username }, { "participants.username": Meteor.user().username } ] });
  },
  isOwner(id){
    var project = Projects.findOne(id);
    if(project){
      if(project.owner == Meteor.user().username){
        return true;
      }
    }
    return false;

  }
});

Template.dashboard.events({

  'click .remove' (event, instance){
      var elm = event.target;
      var $elm = $(elm);

    Projects.remove({_id: $elm.attr('name')},(err)=>{
      if(err){
        alert(err);
      }
    })
  },
  'click .exit' (event, instance){
    Meteor.call('removeParticipants',event.target.getAttribute('name'),Meteor.user().username);

  },
})
