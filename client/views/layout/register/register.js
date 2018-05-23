import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './register.html';


Template.register.events({

  /**
  Creation of a new User in the mongo Collection
  */
  'click #registerForm' (event,instance){

    var ok = true;
    var _name = $('#userName').val();
    var _mail = $('#mail').val();
    var _password = $('#password').val();
    var _lang = TAPi18n.getLanguage();
    var _newUsr = {
      username : _name,
      email: _mail,
      password: _password,
      test: "test",
      profile: {
        projects:[],
        extractors:[],
        lang: _lang
      }

    }

    if(!_password){
      toastr.warning(TAPi18n.__('errorRegisterPassword'));
    }
    else if(!_mail && !_name){
      toastr.warning(TAPi18n.__('errorRegisterUsernameEmail'));
    }
    else{
      //User validation is done on server/accounts.js in method Accounts.validateNewUser()
      Accounts.createUser(_newUsr , (err)=>{
        if(err){
          console.log("ERR",err);
          if(err.error==500){
            toastr.warning(TAPi18n.__(err.reason));
          }
          else{
            if(err.reason==="Email already exists."){
              toastr.warning(TAPi18n.__('errorRegisterEmailExists'));
            }
            else{
              toastr.warning(TAPi18n.__('errorRegisterUsernameExists'));
            }
          }
        }else{
          log.info("new user create",_newUsr,_newUsr._Id);
          Router.go("/");
        }
      });
    }
  }

});
