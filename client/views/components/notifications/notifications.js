import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Projects} from '../../../../lib/collections/Project.js';
import './notifications.html';

Template.notifications.onCreated(function(){

  this.subscribe('projects');
  this.subscribe('users')

});

//Function used to render the dropdown button every time notifications changes
renderDropdownButton = function(){
  //Timeout used to wait for html to be loaded
  setTimeout(function(){
    $(".dropdown-button").dropdown({
      belowOrigin: true, // Displays dropdown below the button
      constrainWidth: false,
      closeOnClick: false,
      alignment: 'right'
    });

    if(Meteor.user()){
      $("#lidropdown").css("display", "block");
      console.log(Meteor.user().notifications.length);
      if(Meteor.user().notifications.length>0){
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

Template.notifications.helpers({
  notifications: function(){
    return Meteor.user().notifications;
  },


  thereIsNotifications(){
    renderDropdownButton();
    return Meteor.user().notifications.length>0;
  }

  /*renderDropdownButton(){
    //Timeout used to wait for html to be loaded
    console.log("RENDER IT");
    setTimeout(function(){
      $(".dropdown-button").dropdown({
        belowOrigin: true, // Displays dropdown below the button
        constrainWidth: false,
        closeOnClick: false,
        alignment: 'right'
      });

      if(Meteor.user()){
        $("#lidropdown").css("display", "block");
        console.log(Meteor.user().notifications.length);
        if(Meteor.user().notifications.length>0){
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
  }*/

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
      Meteor.call('removeNotification', Meteor.userId(), dateToRemove, valueToRemove,function(err,res){
        if(err){
          toastr.warning(err.reason);
        }
      });
    }
});
