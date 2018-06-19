import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Projects} from '../../../../lib/collections/Project.js';
import './dashboard.html';
import {Requests} from '../../../utils/requests.js'

eventDeleteProject = null;

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
      if(!eventDeleteProject){
        eventDeleteProject = new EventDDP('deleteProject',Meteor.connection);
      }
      eventDeleteProject.setClient({
        appId: $elm.attr('name'),
        _id: Meteor.userId()
      });

      //Event listener in project.js
      eventDeleteProject.emit('deleteProject');

      Meteor.call('removeProject',$elm.attr('name'),function(err,res){
        if(err){
          toastr.warning(err.reason);
        }
        else{
          toastr.success(TAPi18n.__('project_removed'));
        }
      });
  },
  'click .exit' (event, instance){
    Meteor.call('removeParticipant',event.target.getAttribute('name'),Meteor.user().username,function(err,res){
      if(err){
        toastr.warning(err.reason);
      }
      else{
        toastr.success(TAPi18n.__('project_leaved'));
      }
    });

  },
})
