import { Projects } from '../../../../lib/collections/projects.js';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {configAnnotationManager} from './configAnnotationManager.js';

import {Extractors} from '/lib/collections/extractors.js';

import './configAnnotation.html';

Template.configAnnotation.onRendered(()=>{
  //Wait for project to be rendered before doing that
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

      new configAnnotationManager(xsdArray, xmlArray, nbFrames, "configAnnotation", ["configAnnotationForm","timeLines","overlay"],"saveButtonAnnotations")
      computation.stop();
    }
  });
})

Template.configAnnotation.events({
});

Template.configAnnotation.helpers({
});

Template.configAnnotation.onDestroyed(()=>{
  // stop the tracker when the template is destroing
  if(typeof this.configAnnotationManagerTracker !== 'undefined' &&
    !this.configAnnotationManagerTracker.stopped){
  this.configAnnotationManagerTracker.stop();
  }
})
