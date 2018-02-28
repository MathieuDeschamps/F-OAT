import { Meteor } from 'meteor/meteor';
import {Projects } from "../lib/collections/Project.js";
const fs = require('fs');
export const xmlPath = "/tmp/";

Meteor.startup(() => {
  // code to run on server at startup
});



Meteor.methods({

  "userNameExist" :function(_userName){

    result =  Meteor.users.findOne({username: _userName});
    if(result){
      return result.username;
    }
    return false;

  },

  /**
    send the string wich represent the xml file name
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
