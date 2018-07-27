import { Template } from 'meteor/templating';

import './configExtractor.html';

import {Extractors} from '/lib/collections/extractors.js';

import {configExtractorManager} from './configExtractorManager.js';
import { TestXMLFilter } from '../Test/TestXMLFilter.js';
import { TestXMLSelector } from '../Test/TestXMLSelector.js';

Template.configExtractor.onCreated(function(){

  this.subscribe('extractors');
  this.subscribe('projects');

});

Template.configExtractor.onRendered(()=>{
    /*console.log('Lecture test.xsd');
	path='/parameters.xsd';
	console.log('Path : ',path);*/

  Meteor.subscribe('extractors', ()=>{
    extractors=Extractors.find();
  	new configExtractorManager(extractors,"configExtractor","configExtractorForm");
  })

  // test xml filter run
  // TestXMLSelector.run();
  // TestXMLFilter.run();


});
