import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Projects} from '../../../../lib/collections/projects.js';
import {Writer} from '../../components/class/Writer.js'
import './newProject.html';

//API_KEY : key to request omdbapi

var API_KEY = 'ef18ae37';
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

  //return the list of users of db that matches the search keyword given, without current user
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

Template.newproject.onRendered(function(){
  //Prepare animation of the materialize select
  $('.single-select').material_select();
});

Template.newproject.events({
  // On validation of form
  'click #newProjectForm' (event,instance){
    event.preventDefault();
    var _projectName = $('.projectName').val();
    var _projectUrl = $('.url').val();
    var _downUrl = $('.downUrl').val();
    var _hours = $('#hours').val();
    var _minutes = $('#minutes').val();
    var _seconds = $('#seconds').val();
    var _frameRate = $('#frameRate').val();
    var _duration;

    //Check that the duration given is ok
    if(_hours=='' || _minutes=='' || _seconds=='' || 
        isNaN(_hours) || isNaN(_minutes) || isNaN(_seconds) || 
        _hours < 0 || _minutes > 60 || _minutes < 0 || _seconds < 0 || _seconds > 60)
        {
          _duration = "error";
    }
    else{
      _duration = parseInt(_seconds) + parseInt(_minutes) * 60 + parseInt(_hours) * 3600;
    }

    var filmTitle = $('#filmTitle').val();
    var errorsSearch = {}

    //Verify that the movie title given is good to do the request
    if(filmTitle!=null && filmTitle!=''){
      if($('#filmTitle').attr('name') === 'false'){
        errorsSearch.search = TAPi18n.__('errorSearchInvalid');
        return Session.set('postSearchErrors',errorsSearch);
      }
    }
    Session.set('postSearchErrors',errorsSearch);

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
      usersOnPage : [],
      frameRate : _frameRate,
      duration : _duration
    };

    //We verify all data of the project (not null and not already used) see lib/collections/project.js

    var errors = validateProject(project);
    if(errors.name || errors.url || errors.file || errors.downUrl || errors.frameRate || errors.duration){
      return Session.set('postSubmitErrors',errors);
    }

    Meteor.call('insertProject', project, function(err, res){
      if(err){
        toastr.error(err.reason);
      }else{
          Meteor.call('createXMLFile',res,function(error,result){
            if(error){
              toastr.error(error.reason);
            }
            else{

              //We use odmb api if a movie title is given to put this data in the xml file
              var filmTitle = $('#filmTitle').val();
              if(filmTitle!=null && filmTitle!=''){
                var movie = filmTitle.split(',');
                $.get('https://www.omdbapi.com/?apikey='+API_KEY+'&t='+encodeURI(movie[0])+'&y='+encodeURI(movie[1])+'&r=xml',function(data){
                  var result = $(data).find('root').find('movie');
                  result.removeAttr('poster')
                        .removeAttr('metascore')
                        .removeAttr('imdbRating')
                        .removeAttr('imdbVotes')
                        .removeAttr('imdbID');

                  var xmltostring = Writer.convertDocumentToString(result[0],1);
                  Meteor.call('addDefaultExtractor',res,xmltostring,function(errorAdd,resultAdd){
                    if(errorAdd){
                      toastr.error(errorAdd.reason);
                    }
                    else{
                      Router.go("/");
                    }
                  });
                });
              }
              else{
                Router.go("/");
              }
            }
          });
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

  //on double click of a user in the options given by the search of users
  'dblclick .option' (event){
    event.preventDefault();
    addUser();
  },

  //On click of removing a user that has been added in the list of participants
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
  //put wrong values for the event => unsubscribe the user for the channel of this project

  if(eventDDPVideo!=null){
    eventDDPVideo.setClient({
      appId: -1,
      _id: -1
    });
  }
});

//Fonction which will add the user(s) selected to the list of participants or give errors if a problem occurs
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
