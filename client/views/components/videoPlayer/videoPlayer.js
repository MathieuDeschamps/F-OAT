import { Template } from 'meteor/templating';
import {Projects} from '../../../../lib/collections/projects.js';
import {Videos} from '../../../../lib/collections/videos.js';
import {videoControler} from '../videoControler/videoControler.js';
import {seekBarManager} from '../playerCommand/seekBarManager.js';
import  '/public/renderers/vimeo.js';
import './videoPlayer.html';
import './videoPlayer.css';
import { Parser } from '../../components/class/Parser.js'

eventDDPVideo = null;
var vidPlayerListener;

Template.videoPlayer.onCreated(function(){

  Meteor.subscribe('projects');
  Meteor.subscribe('videos');
});

var Player;
Template.videoPlayer.onRendered(function () {
  Session.set('videoPlayer', 0);

  if(!eventDDPVideo){
    eventDDPVideo = new EventDDP('videoPlayer',Meteor.connection);
  }

  if(!vidPlayerListener){
    vidPlayerListener = true;
    //Event emitted in newProject.js
    eventDDPVideo.addListener('videoPlayer',()=>{
      if(Session.get('videoPlayer')===1){
        var idProject = Router.current().params._id
        var project = Projects.findOne(idProject);
        var file;
        if(project.fileId!=null){
          file = Videos.findOne(project.fileId);
        }
        var url;
        if(!file){
          url = project.url;
        }
        else{
          url = file.link();
        }
        Player.setSrc(url);
        Player.load();
        //event listeners in project.js & playerCommand.js
        eventDDPVideo.emit('videoCtrl');
        eventDDPVideo.emit('playerCommand');
      }
    });
  }

  eventDDPVideo.setClient({
    appId: Router.current().params._id,
    _id: Meteor.userId()
  });

  var idProject = Router.current().params._id
  var project = Projects.findOne(idProject);
  var file;
  if(project.fileId!=null){
    file = Videos.findOne(project.fileId);
  }
  var url;
  if(!file){
    url = project.url;
  }
  else{
    url = file.link();
  }

  $('video').mediaelementplayer({
    pluginPath:'/packages/johndyer_mediaelement/',
    features: '[]',
    clickToPlayPause : false,
    success: function (mediaElement, domObject) {
      Player =mediaElement;
      mediaElement.setSrc(url);
    }
  });
  vid=$("#videoDisplayId").get(0);
  vidCtrl=new videoControler(vid,30);
  seekBarMng=new seekBarManager(vidCtrl);
  vidCtrl.attach(seekBarMng,5);
  Session.set('videoPlayer', 1);
});

Template.videoPlayer.helpers({
  isFile(){
    var idProject = Router.current().params._id;
    return Projects.findOne(idProject).isFile;
  },

  fileIsGiven(){
    var idProject = Router.current().params._id;
    if(Projects.findOne(idProject).fileId!=null){
      return true;
    }
    var idUpload = "upload_"+idProject;
    var upload = Session.get(idUpload);
    if(!upload || upload==-1){
      return false
    }
    return true;
  },

  uploadIsDone(){
    var idProject = Router.current().params._id;
    if(Projects.findOne(idProject).fileId!=null){
      return true;
    }
    var idUpload = "upload_"+idProject;
    var upload = Session.get(idUpload);
    if(!upload && Projects.findOne(idProject).isFile){
      return false;
    }
    else if(!upload){
      return true;
    }
    return (upload==100);
  },

  errorMessageFile: function(field){
    return Session.get('errorMessageFile');
  },

  uploading(){
    var idProject = Router.current().params._id;
    var idUpload = "upload_"+idProject;
    var upload = Session.get(idUpload);
    $("#myBar").width(upload+"%");

    return upload;
  },


  file(){
    //A CHANGER
    return "YOUR FILE IS UPLOADING";
    //return Projects.findOne(Router.current().params._id).url;
  }
})

Template.videoPlayer.events({
  'click #addFile'(event,instance){
    var _projectFile = $('#selectedFile')[0].files[0];
    Session.set('errorMessageFile','');

    ext = ['mp4'];
    //Check if file given is an mp4 file
    if(!_projectFile){
      return Session.set('errorMessageFile',TAPi18n.__('errorFile'));
    }
    if(!checkExtension(ext,_projectFile.name)){
      return Session.set('errorMessageFile',TAPi18n.__('errorExtensionFile'));
    }

    var idProject = Router.current().params._id

    const upload = Videos.insert({
      file: _projectFile,
      streams: 'dynamic',
      chunkSize: 'dynamic'
    }, false);

    upload.on('start', function () {
      var idUpload = "upload_"+idProject;
      Session.set(idUpload,upload.progress);
      // var date = moment().calendar();
      // var val = "Project "+project.name+" : file "+project.url+" is uploading, wait for upload to be done to play video.";
      // Meteor.call('addNotifications',res,date,val, function(errorNotif,resultNotif){
      //   if(err){
      //     toastr.warning(errorNotif.reason);
      //   }
      // });
      toastr.success(TAPi18n.__('fileUploading'));
    });

    upload.on('progress',function(progress,fileData){
      var idUpload = "upload_"+idProject;
      Session.set(idUpload,progress);
    });

    upload.on('end', function (error, fileObj) {
      if (error) {
        toastr.warning('Error during upload: ' + error);
      } else {
        var idUpload = "upload_"+idProject;
        Meteor.call('modifyFileId',idProject,fileObj._id,function(err1,res1){
          if(err1){
            toastr.warning(err1.reason);
          }
        });
        toastr.success(TAPi18n.__('fileUploaded'));

        if(!eventDDPVideo){
          eventDDPVideo = new EventDDP('videoPlayer',Meteor.connection);
        }
        eventDDPVideo.setClient({
          appId: idProject,
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
}
});

Template.videoPlayer.onDestroyed(function(){
  $('.videoContainer').remove();

  eventDDPVideo.setClient({
    appId: -1,
    _id: -1
  });
  Player.pause();
  Player.remove();
  Session.set('videoPlayer', 0);
  Session.set('errorMessageFile','');
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
