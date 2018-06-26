import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {configAnnotationManager} from './configAnnotationManager.js';

import {Extractors} from '/lib/collections/extractors.js';

import './configAnnotation.html';

var newExtractionListener;
var manager;

Template.configAnnotation.onRendered(()=>{
  // var visualizerFactories = [];
  // var visualizers = [];
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

  Tracker.autorun(function doWhenProjectRendered(computation) {
    if(Session.get('projectReady') === 1 && Session.get('videoPlayer') === 1) {
      //console.log('config XMLArray',xmlArray)
      //console.log('config XSDArray', xsdArray)
      manager = new configAnnotationManager(xsdArray, xmlArray,"configAnnotation", ["configAnnotationForm","timeLines","overlay"],"saveButtonAnnotations")

      Session.set('projectReady', 0)
      computation.stop();
    }
  });

});

Template.configAnnotation.events({
});

Template.configAnnotation.helpers({
});

function addAnnotation(idExtractor,version){
    manager.addAnnotation(idExtractor,version);
}


Template.configAnnotation.onDestroyed(()=>{
  eventNewExtraction.setClient({
    appId: -1,
    _id: -1
  });
});
