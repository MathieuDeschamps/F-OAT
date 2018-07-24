import './project.html';
import {Projects} from '../../../../lib/collections/projects.js';
import {Videos} from '../../../../lib/collections/videos.js';
import { Parser } from '../../components/class/Parser.js'
import { Writer } from '../../components/class/Writer.js'
import { PlayerCommand} from '../../components/playerCommand/PlayerCommand.js'

//vidctrllistener & deleteprojectlistener are used to create only once the listeners of eventddps
var vidctrllistener;
var deleteprojectlistener;

// global variables id and username to be accessable in onDestroyed
var id;
var username;

// function which check if the current user has the right write on the project
hasRightToWrite = function(){
  var idProject = Router.current().params._id
  var project = Projects.findOne(idProject)
  if(!project){
    return false;
  }
  var username = Meteor.user().username
  var participant = $(project.participants).filter(function(i,p){
    return p.username == username && p.right == "Write"
  })
  if(project.owner == username || participant.length > 0){
    return true
  }else{
    return false
  }
}

//Fonction which check if the project exists in db, to avoid problems in onRendered
projectExists = function(){
  var idProject = Router.current().params._id;
  var project = Projects.findOne(idProject);
  if(!project){
    return false
  }
  return true;
}

//Fonction used to change value of projectReady session var, used in components of the page
projectReady = function(){
  var idProject = Router.current().params._id;
  var project = Projects.findOne(idProject)
  if(project.isFile){
    if(project.fileId!=null){
        Session.set('projectReady',1);
        $('#saveButtonAnnotations').css('display', 'block');
    }else{
      var idUpload = "upload_"+Router.current().params._id;
      var upload = Session.get(idUpload);
      if(upload!=null){
        this.projectReadyTracker = Tracker.autorun(function doWhenVideoPlayerRendered(computation) {
            var idUpload = "upload_"+Router.current().params._id;
          if(Session.get(idUpload)==100){
            Session.set('projectReady', 1)
            $('#saveButtonAnnotations').css('display', 'block');
            computation.stop();
          }
        });
      }
    }
  }
  else{
    $('#saveButtonAnnotations').css('display', 'block');
    Session.set('projectReady', 1)
  }
}

Template.project.onCreated(()=>{
  Session.set('errorMessageFile','');
  Session.set('projectReady', 0);
  // global variables id and username to be accessable in onDestroyed
  id = Router.current().params._id;
  username = Meteor.user().username;
  var idUpload = "upload_"+Router.current().params._id;
  var upload = Session.set(idUpload,-1);

  //Counter used to know how many users are on the page
  Meteor.call('increaseCount',id,username,function(err,res){
    if(err){
      toastr.warning(err.reason);
    }
  });
});

