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
    var _newUsr = {
      username : _name,
      email: _mail,
      password: _password,
      test: "test",
      profile: {
        projects:[],
        extractors:[]
      }

    };

    //User validation is done on server/accounts.js in method Accounts.validateNewUser()
    Accounts.createUser(_newUsr , (err,result)=>{
      if(err){
        throwError(err.reason);
      }else{
        log.info("new user create",_newUsr,_newUsr._Id);
        Router.go("/");
      }
    });
  }

});
