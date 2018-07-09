import { Projects } from '../../../../lib/collections/projects.js';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {configAnnotationManager} from './configAnnotationManager.js';

import {Extractors} from '/lib/collections/extractors.js';

import './configAnnotation.html';

eventLiveUpdate = null;
var newExtractionListener;
var liveUpdateListener;
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
      addAnnotation(idExtractor,version);
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
      computation.stop();
    }
  });

});

Template.configAnnotation.events({
});

Template.configAnnotation.helpers({
});

function addAnnotation(idExtractor,version){
  if(typeof manager != 'undefined'){
    manager.addAnnotation(idExtractor,version);
  }
}

function updateManager(idVisualizer,xml){
  if(typeof manager != 'undefined'){
    manager.update(idVisualizer,xml);
  }
}


Template.configAnnotation.onDestroyed(()=>{
  // stop the tracker when the template is destroing
  if(typeof this.configAnnotationManagerTracker !== 'undefined' &&
    !this.configAnnotationManagerTracker.stopped){
  this.configAnnotationManagerTracker.stop();
  }
  eventNewExtraction.setClient({
    appId: -1,
    _id: -1
  });
  if(typeof manager !== 'undefined'){
    manager.destroyVisualizersEventDDP();
  }

  eventLiveUpdate.setClient({
    appId: -1,
    _id: -1
  });
});
