import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Projects} from '../../../../lib/collections/Project.js';
import './notifications.html';

// function which checked if the current has the right write on the proejct
isOnProject = function(){
  var path = Router.current().route.getName();
  return (path==="project")
}

Template.notifications.onCreated(function(){

  this.subscribe('projects');

});

Template.notifications.helpers({
  notifications: function(){
    return Projects.findOne(Router.current().params._id).notifications;
  },

  // used to display or not the notifications button
  isOnProject(){
    return isOnProject()
  },

  thereIsNotifications(){
    return Projects.findOne(Router.current().params._id).notifications.length>0;
  },

  renderDropdownButton(){
    //Timeout used to wait for html to be loaded
    setTimeout(function(){
      $(".dropdown-button").dropdown({
        belowOrigin: true, // Displays dropdown below the button
        constrainWidth: false,
        closeOnClick: false,
        alignment: 'right'
      });

      if(isOnProject()){
        $("#lidropdown").css("display", "block");
        if(Projects.findOne(Router.current().params._id).notifications.length>0){
          $("#icon_notif").html("notifications_active");
        }
        else{
          $("#icon_notif").html("notifications_none");
        }
      }
      else{
        $("#lidropdown").css("display", "none");
      }

    }, 20);
  }

});

Template.notification.onCreated(function(){

  Meteor.subscribe('projects');

});

Template.notification.events({
    //Remove the notification from the notification list.
    'click .markNotification'(event,instance){
      event.preventDefault();
      var elm = event.target;
      var $elm = $(elm);
      var elmToRemove = $elm.attr('name');
      var dateToRemove = elmToRemove.substring(0,elmToRemove.indexOf(','));
      var valueToRemove = elmToRemove.substring(elmToRemove.indexOf(',')+1,elmToRemove.length);
      Projects.update({ _id : Router.current().params._id}, {$pull: {notifications: {$and : [{date: dateToRemove},{value : valueToRemove}]}}});
    }
});
