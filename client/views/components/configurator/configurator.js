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
		
		//XMLXSDGen=new XMLXSDGenerator();
		Meteor.call("getXml",'/test.xml',(err,result)=>{
			/*console.log('test.xml : ', result.data);
			var xml=$.parseXML(result.data);
			console.log('XML parsé : ',xml);*/
			xmlxsdObj= new XMLXSDObj(undefined,xsdObj);
			xmlxsdForm=new XMLXSDForm(xmlxsdObj,'testId','testName','configurator');
			xmlxsdForm.generate();
			//$("#configurator").html(xmlxsdForm.html);
			$("#configuratorButton").append(
				'<div> <a id="finalButton" class="waves-effect waves-light btn">Apply Configuration</a></div>'
			);
			$('#finalButton').click(function(){
				gen=new XMLGenerator(xmlxsdObj);
				console.log(gen.generateXML());
			});
		});
		
		
		
		/*
		$xsd=$(xsd);
		var $schema = $xsd.find("xs\\:schema");
		
		
		var i=0; 
		console.log("schema children", $schema.children());
		$schema.children().each(function(){
			var name = $(this).attr('name');
			i=i+1;
			console.log('numéro ',i,' : ',name);
			j=0;
            $(this).children().each(function(i,child){
				console.log("this", this);
				var tag=$(this).prop('nodeName');
				console.log('tag ',j,' : ',tag);
				j++;
				
			})
		});*/
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