Template.project.onRendered(()=>{
  $("#saveButtonAnnotations").css('display', 'none');
  if(projectExists()){
    var xmlPath = '/tmp/' + Router.current().params._id + '/annotation.xml'
    var extractorPath

    if(!eventDeleteProject){
      eventDeleteProject = new EventDDP('deleteProject',Meteor.connection);
    }
    if(!deleteprojectlistener){
      deleteprojectlistener = true;
      //Event emitted in dashboard.js when project is deleted by owner
      eventDeleteProject.addListener('deleteProject',()=>{
        toastr.warning(TAPi18n.__('projectDeleted'));
        Router.go("/");
      });
    }
    eventDeleteProject.setClient({
      appId: Router.current().params._id,
      _id: Meteor.userId()
    });

    Meteor.call("getXml",xmlPath,(xmlErr,result)=>{
      if(xmlErr){
        alert(xmlErr.reason);
      }else{
        var xmlDoc = result.data
        var xmlParsed = $.parseXML(result.data)
        Session.set('xml', xmlDoc)
        // build the extractors
        var extractors = Parser.getListExtractors(xmlDoc)

        // global table which will contains the form objects
        xsdArray = new Array(extractors.length)
        xmlArray = new Array(extractors.length)

        if(extractors.length === 0){
          projectReady();
        }
        // add the extractor list and build the forms
        $(extractors).each(function(i,extractor){

        extractorPath  = '/tmp/'+ extractor[0].tagName + '/' + $(extractor).attr('version') + '/descriptor.xsd'
        Meteor.call("getXml", extractorPath, (xsdErr,resultExtractor)=>{
          if(xsdErr){
            // console.log('path', pathExtractor)
            // alert(xsdErr.reason);
          }else{
            // build the forms for the editor
            var xmlTmp = $(xmlParsed).find('extractors').children().filter(function(){
              return ($(this).prop('tagName') === $(extractor).prop('tagName') &&
                  $(this).attr('version') === $(extractor).attr('version'))
            })
            if(xmlTmp.length === 1){
              xmlArray[i] = xmlTmp
            }

          xsdArray[i] = $.parseXML(resultExtractor.data)

          if(i+1 === extractors.length){
            projectReady();
          }
        }
      })
    })
        //Wait for video player to be rendered before doing that
        Tracker.autorun(function doWhenVideoPlayerRendered(computation){
          if(Session.get('videoPlayer') === 1) {

            // VideoControler init
            var nbFrames=0;
            var idProject = Router.current().params._id;
            var project = Projects.findOne(idProject)
            var nbFrames = -1
            if(typeof project !== 'undefined'){
              nbFrames = parseInt(project.duration * project.frameRate)
            }
            if (nbFrames>0){
              vidCtrl.setNbFrames(nbFrames);
            }
            vidCtrl.setAnnotedFrames(Parser.getListTimeId(xmlDoc));

            if(!vidctrllistener){
              vidctrllistener = true;
              //Event emitted in videoPlayer.js
              eventDDPVideo.addListener('videoCtrl',()=>{
                // VideoControler init
                var nbFrames=0;
                var idProject = Router.current().params._id;
                var project = Projects.findOne(idProject)
                var nbFrames = -1
                if(typeof project !== 'undefined'){
                  nbFrames = parseInt(project.duration * project.frameRate)
                }
                if (nbFrames>0){
                  vidCtrl.setNbFrames(nbFrames);
                }
                vidCtrl.setAnnotedFrames(Parser.getListTimeId(xmlDoc));

                Session.set('projectReady',1);
              });
            }
            computation.stop();
          }
        });
      }
    });
  }
});

Template.project.onDestroyed(()=>{

  //put wrong values for the event => unsuscribe the user for the channel of this project
  if(eventDeleteProject!=null){
    eventDeleteProject.setClient({
      appId: -1,
      _id: -1
    });
  }

  Meteor.call('decreaseCount', id, username,function(err,res){
    if(err){
      toastr.warning(err.reason);
    }
    else{
      //If no one is on this page anymore, remove the video from database
      if(Projects.findOne(id).usersOnPage==0){
        Meteor.call('removeVideo', id,function(error,result){
          if(error){
            toastr.warning(error.reason);
          }
        });
      }
    }
  });
  Session.set('projectReady', 0);
  // stop the tracker when the template is destroing
  if(typeof this.projectReadyTracker !== 'undefined' &&
  !this.projectReadyTracker.stopped){
    this.projectReadyTracker.stop();
  }

});

Template.project.helpers({

      projectExists(){
        return projectExists();
      },

      // used to display or not the save button
      hasRightToWrite(){
        return hasRightToWrite()
      },

      isFile(){
        var idProject = Router.current().params._id;
        return Projects.findOne(idProject).isFile;
      },

      uploadIsDone(){
        var idProject = Router.current().params._id
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
      }
});

Template.project.events({

});

Meteor.startup(function(){
    //Do the same as onDestroyed but when page is reloaded or leaved by user
    $(window).bind('beforeunload', function() {
      if(eventDeleteProject!=null){
        eventDeleteProject.setClient({
          appId: -1,
          _id: -1
        });
      }

      Session.set('projectReady', 0);
      // console.log('id',id, 'username', username)
      if(id!=null && username!=null){
        Meteor.call('decreaseCount',id,username,function(err,res){
          if(err){

          }
          else{
            //If no one is on this page anymore, remove the video from database
            if(Projects.findOne(id).usersOnPage==0){
              Meteor.call('removeVideo',id);
            }
          }
        });
      }
      // have to return null, unless you want a chrome popup alert
      return undefined;

    });
});
