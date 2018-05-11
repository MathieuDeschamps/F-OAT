import { Meteor } from 'meteor/meteor';
import {Projects } from "../lib/collections/Project.js";
import {HTTP} from "meteor/http";
const fs = require('fs');
export const xmlPath = "/tmp/";

Meteor.startup(() => {
  // code to run on server at startup

  em = new EventDDP('test');
  em.addListener('hello',(client)=>{
    em.matchEmit("hello",{
        _id: {$ne: client._id},
        appId: client.appId
    });
  });

});


Meteor.methods({

/**
Check if an user exist or not
**/
  "userNameExist" :function(_userName){

    result =  Meteor.users.findOne({username: _userName});
    if(result){
      return result.username;
    }
    return false;

  },

  /**
    send the string wich represent the xml file path
  */
  "getXml": function(name){

    var ret =fs.readFileSync(name,"utf8");
    return {data:ret};


  },

  /**
  *Verify if mail is already used by a user
  **/

  "mailExist" : function(_mail){
    result = Meteor.users.findOne({"emails.0.address": _mail});

    if(result){
      return true;
    }else{
      return false;
    }
  }
});
