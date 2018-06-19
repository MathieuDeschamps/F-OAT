import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Projects} from '../../../../lib/collections/Project.js';
import './newProject.html';


/*
* On creation of the template, initialize session vars.
* postSubmitErrors : errors in the form
* postUserErrors : errors adding user
* participants : coworkers added in the project
* search/keyword : used in input search of users
*/
Template.newproject.onCreated(function(){
  Session.set('postSubmitErrors',{});
  Session.set('postUserErrors',{});
  Session.set('participants',[]);
  Session.set("search/keyword","");
});


Template.newproject.helpers({
  errorMessage: function(field){
    return Session.get('postSubmitErrors')[field];
  },
  errorClass: function(field){
    return !!Session.get('postSubmitErrors')[field] ? 'has-error' : '';
  },
  errorUserMessage: function(field){
    return Session.get('postUserErrors')[field];
  },
  errorUserClass:function(field){
    return !!Session.get('postUserErrors')[field] ? 'has-error' : '';
  },

  users(){
    var keyword = Session.get("search/keyword");
    if(keyword!=null && keyword!=""){
      var regexp = new RegExp("^"+Session.get('search/keyword'),"i");
      var owner = Meteor.userId();
      var users = Meteor.users.find({ $and : [{username: regexp},{_id: {$ne:owner}}]});
      return users;
    }
  },

  coworkers: function(){
    return Session.get('participants');
  }
});

Template.newproject.events({
  // On validation of form
  'click #newProjectForm' (event,instance){
    event.preventDefault();
    var _projectName = $('.projectName').val();
    var _projectUrl = $('.url').val();
    var _downUrl = $('.downUrl').val();

    var _url = 'error';
    var _isFile = false;
    //If we give an URL for the project
    if(_projectUrl!=''){
      _url = _projectUrl;
      _isFile = false;
      if(_url!='' && _downUrl==''){//we need a download link for the video
        _downUrl = 'error';
      }
    }

    //Else, if we give a file for the project
    else if($('#radioButtonFile').is(':checked')){
      _url = '';
      _isFile = true;
    }

    var _part = Session.get('participants');
    var ownerId = Meteor.user();
    var project = {
      name: _projectName,
      owner: ownerId.username,
      url: _url,
      downUrl: (_downUrl ? _downUrl : null),
      isFile : _isFile,
      fileId : null,
      participants:_part,
      usersOnPage : []
    };

    //We verify the name and the url of the project (not null and not already used)

    var errors = validateProject(project);
    if(errors.name || errors.url || errors.file || errors.downUrl){
      return Session.set('postSubmitErrors',errors);
    }

    Meteor.call('insertProject', project, function(err, res){
      if(err){
        toastr.warning(err.reason);
      }else{
          Meteor.call('createXMLFile',res,function(error,result){
            if(error){
              toastr.warning(error.reason);
            }
          });
          Router.go("/");
      //  }
      }
    });
  },

  //On typing of search input
  'keyup #search': function(event) {
    Session.set('search/keyword', event.target.value);
  },

  //On click of add user button
  'click #addUser' (event,instance){
    event.preventDefault();
    addUser();
  },

  'dblclick .option' (event){
    event.preventDefault();
    addUser();
  },

  'click .remove_circle' (event, instance){
      var elm = event.target;
      var $elm = $(elm);
      var participants = Session.get('participants');
      var index = -1;

      participants.forEach(
        (part)=>{
          if(part.username === $elm.attr('name')){
            index = participants.indexOf(part);
          }
        }
      )
      participants.splice(index,1);

      Session.set('participants',participants);
  },

  'change #radioButtonUrl' (event,instance){
      if($('#radioButtonUrl').is(':checked')){
        $('#urlForm').css('display','block');
      }
  },

  'change #radioButtonFile' (event,instance){
      if($('#radioButtonFile').is(':checked')){
        $('#urlForm').css('display','none');
        $('#url').val('');
        $('#url-down').val('');
      }
  }
});

Template.newproject.onDestroyed(()=>{
  //put wrong values for the event => unsuscribe the user for the channel of this project

  if(eventDDPVideo!=null){
    eventDDPVideo.setClient({
      appId: -1,
      _id: -1
    });
  }
});


function addUser(){
  var _newParticipants = $('#participant').val();
  var errors={};
  if(!_newParticipants){
    errors.participant = TAPi18n.__('errorSelectUser');
    return Session.set('postUserErrors',errors);
  }

  var nbBadUsers = 0;
  var _oldParticipants = Session.get('participants');
  _oldParticipants.forEach(
    (item)=>{
      _newParticipants.forEach(
        (newOne)=>{
          if(item.username === newOne){
            nbBadUsers++;
            errors.participant = TAPi18n.__('errorAddUser', {user :  newOne});
          }
        }
      )

    }
  );
  if(nbBadUsers==0){
    _newParticipants.forEach(
      (newOne)=>{
        _oldParticipants.push({username: newOne, rigth: 'Read'});
      }
    )

    Session.set('participants',_oldParticipants);
  }

  else if(nbBadUsers>1){
    errors.participant = TAPi18n.__('errorAddUsers');
  }

  return Session.set('postUserErrors',errors);
}
