import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Projects} from '../../../../lib/collections/Project.js';
import {Videos} from '../../../../lib/collections/videos.js';
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
    var _projectFile = $('#selectedFile')[0].files[0];

    var _url = 'error';
    //If we give an URL for the project
    if(!_projectFile){
      _url = _projectUrl;
      if(_url!='' && !_downUrl){//we need a download link for the video
        _downUrl = 'error';
      }
    }

    //Else, if we give a file for the project
    else if(!_projectUrl){
      _url = _projectFile.name;
      ext = ['mp4'];
      if(!checkExtension(ext,_url)){
        _url = 'errorExt';
      }
      if(_downUrl!=''){
        _downUrl = 'errorFile'
      }
    }

    var _part = Session.get('participants');
    var ownerId = Meteor.user();
    var project = {
      name: _projectName,
      owner: ownerId.username,
      url: _url,
      downUrl: (_downUrl ? _downUrl : null),
      fileId : null,
      participants:_part
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
        if(_projectFile){

          //Do it firstly to avoid errors with getXML
          Meteor.call('createXMLFile',res,function(error,result){
            if(error){
              toastr.warning(error.reason);
            }
          });

          //Get the data of the file
          const upload = Videos.insert({
            file: _projectFile,
            streams: 'dynamic',
            chunkSize: 'dynamic'
          }, false);

          upload.on('start', function () {
            var idUpload = "upload_"+res;
            Session.set(idUpload,upload.progress);
            var date = moment().calendar();
            var val = "Project "+project.name+" : file "+project.url+" is uploading, wait for upload to be done to play video.";
            Meteor.call('addNotifications',res,date,val, function(errorNotif,resultNotif){
              if(err){
                toastr.warning(errorNotif.reason);
              }
            });
            toastr.success(TAPi18n.__('fileUploading'));
          });

          upload.on('progress',function(progress,fileData){
            var idUpload = "upload_"+res;
            Session.set(idUpload,progress);
          });

          upload.on('end', function (error, fileObj) {
            if (error) {
              toastr.warning('Error during upload: ' + error);
            } else {
              Meteor.call('modifyFileId',res,fileObj._id,function(err1,res1){
                if(err1){
                  toastr.warning(err1.reason);
                }
              });
              //Create a notification if the file has been uploaded
              var date = moment().calendar();
              var val = "Project "+project.name+": file "+project.url+" has been uploaded. You can play the video";
              Meteor.call('addNotifications',res,date,val, function(errorNotif,resultNotif){
                if(err){
                  toastr.warning(errorNotif.reason);
                }
              });
              toastr.success(TAPi18n.__('fileUploaded'));

              if(!eventDDPVideo){
                eventDDPVideo = new EventDDP('videoPlayer',Meteor.connection);
              }
              eventDDPVideo.setClient({
                appId: res,
                _id: Meteor.userId()
              });

              Tracker.autorun(function doWhenVideoPlayerRendered(computation) {
                if(Session.get('videoPlayer') === 1 || Session.get('isOnDashboard')===1) {
                  //Event listened in videoPlayer.js
                  eventDDPVideo.emit('videoPlayer');
                  computation.stop();
                }
              });
            }
          });

          upload.start();

          /*reader = new FileReader();

          //When reading file is done
          reader.onload = function(event){
            var nameV = project.url;
            nameV = nameV.replace('.mp4', '');
            var buffer = reader.result;
            //Call a method from project.js on server side
            Meteor.call('createFile', res, project, buffer, nameV , function(error, result){
              if(error){
                toastr.warning(error.reason);
              }
              else{
                //Create a notification if the file has been uploaded
                var date = moment().calendar();
                var val = "Your file "+project.url+" has been uploaded.";
                Meteor.call('addNotifications',res,date,val, function(errorNotif,resultNotif){
                  if(err){
                    toastr.warning(errorNotif.reason);
                  }
                });
              }
            });
          }
          reader.readAsDataURL(_projectFile); //read the file as base64 dataURL*/
          Router.go("/");
        }
        else{
          Meteor.call('createXMLFile',res,function(error,result){
            if(error){
              toastr.warning(error.reason);
            }
          });
          Router.go("/");
        }
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


// This function is used to check that the file is a video
function checkExtension(verifExt, fileValue){
  var fileExtension = fileValue.substring(fileValue.lastIndexOf(".")+1, fileValue.lenght);
  fileExtension = fileExtension.toLowerCase();
  for (var ext of verifExt){
    if(fileExtension==ext){
      return true;
    }
  }
  return false;
}

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
