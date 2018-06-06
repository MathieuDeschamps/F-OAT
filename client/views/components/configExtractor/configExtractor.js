import { Template } from 'meteor/templating';

import './configExtractor.html';

import {Extractors} from '/lib/collections/extractors.js';

import {configuratorManager} from './configuratorManager.js';

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
  	new configuratorManager(extractors,"configExtractor","configExtractorForm");
  })


	/*extractors.forEach(function(extractor,i){
		extractorCheckBox= '<p><input class="filled-in"  id="'+ i + '_config"  type="checkbox" mark="false"/>'
        extractorCheckBox += '<label for="'+ i + '_config">' + extractor.name + '</label></p>'
		$("#configurator").append(extractorCheckBox);
	});*/

	/*Meteor.call("getXml",path, (err,result)=>{
		if(err){
			alert(err.reason);
		}else{
			console.log('parameters.xsd : ', result.data);
			var xsd=$.parseXML(result.data);
			console.log('XSD parsé : ',xsd);

			var xsdObj=new XSDObject(xsd);
			console.log('xsdObj',xsdObj);

			var xmlxsdObj= new XMLXSDObj(undefined,xsdObj);

			var xmlxsdForm=new XMLXSDForm(xmlxsdObj,'testId','shot-extractor','configuratorForm');
			xmlxsdForm.generate();

			$("#configuratorButton").append(
				'<div class="row"><a id="finalButton" class="waves-effect waves-light btn col s6 offset-s3">Launch Extraction</a></div>'
			);

			$('#finalButton').click(function(){
				gen=new XMLGenerator(xmlxsdObj);
				console.log(gen.generateXML());
			});
		}
	});*/

});

/*
Template.configurator.helpers({
	parserXSD($xsd){
		var $schema = $xsd.find("xs\\:schema");
		schemaObj=new schemaObject($xschema,null,"monExtracteur");
		myForm=formGenerator.construct(schemaObj);
		$("configurator").html(myForm);
	},
});
*/
