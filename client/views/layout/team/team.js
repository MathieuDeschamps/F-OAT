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
    Projects.update({_id : Router.current().params._id }, {$pull:{ participants: {username: this.username}}});
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
          toastr.warning("This user does not exist.");
        }else{
          Meteor.call("getParticipants",Router.current().params._id,(err,result)=>{
            if(err){
              return;
            }
            var participants = Object.values(result);
            var present=false;
            participants.forEach(
              (item)=>{
                  console.log(item.username);
                  if(item.username === newCoworker_name){
                    present = true;
                    return;
                  }
              }
            );
            console.log("present? "+present);
            if(!present && newCoworker_name != project.owner){

              Projects.update({_id : Router.current().params._id }, {$push:{ participants: {username: newCoworker_name,right: newCoworker_right}}});
            }else{
              console.log(project);
              toastr.warning("The user is already in the project");
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
