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
		if ($(JQlabelConfig).prop('checked')){
			var idDivForm=idDiv+'_Form';
			var idDivButton=idDiv+'_Button';
			$(JQidDiv).css('display','block');
			$(JQidDiv).html('<div id="'+idDivForm+'"></div>');
			$(JQidDiv).append('<div id="'+idDivButton+'"></div>');
			/*var path='/parameters.xsd';
			Meteor.call("getXml",path, (err,result)=>{
				*/
			Meteor.call("getExtractorsParam",extractor.ip,(err,result)=>{
				if(err){
					alert(err.reason);
				}else{
					var xsd=$.parseXML(result);

					var xsdObj=new XSDObject(xsd);
					console.log('xsdObj',xsdObj);

					var xmlxsdObj= new XMLXSDObj(undefined,xsdObj);

					var xmlxsdForm=new XMLXSDForm(xmlxsdObj,extractor._id+'_'+i,extractor.name,idDivForm);
					xmlxsdForm.generate();

					var JQidDivButton='#'+idDivButton;
					var idButton=idDivButton+'_FinalButton';
					$(JQidDivButton).append('<div class="row"><a id="'+idButton+'" class="waves-effect waves-light btn col s6 offset-s3">Launch '+extractor.name+'</a></div>');

					var JQidButton='#'+idButton;
					$(JQidButton).click(function(){
						var params=new XMLGenerator(xmlxsdObj);
						console.log(params);
						//console.log(gen.generateXML());
						Meteor.call("",extractor._id,params,extractor.ip,(err,result)=>{
							if (err){
								alert(err.reason);
							}else{
								$(JQlabelConfig).prop('checked',false);
							}
						});
					});
				}
			});
		}else{
			$(JQidDiv).css('display','none');
			$(JQidDiv).html('');
		}


	}

}
