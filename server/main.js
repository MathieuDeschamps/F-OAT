import { Meteor } from 'meteor/meteor';
import {Projects } from "../lib/collections/projects.js";
import {HTTP} from "meteor/http";
const fs = require('fs');
export const xmlPath = "/tmp/";

Meteor.startup(() => {
  // code to run on server at startup

  //Event to refresh editor & timeline in project.js
  em = new EventDDP('test');
  em.addListener('hello',(client)=>{
    em.matchEmit("hello",{
      $and: [
        {_id: {$ne : client._id}},
        {appId: client.appId}
      ]
    });
  });

  //Event to refresh videoPlayer in videoPlayer.js in route /project
  eventDDPVideo = new EventDDP('videoPlayer');
  eventDDPVideo.addListener('videoPlayer',(client)=>{
    eventDDPVideo.matchEmit("videoPlayer",{
      $and: [
        {$or: [
          {_id: client._id},
          {_id: {$ne : client._id}}
        ]},
        {appId: client.appId}
      ]
    });
  });

  eventDDPVideo.addListener('videoCtrl',(client)=>{
    eventDDPVideo.matchEmit("videoCtrl",{
      $and: [
        {_id: client._id},
        {appId: client.appId}
      ]
    });
  });

  eventDDPVideo.addListener('playerCommand',(client)=>{
    eventDDPVideo.matchEmit("playerCommand",{
      $and: [
        {_id: client._id},
        {appId: client.appId}
      ]
    });
  });

  //Event to warn collaborators of a project on delete of a project
  eventDeleteProject = new EventDDP('deleteProject');
  eventDeleteProject.addListener('deleteProject',(client)=>{
    eventDeleteProject.matchEmit("deleteProject",{
      $and: [
        {_id: {$ne : client._id}},
        {appId: client.appId}
      ]
    });
  });

  eventNewExtraction = new EventDDP('newExtraction');
  eventNewExtraction.addListener('newExtraction',(client,idExtractor,version)=>{
    eventNewExtraction.matchEmit("newExtraction",{$and: [{$or: [{_id: client._id},{_id: {$ne : client._id}}]},{appId: client.appId}]},idExtractor,version);
  });


  eventLiveUpdate = new EventDDP('liveUpdate');
  eventLiveUpdate.addListener('liveUpdate',(client,idVisualizer,xml)=>{
    eventLiveUpdate.matchEmit('liveUpdate',{
      $and: [
        {$or: [
          {_id: client._id},
          {_id: {$ne : client._id}}
        ]},
        {appId: client.appId}
      ]
    },idVisualizer,xml);
  });

  eventLiveUpdate.addListener('getXmls',(client,idUserSet,idUserGet)=>{
    eventLiveUpdate.matchEmit("getXmls",{
      $and: [
        {_id: {$eq : idUserGet}},
        {appId: client.appId}
      ]
    },idUserGet,idUserSet);
  });

  eventLiveUpdateSet = new EventDDP('setUpdate');

  eventLiveUpdateSet.addListener('setXmls',(client,xmls,idUserSet)=>{
    eventLiveUpdateSet.matchEmit("setXmls",{
      $and: [
        {_id: {$eq : idUserSet}},
        {appId: client.appId}
      ]
    },xmls,idUserSet);
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
