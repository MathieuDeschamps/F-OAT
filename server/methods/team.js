import {Projects} from '../../lib/collections/projects.js';

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
  Add a participant in a project
  @id : id of the project
  @_username : name of the user to add to the project
  @_right : right of the user in the project
  */
  addParticipant : function(_projectId, _username, _right){
    check(_projectId,String);
    check(_username,String);
    check(_right,String);
    var project = Projects.findOne(_projectId);
    if(!project){
      throw Error("Invalid project id");
    }else{
      return Projects.update({_id : _projectId}, {$push:{ participants: {username: _username,right: _right}}});
    }
  },

  /**
  Remove a participant from  a Project
  @ _projectId the id of the Project
  @ _username the user to remove from the participant list
*/
  removeParticipant: (_projectId,_username)=>{

    check(_projectId,String);
    check(_username,String);
    var project = Projects.findOne(_projectId);
    if(!project){
      throw Error("Invalid project id");
    }else{
      return Projects.update({_id:_projectId}, {$pull:{participants: {username: _username}}});
    }

  },

  /*
  Change the right of an user for a project

  @ _projectId : the id of the project
  @ _username : the user to change right
  @ _newRight : the new right for the user
  */
  changeRight: (_projectId,_username,_newRight)=>{

    var project = Projects.findOne(_projectId);
    if(!project){
      throw Error("Invalid project id");
    }
    if (project.participants.filter(e => e.username === _username).length == 1) {

      if(_newRight === "Owner"){//change owner the previous owner get write right
        var previousOwner = project.owner;

        //Remove the user from the project
        Projects.update({_id : _projectId, name: project.name }, {$pull:{participants: {username: _username}}},(err,rec,stat)=>{
          if(err){
            throw  (new Meteor.Error(500, 'Failed to update project', err.reason));
          }else{
            //Set the user to owner of the project
            Projects.update({_id : _projectId },{$set:{owner: _username}},(err1,rec,stat)=>{
              if(err1){
                throw  (new Meteor.Error(500, 'Failed to update project', err.reason));
              }else{
                //Set the previous owner in participants with write right
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
