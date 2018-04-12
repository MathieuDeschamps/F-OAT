import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './login.html';


Template.login.helpers({

});

Template.login.events({


  'click #submit'(event, instance) {
    var _usrname = $('#name').val();
    var _psswd = $('#password').val();

    if(!_usrname){
      toastr.warning("Username may not be empty")
    }
    else if(!_psswd){
      toastr.warning("Password may not be empty")
    }
    else{
      Meteor.loginWithPassword({
        username: _usrname
      }, _psswd, function(err) {

        if (err) {
          toastr.warning(err.reason)
        }else{
          Router.go('/');
        }
      });
    }
  }


});
