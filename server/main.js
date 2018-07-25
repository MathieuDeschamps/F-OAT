import { Meteor } from 'meteor/meteor';
import {Projects } from "../lib/collections/projects.js";
import {HTTP} from "meteor/http";
const fs = require('fs');
export const xmlPath = "/tmp/";

Meteor.startup(() => {
  // code to run on server at startup

  //Event to refresh videoPlayer in videoPlayer.js in route /project, for every users on the project
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

  //Event to refresh videoCtrl for the user. Called by videoPlayer event in videoPlayer.js, listener in project.js.
  eventDDPVideo.addListener('videoCtrl',(client)=>{
    eventDDPVideo.matchEmit("videoCtrl",{
      $and: [
        {_id: client._id},
        {appId: client.appId}
      ]
    });
  });

  //Event to refresh playerCommand for the user. Called by videoPlayer event in videoPlayer.js, listener in playerCommand.js.
  eventDDPVideo.addListener('playerCommand',(client)=>{
    eventDDPVideo.matchEmit("playerCommand",{
      $and: [
        {_id: client._id},
        {appId: client.appId}
      ]
    });
  });

  //Event to warn collaborators of a project on delete of a project. Called on dashboard.js and listener in project.js
  eventDeleteProject = new EventDDP('deleteProject');
  eventDeleteProject.addListener('deleteProject',(client)=>{
    eventDeleteProject.matchEmit("deleteProject",{
      $and: [
        {_id: {$ne : client._id}},
        {appId: client.appId}
      ]
    });
  });


  //Event to refresh data on project page for all users on the page when a new extraction is done. Called in configExtractorManager.js and listener in configAnnotation.js
  eventNewExtraction = new EventDDP('newExtraction');
  eventNewExtraction.addListener('newExtraction',(client,idExtractor,version)=>{
    eventNewExtraction.matchEmit("newExtraction",{$and: [{$or: [{_id: client._id},{_id: {$ne : client._id}}]},{appId: client.appId}]},idExtractor,version);
  });

  //Event to refresh data on project for all users when a modification is done. Called in update of visualizers and listener in configAnnotation
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

  //listener called when a user get on project page and do not have the last version of the project. In configAnnotation.js
  eventLiveUpdate.addListener('getXmls',(client,idUserSet,idUserGet)=>{
    eventLiveUpdate.matchEmit("getXmls",{
      $and: [
        {_id: {$eq : idUserGet}},
        {appId: client.appId}
      ]
    },idUserGet,idUserSet);
  });

  //Event that will give back the new version of the project to the user asking for it with the getXmls event.
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
Check if an user exists or not
**/
  "userNameExist" :function(_userName){

    result =  Meteor.users.findOne({username: _userName});
    if(result){
      return result.username;
    }
    return false;

  },

  /**
    send the string which represent the xml file path
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
