import {Projects} from '../../../../lib/collections/Project.js';
import {XSDObject} from '../XSDParser/XSDObject.js';
import {XMLXSDObj} from '../XMLXSDParser/XMLXSDObj.js';
import {XMLXSDForm} from '../XMLXSDForm/XMLXSDForm.js';
import {XMLGenerator} from '../XMLGenerator/XMLGenerator.js';


export class configuratorManager{
	constructor(extractors,checkBoxDiv,formDiv){
		this.extractors=extractors;
		this.formDiv=formDiv;
		this.checkBoxDiv=checkBoxDiv;
		this.JQformDiv='#'+formDiv;
		this.JQcheckBoxDiv='#'+checkBoxDiv;
		
		var that=this;
		extractors.forEach(function(extractor,i){
			var extractorCheckBox= '<p><input class="filled-in"  id="'+ i + '_config"  type="checkbox" mark="false"/>'
			extractorCheckBox += '<label for="'+ i + '_config">' + extractor.name + '</label></p>'
			$(that.JQcheckBoxDiv).append(extractorCheckBox);
			var labelConfig=i+'_config';
			var JQlabelConfig='#'+labelConfig;
			var idDiv=i+'_formConfig';
			var JQidDiv='#'+idDiv;
			$(JQlabelConfig).change(function(){that.checkBoxChange(extractor,JQlabelConfig,idDiv,i);});
			$(that.JQformDiv).append('<div class="row" id="'+idDiv+'"></div>'); 
			$(JQidDiv).css('display','none');
		});	
	}
	
	checkBoxChange(extractor,JQlabelConfig,idDiv,i){
		var JQidDiv='#'+idDiv;
		var that=this;
		if ($(JQlabelConfig).prop('checked')){
			var idDivForm=idDiv+'_Form';
			var idDivButton=idDiv+'_Button';
			$(JQidDiv).css('display','block');
			$(JQidDiv).html('<div id="'+idDivForm+'"></div>');
			$(JQidDiv).append('<div id="'+idDivButton+'"></div>');
			var path='/parameters.xsd';
			Meteor.call("getXml",path, (err,result)=>{
			
			/*console.log(extractor.ip);
			Meteor.call("getExtractorsParam",extractor.ip,(err,result)=>{*/
				if(err){
					alert(err.reason);
					$(JQidDiv).html('The parameters of '+extractor.name+' are not available.'); 
				}else{
					that.manageParameters(result,extractor,i,idDiv,idDivForm,idDivButton,JQlabelConfig);
				}
			});
		}else{
			$(JQidDiv).css('display','none');
			$(JQidDiv).html('');
		}
	}
	
	manageParameters(result,extractor,i,idDiv,idDivForm,idDivButton,JQlabelConfig){
		console.log('parameters.xsd : ', result.data);
		var xsd=$.parseXML(result.data);
		console.log('XSD parsé : ',xsd);
		
		var xsdObj=new XSDObject(xsd);
		console.log('xsdObj',xsdObj);

		var xmlxsdObj= new XMLXSDObj(undefined,xsdObj);

		var xmlxsdForm=new XMLXSDForm(xmlxsdObj,extractor._id+'_'+i,extractor.name,idDivForm);
		
		console.log('xmlxsdForm',xmlxsdForm);
		
		console.log('displayForm',xmlxsdForm,extractor,i,idDivButton,idDivForm,JQlabelConfig);
		this.displayForm(xmlxsdForm,xmlxsdObj,extractor,i,idDivButton,idDivForm,JQlabelConfig);
	}
	
	displayForm(xmlxsdForm,xmlxsdObj,extractor,i,idDivButton,idDivForm,JQlabelConfig){
		console.log('xmlxsdForm',xmlxsdForm);
		var that=this;
		xmlxsdForm.generate();
		
		var JQidDivButton='#'+idDivButton;
		var idButton=idDivButton+'_FinalButton';
		$(JQidDivButton).append('<div class="row"><a id="'+idButton+'" class="waves-effect waves-light btn col s6 offset-s3">Launch '+extractor.name+'</a></div>');
					
		var JQidButton='#'+idButton;
		$(JQidButton).click(function(){
			var gen=new XMLGenerator(xmlxsdObj);
			console.log(gen.generateXML());
			var paramsXML=gen.generateXML();
			var params={"param" : paramsXML};
			console.log('param en JSON',params);
			$(JQidDivButton).html('');
			var JQidDivForm='#'+idDivForm;
			$(JQidDivForm).html(extractor.name + ' is downloading your video.');
			
			// Initialisation
			// _id,extractorUrl,_checksum,_downUrl??
			var idProject = Router.current().params._id
			var project = Projects.findOne(idProject)
			var checksum;
			Meteor.call("initRequest",idProject,extractor.ip,checksum,project._downUrl,(err,result)=>{
				if (err){
					alert('Download problem by '+extractor.name + ' : ' +err.reason);
					console.log("initRequest that : ",that);
					console.log("form :", xmlxsdForm);
					console.log("extractor",extractor);
					console.log('i : ',i)
					console.log('but : ',idDivButton);
					console.log('div : ',idDivForm);
					console.log('JQlabel : ',JQlabelConfig);
					that.displayForm(xmlxsdForm,xmlxsdObj,extractor,i,idDivButton,idDivForm,JQlabelConfig);
				}else{
					// Extraction launch
					Meteor.call("putRequest",idProject,params,extractor.ip,(err,result)=>{
						if (err){
							alert('Download problem by '+extractor.name + ' : ' +err.reason);
							that.displayForm(xmlxsdForm,xmlxsdObj,extractor,i,idDivButton,idDivForm,JQlabelConfig);
						}else{
							$(JQidDiv).html(extractor.name +"'s extraction is done.");
							setTimeout(function(){$(JQlabelConfig).prop('checked',false);},30000);
						}
					});
				}
			});
		});
	}
	
}