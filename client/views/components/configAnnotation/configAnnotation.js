import { Projects } from '../../../../lib/collections/projects.js';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { configAnnotationManager } from './configAnnotationManager.js';

import { Extractors } from '/lib/collections/extractors.js';

import './configAnnotation.html';

eventLiveUpdate = null;
eventLiveUpdateSet = null;
var newExtractionListener;
var liveUpdateListener;
var getXmlsListener;
var setXmlsListener;
var manager;


Template.configAnnotation.onRendered(()=>{
  //Wait for project to be rendered before doing that
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
      setTimeout(function(){
        addAnnotation(idExtractor,version);
      },1000);
    });
  }

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
    if(Session.get('projectReady') === 1 && Session.get('videoPlayer') === 1) {
      // console.log('config XMLArray',xmlArray)
      // console.log('config XSDArray', xsdArray)
      var idProject = Router.current().params._id;
      var project = Projects.findOne(idProject);
      var nbFrames = 0
      if(typeof project !== 'undefined'){
        nbFrames = parseInt(project.duration * project.frameRate)
      }
      console.log("nbframes",nbFrames);

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
  manager.updateXmls(xmls);
}

function getManagerXmls(){
  return manager.getXmls();
}


Template.configAnnotation.onDestroyed(()=>{
  // stop the tracker when the template is destroyed
  if(typeof this.configAnnotationManagerTracker !== 'undefined' &&
    !this.configAnnotationManagerTracker.stopped){
  this.configAnnotationManagerTracker.stop();
  }
  eventNewExtraction.setClient({
    appId: -1,
    _id: -1
  });
  if(manager instanceof configAnnotationManager){
    manager.destroyVisualizersEventDDP();
  }

  eventLiveUpdate.setClient({
    appId: -1,
    _id: -1
  });
});
