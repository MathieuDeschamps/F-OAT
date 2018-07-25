import { Projects } from '../../../../lib/collections/projects.js';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { configAnnotationManager } from './configAnnotationManager.js';
import { Extractors } from '/lib/collections/extractors.js';

import './configAnnotation.html';

eventLiveUpdate = null;
eventLiveUpdateSet = null;

//These 4 are used to create only once each listener
var newExtractionListener;
var liveUpdateListener;
var getXmlsListener;
var setXmlsListener;

var manager;


Template.configAnnotation.onRendered(()=>{

  //Event called when a new extraction is done to show new data for every users on the page
  if(!eventNewExtraction){
    eventNewExtraction = new EventDDP('newExtraction', Meteor.connection);
  }

  eventNewExtraction.setClient({
    appId: Router.current().params._id,
    _id: Meteor.userId()
  });

  if(!newExtractionListener){
    newExtractionListener = true;
    eventNewExtraction.addListener('newExtraction', function(idExtractor,version) {
      //A small timeout is used to be sure that data is written in the file before calling the function
      setTimeout(function(){
        addAnnotation(idExtractor,version);
      },1000);
    });
  }

  //Event to have live update for all users on the same project
  if(!eventLiveUpdate){
    eventLiveUpdate = new EventDDP('liveUpdate',Meteor.connection);
  }

  eventLiveUpdate.setClient({
    appId: Router.current().params._id,
    _id: Meteor.userId()
  });

  if(!liveUpdateListener){
    liveUpdateListener = true;
    eventLiveUpdate.addListener('liveUpdate',function(idVisualizer,xml){
      updateManager(idVisualizer,xml);
    });
  }

  //Event used with the getXmlsListener for a user cming on the project page, to get the last version of the project
  if(!eventLiveUpdateSet){
    eventLiveUpdateSet = new EventDDP('setUpdate',Meteor.connection);
  }

  eventLiveUpdateSet.setClient({
    appId: Router.current().params._id,
    _id: Meteor.userId()
  });

  if(!setXmlsListener){
    setXmlsListener = true;
    eventLiveUpdateSet.addListener('setXmls',function(xmls,idUser){
      updateManagerXmls(xmls);
    });
  }


  if(!getXmlsListener){
    getXmlsListener = true;
    eventLiveUpdate.addListener('getXmls',function(idUserGet,idUserSet){
      var xmls = getManagerXmls();
      eventLiveUpdateSet.emit('setXmls',xmls,idUserSet);
    });
  }

  this.configAnnotationManagerTracker = Tracker.autorun(function doWhenProjectRendered(computation) {
    //Wait for project and video player to be ready before creating the manager
    if(Session.get('projectReady') === 1 && Session.get('videoPlayer') === 1) {
      var idProject = Router.current().params._id;
      var project = Projects.findOne(idProject);
      var nbFrames = 0
      if(typeof project !== 'undefined'){
        nbFrames = parseInt(project.duration * project.frameRate)
      }

      manager = new configAnnotationManager(xsdArray, xmlArray, nbFrames, "configAnnotation", ["configAnnotationForm","timeLines","overlay"],"saveButtonAnnotations")

      if(project.usersOnPage.length>1){

        if(!eventLiveUpdate){
          eventLiveUpdate = new EventDDP('liveUpdate',Meteor.connection);
        }

        eventLiveUpdate.setClient({
          appId: Router.current().params._id,
          _id: Meteor.userId()
        });

        var nameUser = project.usersOnPage[0];

        if(nameUser == Meteor.user().username){
          nameUser = project.usersOnPage[1];
        }
        var idUser = Meteor.users.findOne({username:nameUser})._id;

        eventLiveUpdate.emit('getXmls',Meteor.userId(),idUser);
      }

      computation.stop();
    }
  });

});

Template.configAnnotation.events({
});

Template.configAnnotation.helpers({
});

function addAnnotation(idExtractor,version){
  if(manager instanceof configAnnotationManager){
    manager.addAnnotation(idExtractor,version);
  }
}

function updateManager(idVisualizer,xml){
  if(manager instanceof configAnnotationManager){
    manager.update(idVisualizer,xml);
  }
}

function updateManagerXmls(xmls){
  if(manager instanceof configAnnotationManager){
    manager.updateXmls(xmls);
  }
}

function getManagerXmls(){
  if(manager instanceof configAnnotationManager){
    return manager.getXmls();
  }
}


Template.configAnnotation.onDestroyed(()=>{
  // stop the tracker when the template is destroyed
  if(typeof this.configAnnotationManagerTracker !== 'undefined' &&
    !this.configAnnotationManagerTracker.stopped){
  this.configAnnotationManagerTracker.stop();
  }

  //Set wrong values to unsubscribe for events
  eventNewExtraction.setClient({
    appId: -1,
    _id: -1
  });

  eventLiveUpdate.setClient({
    appId: -1,
    _id: -1
  });

  eventLiveUpdateSet.setClient({
    appId: -1,
    _id: -1
  });

  //Do the same for events in all visualizers
  if(manager instanceof configAnnotationManager){
    manager.destroyVisualizersEventDDP();
  }
});
