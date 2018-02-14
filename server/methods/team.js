import {Projects} from '../../lib/collections/Project.js';

/**
methods callable from the client relative to the team of a project
*/
Meteor.methods({

  /*
  Get the participants in a json object
  @_projectId the id of the Project
  */
  getParticipants: (_projectId)=>{
    return Projects.findOne({_id:_projectId}).participants;

  },
  /**
  Remove a participant from  a Project
  @ _projectId the id of the Project
  @ _username the user to remove from the participant list
*/
  removeParticipants: (_projectId,_username)=>{

    console.log(_projectId);
    console.log(_username);
    var project = Projects.findOne(_projectId);
    if(!project){
      throw Error("Invalid project id");
    }else{
      console.log(project),
      Projects.update({_id:_projectId}, {$pull:{participants: {username: _username}}},(err,result)=>{
        if(err){
          throw Error("impossible to update project");
        }else{

        }
      });
    }

  },

  /*
  Change the right of an user for a project

  param _id : the id of the project
  param username : the user to change right
  param newRight : the new right for the user
  */
  changeRight: (_projectId,_username,_newRight)=>{

    var project = Projects.findOne(_projectId);
    if(!project){
      throw Error("Invalid project id");
    }
    if (project.participants.filter(e => e.username === _username).length == 1) {

      if(_newRight === "Owner"){//change owner the previous owner get write right
        var previousOwner = project.owner;

        Projects.update({_id : _projectId, name: project.name }, {$pull:{participants: {username: _username}}},(err,rec,stat)=>{
          if(err){
            throw  (new Meteor.Error(500, 'Failed to update project', err.reason));
          }else{
            Projects.update({_id : _projectId },{$set:{owner: _username}},(err1,rec,stat)=>{
              if(err1){
                throw  (new Meteor.Error(500, 'Failed to update project', err.reason));
              }else{
                Projects.update({_id : _projectId }, {$push:{ participants: {username: previousOwner,right: "Write"}}},(err2,rec,stat)=>{
                  if(err2){
                    throw  (new Meteor.Error(500, 'Failed to update project', err.reason));
                  }
                });
              }
            });
          }
        });
        return 2;
      }else{// basic right change
        Projects.update({_id: _projectId ,"participants.username": _username},{$set: {"participants.$.right":_newRight}});

        return 1;
      }
    }
  }
});
