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
      toastr.warning(TAPi18n.__('errorUsernameEmpty'))
    }
    else if(!_psswd){
      toastr.warning(TAPi18n.__('errorPasswordEmpty'))
    }
    else{
      Meteor.loginWithPassword({
        username: _usrname
      }, _psswd, function(err) {

        if (err) {
          toastr.warning(TAPi18n.__('errorLogin'))
        }else{
          Router.go('/');
        }
      });
    }
  }


});
