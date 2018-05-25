import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Projects} from '../../../../lib/collections/Project.js';
import './team.html';

var project;
Template.team.onRendered(function(){
  project = Projects.findOne({_id : Router.current().params._id });
  if(!project){
    Router.go('dashboard');//redirect to dashboard if project do not exist
  }
  if(Meteor.user().username != project.owner){
    Router.go('noRight');//current user can't access to this page
  }
  $('select').material_select();
});
Template.team.events({

  /**
  Remove a participants of the team
  */
  'click .delete' (event,instance){
    Meteor.call('removeParticipant',Router.current().params._id,this.username,function(err,res){
      if(err){
        toastr.warning(err.reason);
      }
      else{
        toastr.success(TAPi18n.__("participantRemoved"));
      }
    })
  },

  /**
  Update the right of a participant of the team
  */
  'click .rightChange' (event,instance){
    var $buttonEvent = $(event.target);
    var newRight = $buttonEvent.closest('tr').find('select').val();
    Meteor.call('changeRight',Router.current().params._id,this.username,newRight,(error,result)=>{
      if(error){
        alert(error.reason);
      }else if(result === 2){
        Router.go("/")
        toastr.success(TAPi18n.__('rightChanged'));
      }
      else{
        toastr.success(TAPi18n.__('rightChanged'));
      }
    })
  },

  /**
  Add a coworker to the team
  */
  'click .newCoworker' (event,instance){

    var newCoworker_name = $('.newCoworker_name').val();
    var newCoworker_right = $('select.newCoworkerRight').val();
    if(!newCoworker_name){
      $('#name').addClass("invalid");
    }else{
      $('#name').addClass("valid");
      Meteor.call("userNameExist",newCoworker_name,(err,result)=>{
        if(err){
          alert(err.reason);
        }else if(!result){
          toastr.warning(TAPi18n.__('errorUserNoExists'));
        }else{
          Meteor.call("getParticipants",Router.current().params._id,(err,result)=>{
            if(err){
              return;
            }
            var participants = Object.values(result);
            var present=false;
            participants.forEach(
              (item)=>{
                  if(item.username === newCoworker_name){
                    present = true;
                    return;
                  }
              }
            );
            if(!present && newCoworker_name != project.owner){
              Meteor.call("addParticipant",Router.current().params._id, newCoworker_name, newCoworker_right, function(error,result){
                if(error){
                  toastr.warning(error.reason);
                }
              });
            }else{
              toastr.warning(TAPi18n.__('errorUserAlready', {user :  newCoworker_name}));
            }
          });
        }
      });
    }
  },
});


Template.team.helpers({
  Owner: function(){
    return Projects.findOne(Router.current().params._id).owner;
  },

  Project: function(){
    return Projects.findOne(Router.current().params._id);
  }
});
