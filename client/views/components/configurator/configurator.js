import { Template } from 'meteor/templating';

import './configurator.html';
import {XSDObject} from '../XSDParser/XSDObject.js';
import {XMLXSDObj} from '../XMLXSDParser/XMLXSDObj.js';
import {XMLXSDForm} from '../XMLXSDForm/XMLXSDForm.js';
import {XMLGenerator} from '../XMLGenerator/XMLGenerator.js';

Template.configurator.onRendered(()=>{
    console.log('Lecture test.xsd');
	Meteor.call("getXml",'/parameters.xsd',(err,result)=>{
		if(err){
			alert(err.reason);
		}else{
			console.log('parameters.xsd : ', result.data);
			var xsd=$.parseXML(result.data);
			console.log('XSD parsé : ',xsd);
		
			var xsdObj=new XSDObject(xsd);
			console.log('xsdObj',xsdObj);

			var xmlxsdObj= new XMLXSDObj(undefined,xsdObj);

			var xmlxsdForm=new XMLXSDForm(xmlxsdObj,'testId','testName','configurator');
			xmlxsdForm.generate();

			$("#configuratorButton").append(
				'<div><a id="finalButton" class="waves-effect waves-light btn col s6 offset-s3">Launch Extraction</a></div>'
			);

			$('#finalButton').click(function(){
				gen=new XMLGenerator(xmlxsdObj);
				console.log(gen.generateXML());
			});
		}
	});

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

