import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {configAnnotationManager} from './configAnnotationManager.js';

import {Extractors} from '/lib/collections/extractors.js';

import './configAnnotation.html';

Template.configAnnotation.onRendered(()=>{
  // var visualizerFactories = [];
  // var visualizers = [];
  //Wait for project to be rendered before doing that
  Tracker.autorun(function doWhenProjectRendered(computation) {
    if(Session.get('projectReady') === 1 && Session.get('videoPlayer') === 1) {
      // console.log('config XMLArray',xmlArray)
      // console.log('config XSDArray', xsdArray)
      new configAnnotationManager(xsdArray, xmlArray,"configAnnotation", ["configAnnotationForm","timeLines","overlay"],"saveButtonAnnotations")
      Session.set('projectReady', 0)
      computation.stop();
    }
  });
})

Template.configAnnotation.events({
});

Template.configAnnotation.helpers({
});
