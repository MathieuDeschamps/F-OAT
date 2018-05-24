export class XMLXSDForm{
	constructor(xmlxsdObj,id,name,divId){
		this.xmlxsdObj=xmlxsdObj;
		this.id=id;
		this.name=name;
		this.divId=divId;

		this.html="";

		this.eventHandler=[];

		this.stack=[];

		// Gestion des attributs
		this.attrManage=false;
		this.attrFormName="";

		this.htmlUpdate=false;
	}
	generate(){
		this.xmlxsdObj.accept(this);
		// var temp='#'+this.displayId;
		// $(temp).html(this.html);
	}

	visitXMLXSDObject(xmlxsdObj){
		console.log('visitXMLXSDObject',xmlxsdObj);


		this.html=   '<div id="extractor' + this.id + 'config" >'
		this.html +=' <nav id="nav-'+ this.id + 'config">'
		this.html += '<div class="nav-wrapper white-text blue darken-4 row">'
		this.html += '<div class="col s12" id="anchor">'
		this.html += '<a id="'+this.id+'config" class="breadcrumb">' + this.name +'</a>'
		this.html += '</div></div></nav>'
		this.html += '</div>';
		//this.html+= '<div id="extractor' + this.id + 'configFields" >';
		//this.html+= '</div>';

		var jqDivId='#'+this.divId;

		$(jqDivId).html(this.html);



		var jqIdconfig='#'+this.id+'config';
		console.log($(jqIdconfig));
		var that=this;
		//  Appear at the same time
		// $(jqIdconfig).click(function(){
		that.stack.push(xmlxsdObj.content);
		xmlxsdObj.content.accept(that);
		var ul = $("#" + this.divId).find('ul')[0]
		$(ul).collapsible('open', 0)
		// });
	}

	visitXMLXSDElt(xmlxsdElt){
		console.log('visitXMLXSDElt',xmlxsdElt);
		this.html= '<div id="extractor' + this.id + 'config" >'

		// generate nav
		this.generatenav();
		// end generate nav


		// Edit elt
		this.html+='<ul id="elt'+xmlxsdElt.name+'config" class="collapsible" >'
		this.html+='<li>';
		var headStack=this.stack[this.stack.length-1];
		if (headStack!=undefined){
			this.generateHeaderContent('',headStack.name,false)
		}else{
			this.generateHeaderContent('',this.name,false)
		}
		this.html+='<div class="collapsible-body">'
		this.html+='<ul id="ulElt'+xmlxsdElt.name+'config" class="collapsible">'; // class?
		var that=this;
		xmlxsdElt.eltsList.forEach(function(elt,i){
			var idName='elt'+xmlxsdElt.name+i+'config';

			that.html+='<li>';
			// check if the element can be delete or not
			if (xmlxsdElt.eltsList.length!=xmlxsdElt.minOccurs){
				that.generateHeaderContent(idName, xmlxsdElt.name,true);
			}
			else{
				that.generateHeaderContent(idName, xmlxsdElt.name,false);
			}

			that.eventHandler.push({
				function:function(){
					that.stack.push(xmlxsdElt);
					elt.accept(that);
					var ul = $("#" + that.divId).find('ul')[0]
					$(ul).collapsible('open', 0)
				},
				id:idName,
				eventName:'click'
			});

			if (xmlxsdElt.eltsList.length!=xmlxsdElt.minOccurs){
				that.eventHandler.push({
					function:function(){
						console.log('clear1')
						xmlxsdElt.eltsList.splice(i,1);
						xmlxsdElt.accept(that);
						var ul = $("#" + that.divId).find('ul')[0]
						$(ul).collapsible('open', 0)
					},
					id:idName+'clear',
					eventName:'click'
				});
			};

			that.html+='</li>';
		});
		this.html+='</ul>';
		//Bouton d'ajout d'elt si nécessaire
		if (xmlxsdElt.eltsList.length!=xmlxsdElt.maxOccurs){
			var idEltAdd='elt'+xmlxsdElt.name +'add';
			this.html+='<a id="'+idEltAdd+'" class="waves-effect waves-light btn">';
			this.html+='<i class="col s1 material-icons large right">add_circle </i>';
			this.html+=xmlxsdElt.name+'</a>';

			this.eventHandler.push({
				function:function(){
					console.log(xmlxsdElt);
					xmlxsdElt.type.accept(xmlxsdElt);
					xmlxsdElt.accept(that);
					var ul = $("#" + that.divId).find('ul')[0]
					$(ul).collapsible('open', 0)
				},
				id:idEltAdd,
				eventName:'click'
			});
		}

		//
		this.html+='</li>'
		this.html+='</ul>'

		this.html += '</div>';

		// displaying GUI
		var jqDivId='#'+this.divId;

		$(jqDivId).html(this.html);

		console.log(jqDivId);
		// add event handler

		this.applyEventHandler();


		/*
		var jqIdconfig='#'+this.id+'config';
		console.log($(jqIdconfig));
		var that=this;
		$(jqIdconfig).click(function(){
			console.log("ok")
		});*/

	}

	visitXMLXSDSequence(xmlxsdSeq){

		this.eventHandler=[];

		this.html= '<div id="extractor' + this.id + 'config" >'

		// generate nav
		this.generatenav();

		this.html+='<ul id="seq'+xmlxsdSeq.name+'config" class="collapsible">'; // class?
		this.html+='<li>'
		this.generateHeaderContent("seq'+xmlxsdSeq.name+'configTitle", this.stack[this.stack.length-1].name, false)
		this.html+='<div id="seq'+xmlxsdSeq.name+'configContent" class="collapsible-body">'

		this.generateAttrsForm(xmlxsdSeq);


		var that=this;

		this.html+='<ul id="ulxmlxsdSeqconfig" class="collaspsible">'; // class?

		xmlxsdSeq.seqList.forEach(function(seq,k){
			seq.forEach(function(xmlxsdElt,j){
				// that.html+='<ul id="ulElt'+xmlxsdElt.name+'config" class="collaspsible">'; // class?

				xmlxsdElt.eltsList.forEach(function(elt,i){
					var idName='elt'+xmlxsdElt.name+k+'_'+j+'_'+i+'config';

					that.html+='<li>';
					if(xmlxsdElt.eltsList.length!=xmlxsdElt.minOccurs){
						that.generateHeaderContent(idName, xmlxsdElt.name,true)
					}else{
						that.generateHeaderContent(idName, xmlxsdElt.name,false)
					}

					that.eventHandler.push({
						function:function(){
							that.stack.push(xmlxsdSeq);
							that.stack.push(xmlxsdElt);
							// console.log('visit XMLXSDSeq ',elt);
							elt.accept(that);
							var ul = $("#" + that.divId).find('ul')[0]
							$(ul).collapsible('open', 0)
						},
						id:idName,
						eventName:'click'
					});

					if (xmlxsdElt.eltsList.length!=xmlxsdElt.minOccurs){
						that.eventHandler.push({
							function:function(){
								xmlxsdElt.eltsList.splice(i,1);
								xmlxsdSeq.accept(that);
								var ul = $("#" + that.divId).find('ul')[0]
								$(ul).collapsible('open', 0)
							},
							id:idName+'clear',
							eventName:'click'
						});
		[]			};

					that.html+='</li>';
				});

				//Bouton d'ajout d'elt si nécessaire
				if (xmlxsdElt.eltsList.length!=xmlxsdElt.maxOccurs){
					var idEltAdd='elt'+xmlxsdElt.name +'add'+k+'_'+j;
					that.html+='<li id='+idEltAdd+' class="waves-effect waves-light btn">';
					that.html+='<i class="col s1 material-icons large right">add_circle </i>';
					that.html+=xmlxsdElt.name+'</li>';

					that.eventHandler.push({
						function:function(){
							console.log(xmlxsdElt.type);
							xmlxsdElt.type.accept(xmlxsdElt);
							console.log('parent :', parent)
							xmlxsdSeq.accept(that);
							var ul = $("#" + that.divId).find('ul')[0]
							$(ul).collapsible('open', 0)
						},
						id:idEltAdd,
						eventName:'click'});
				}
			});
			that.html+='</ul>';

			that.html+='</li>';
			that.html+='</ul>';


		});

		/*
		//Bouton d'ajout d'elt si nécessaire
		if (xmlxsdSeq.seqList.length!=xmlxsdSeq.maxOccurs){
			var idEltAdd='eltxmlxsdsltadd';
			this.html+='<a id='+idEltAdd+' class="waves-effect waves-light btn">';
			this.html+='<i class="col s1 material-icons">add_circle_outline </i>';
			this.html+='</a>';

			this.eventHandler.push({
				function:function(){
					xmlxsdElt.type.accept(xmlxsdSeq);
					xmlxsdElt.accept(that);
				},
				id:idEltAdd,
				eventName:'click'});
		}
		*/


		this.html+='</div>';
		this.html+='</li>'
		this.html+='</ul>';


		this.html+='</div>';




		// displaying GUI
		var jqDivId='#'+this.divId;

		$(jqDivId).html(this.html);

		// console.log(jqDivId);

		this.applyEventHandler();
	}

	generatenav(){
		this.html +=' <nav id="nav-'+ this.id + 'config">'

		this.html += '<div class="nav-wrapper white-text blue darken-4 row">'
		this.html += '<div class="col s12" id="anchor">'
		// breadcrumb --> problème eventhandler
		this.html += '<a id="'+this.id+'config"  class="breadcrumb">' + this.name +'</a>';
		var that=this;

		//this.html += '<i class="material-icons">keyboard_arrow_right</i>'
		//this.html += '<a id="'+this.id+'config2" class="breadcrumb">  ' + xmlxsdElt.name +'</a>'

		this.stack.forEach(function(obj,i){
			console.log(obj);
			//if (i!=that.stack.length-1){
				that.html+='<a id="'+that.id+'navConfig'+i+'" class="breadcrumb">' + obj.name +'</a>';
			/*}else{
				that.html+='<a id="'+that.id+'navConfig'+i+'">  ' + obj.name +'</a>';
			}*/
			var idName=that.id+'navConfig'+i;

			that.eventHandler.push({function:function(){that.stack=that.stack.slice(0,i); obj.accept(that);},id:idName,eventName:'click'});
		});

		this.html += '</div></div></nav>'
	}

	visitXMLXSDNodeValue(nodeValue){
		console.log('visit nodeValue',nodeValue);
		this.currentNodeValue=nodeValue;
		nodeValue.type.accept(this);
	}

	visitXMLXSDExtensionType(xmlxsdExt){
		this.eventHandler=[];

		this.html= '<div id="extractor' + this.id + 'config" >'

		// generate nav
		this.generatenav();

		this.html+='<ul id="ext'+xmlxsdExt.name+'config" class="collapsible">'; // class?
		this.html+='<li>'
		this.generateHeaderContent("ext'+xmlxsdExt.name+'configTitle",this.stack[this.stack.length-1].name,false)
		this.html+='<div id="ext'+xmlxsdExt.name+'configContent" class="collaspsible-body">'


		this.generateAttrsForm(xmlxsdExt);


		this.currentNodeValue=xmlxsdExt;


		this.htmlUpdate=true;
		console.log(xmlxsdExt);
		console.log(xmlxsdExt.baseType);
		xmlxsdExt.baseType.accept(this);
		this.htmlUpdate=false;

		this.html+='</div>';
		this.html+='</li>'
		this.html+='</ul>'
		this.html+='</div>';
	}

	/* Generate the content of the header in this.html
	@id identifiant of the hedaer
	@nameHeader name of the header
	@deletable boolean to dispaly or not the clear element
	*/
	generateHeaderContent(id,nameHeader,deletable){
		if(this.html == undefined){
			this.html = ''
		}
		this.html+='<div id="'+id+'" class="collapsible-header white-text blue darken-4 row">'
		this.html+='<div class="col s1">'
		this.html+= '<i class="material-icons">keyboard_arrow_right</i>'
		this.html+= '</div>'
		this.html+= '<div class="col s10">'
		this.html+= nameHeader
		this.html+='</div>'
		this.html+='<div class="col s1">'
		if(deletable){
			this.html+='<i id="'+id+'clear" class="red darken-4 material-icons tiny deleteButton"> clear</i>';
		}
		this.html+='</div>'
		this.html+='</div>'
	}

	generateAttrsForm(obj){
		console.log('generateAttrsForm', obj.attrs);
		var that=this;
		var used=true;
		// this.html+='<ul id="ulAttrs'+obj.name+'config" >'; // class?
		$.each(obj.attrs,function(key,attr){
			console.log('generateAttrsForm : ',attr.name,attr);
			var formName=attr.name+'form';
			var jqFormName='#'+formName;
			var switchName=attr.name+'switch';
			var jqSwitchName='#'+switchName;

			that.html+='<div class="row">'
			console.log('attr', attr)
			console.log('attr.use', attr.use)
			switch(attr.use){
				case 'optional' :
					// that.html+='<li>';

					that.html+='<div class="switch col s2"><label>Off'
					if (attr.value!=undefined){
						that.html+='<input id="'+switchName+'" type= "checkbox" checked>'
					}else{
						that.html+='<input id="'+switchName+'" type = "checkbox">';
						used=false
					}
					that.html+='<span class = "lever"></span>On</label></div>'
					that.eventHandler.push({
						function:function(){
							if ($(jqSwitchName).prop('checked')){
								$(jqFormName).prop("disabled",false);
							}else{
								$(jqFormName).prop("disabled",true);
								attr.setValue(undefined);
							}
							$(jqFormName).val(attr.value);
							console.log(attr,switchName,formName);
						},
						id: switchName,
						eventName:'change'
					});
					break;
				case 'required' :
					// that.html+='<li>'
					break;
			}
			if (attr.use!="prohibited"){
				that.html+='<div class="col s9">'
				that.html+=attr.name
				that.html+='<div class="input-field inline">'
				that.attrManage=true;
				that.attrFormName=formName;
				that.currentAttr=attr;
				attr.type.accept(that);
				that.attrManage=false;
				that.html+='</div>'
				that.html+='</div>'
				if(!used){
					console.log('disabled', jqFormName)
					$(jqFormName).prop("disabled",true);
				}
				//TODO disabled input when jqSwitchName not checked
			}
			that.html+='</div>'

			// that.html+='</li>';
		})
		// this.hmlt+='</ul>';
	}

	visitXSDStringType(xsdString){
		console.log('visit XSDStringType')
		console.log(xsdString)

		if (this.attrManage){
			var attr=this.currentAttr;
			if (xsdString.isEnumerated()){
				var selectFormName=this.attrFormName;
				this.html+='<select id="'+selectFormName+'">';
				xsdString.enumeration.forEach(function(value){
					if (attr.value==value){
						this.html+='<option value="'+value+'" selected="selected">'+value+'</option>';
					}else{
						this.html+='<option value="'+value+'">'+value+'</option>';
					}
				});
				this.html+='</select>';
				this.eventHandler.push({
					function:function(){
						var jqSelectFormName='#'+selectFormName;
						attr.setValue($(jqSelectFormName).value);
					},
					id: selectFormName,
					eventName:'change'
				});

			}else{
				var formName=this.attrFormName;
				var attrButtonName='button'+formName;
				this.html+='<input id="'+formName+'" type="text">'
				// value by default of the textarea
				if(attr.value != undefined){
						this.html+=attr.value
				}
				this.html+='</input>';//
				this.eventHandler.push({
					function:function(){
						var jqFormName='#'+formName;
						attr.setValue($(jqFormName).val());
						console.log(attr,$(jqFormName).val(),formName);
					},
					id:formName,
					eventName:'change'
				});
			}
		}
		else
		{
			if (!this.htmlUpdate){
				this.eventHandler=[];
				this.html= '<div id="extractor' + this.id + 'config" >'

				// generate nav
				this.generatenav();
			}
			var leaf=this.currentNodeValue;
			if (xsdString.isEnumerated()){
				this.html+='<div>text</div>';
				var selectFormName='selectNodeValue';
				this.html+='<select id="'+selectFormName+'">';
				xsdString.enumeration.forEach(function(value){
					if (leaf.value==value){
						this.html+='<option value="'+value+'" selected="selected">'+value+'</option>';
					}else{
						this.html+='<option value="'+value+'">'+value+'</option>';
					}
				});
				this.html+='</select>';
				this.eventHandler.push({
						function:function(){
							var jqSelectFormName='#'+selectFormName;
							nodeValue.setValue($(jqSelectFormName).val());
						},
						id: selectFormName,
						eventName:'change'
					});

			}else{

				var formName='leafForm';
				this.generateInput(formName, "text", "text", leaf.value)
				this.eventHandler.push({
					function:function(){
						var jqFormName='#'+formName;
						leaf.setValue($(jqFormName).val());
					},
					id:formName,
					eventName:'change'
				});
			}

			if (!this.htmlUpdate){
				this.html+='</div>';
			}
			// displaying GUI
			var jqDivId='#'+this.divId;

			$(jqDivId).html(this.html);

			console.log(jqDivId);

			this.applyEventHandler();
		}

	}

	visitXSDIntegerType(xsdInt){
		if (this.attrManage){
			var attr=this.currentAttr;
			console.log('XSD int', xsdInt)
			if (xsdInt.isEnumerated()){
				var selectFormName='select'+this.attrFormName;
				this.html+='<select id="'+selectFormName+'">';
				xsdInt.enumeration.forEach(function(value){
					if (attr.value==value){
						this.html+='<option value="'+value+'" selected="selected">'+value+'</option>';
					}else{
						this.html+='<option value="'+value+'">'+value+'</option>';
					}
				});
				this.html+='</select>';
				this.eventHandler.push({
						function:function(){
							var jqSelectFormName='#'+selectFormName;
							attr.setValue($(jqSelectFormName).value);
						},
						id: selectFormName,
						eventName:'change'
					});

			}else{
				var formName=this.attrFormName;
				//var attrButtonName='button'+formName;
				this.html+='<input id="'+formName+'" type="number" value="'+attr.value+'"/>';
				//this.html+='<a id="'+attrButtonName+'" class="waves-effect waves-light btn">Apply</a>';
				this.eventHandler.push({
					function:function(){
						var jqFormName='#'+formName;
						attr.setValue($(jqFormName).val());
						$(jqFormName).val(attr.value);
					},
					id:formName,
					eventName:'change'
				});
			}
		}else{
			if (!this.htmlUpdate){
				this.eventHandler=[];
				this.html= '<div id="extractor' + this.id + 'config" >'

				// generate nav
				this.generatenav();
			}

			var leaf=this.currentNodeValue;
			if (xsdInt.isEnumerated()){
				this.html+='<div> text </div>';
				var selectFormName='selectNodeValue';
				this.html+='<select id="'+selectFormName+'">';
				xsdInt.enumeration.forEach(function(value){
					if (leaf.value==value){
						this.html+='<option value="'+value+'" selected="selected">'+value+'</option>';
					}else{
						this.html+='<option value="'+value+'">'+value+'</option>';
					}
				});
				this.html+='</select>';
				this.eventHandler.push({
						function:function(){
							var jqSelectFormName='#'+selectFormName;
							leaf.setValue($(jqSelectFormName).val());
						},
						id: selectFormName,
						eventName:'change'
					});

			}else{
				console.log('leaf');
				var formName='leafForm';
				var attrButtonName='button'+formName;
				this.generateInput(formName, "number", "text", leaf.values)
				this.eventHandler.push({
					function:function(){
						var jqFormName='#'+formName;
						nodeValue.setValue($(jqFormName).val());
					},
					id:formName,
					eventName:'change'
				});
			}
			this.html+='</div>';
			// displaying GUI
			var jqDivId='#'+this.divId;

			$(jqDivId).html(this.html);

			console.log(jqDivId);

			this.applyEventHandler();
		}
	}

	visitXSDFloatType(xsdFloat){
		if (this.attrManage){
			var attr=this.currentAttr;
			if (xsdFloat.isEnumerated()){
				var selectFormName='select'+this.attrFormName;
				this.html+='<select id="'+selectFormName+'">';
				xsdFloat.enumeration.forEach(function(value){
					if (attr.value==value){
						this.html+='<option value="'+value+'" selected="selected">'+value+'</option>';
					}else{
						this.html+='<option value="'+value+'">'+value+'</option>';
					}
				});
				this.html+='</select>';
				this.eventHandler.push({
						function:function(){
							var jqSelectFormName='#'+selectFormName;
							attr.setValue($(jqSelectFormName).value);
						},
						id: selectFormName,
						eventName:'change'
					});

			}else{
				var formName=this.attrFormName;
				//var attrButtonName='button'+formName;
				this.html+='<input id="'+formName+'" type="number"  step="0.01" value="'+attr.value+'"/>';
				//this.html+='<a id="'+attrButtonName+'" class="waves-effect waves-light btn">Apply</a>';
				this.eventHandler.push({
					function:function(){
						var jqFormName='#'+formName;
						attr.setValue($(jqFormName).val());
						$(jqFormName).val(attr.value);
					},
					id:formName,
					eventName:'change'
				});
			}
		}else{
			if (!this.htmlUpdate){
				this.eventHandler=[];
				this.html= '<div id="extractor' + this.id + 'config" >'

				// generate nav
				this.generatenav();
			}

			var leaf=this.currentNodeValue;
			if (xsdFloat.isEnumerated()){
				this.html+='text';
				var selectFormName='selectNodeValue';
				this.html+='<select id="'+selectFormName+'">';
				xsdFloat.enumeration.forEach(function(value){
					if (leaf.value==value){
						this.html+='<option value="'+value+'" selected="selected">'+value+'</option>';
					}else{
						this.html+='<option value="'+value+'">'+value+'</option>';
					}
				});
				this.html+='</select>';
				this.eventHandler.push({
						function:function(){
							var jqSelectFormName='#'+selectFormName;
							leaf.setValue($(jqSelectFormName).val());
						},
						id: selectFormName,
						eventName:'change'
					});

			}else{
				console.log('leaf');
				this.generateInput(formName, "number", "text", leaf.value)
				this.eventHandler.push({
					function:function(){
						var jqFormName='#'+formName;
						leaf.setValue($(jqFormName).val());
					},
					id:formName,
					eventName:'change'
				});
			}
			this.html+='</div>';
			// displaying GUI
			var jqDivId='#'+this.divId;

			$(jqDivId).html(this.html);

			console.log(jqDivId);

			this.applyEventHandler();
		}
	}

	visitXSDXMLRestrictionType(xsdRestriction){
		console.log("visit restrictionType")
		console.log('this',this)
		console.log('xsdRestriction', xsdRestriction)
		xsdRestriction.baseType.accept(this)
		// this.currentAttr
		// xsdRestriction.accept(this)
	}

	/* Generate the code for the text input value
	 @id of the input element
	 @type of the input element
	 @name value of the label aside the input element
	 @value defalut value of the input element
	*/
	generateInput(id, type, name, value){
		this.html+='<div class="row"><div class="col s12">'
		this.html+= name
		this.html+='<div class="input-field inline">'
		if(value != undefined){
			this.html+='<input id="'+ id +'" type="'+ type +'" value="'+ value +'"/>'
		}else{
			this.html+='<input id="'+ id +'" type="'+ type +'" />'
		}
		this.html+='</div></div>'
	}

	applyEventHandler(){
		this.eventHandler.forEach(function(handler){
			var jqElt
			if(handler.id != undefined &&
				 handler.eventName != undefined &&
			   handler.function != undefined){
				jqElt ='#'+handler.id;
				$(jqElt).on(handler.eventName,handler.function);
			}else{
				alert('applyEventHandler : Event Handler Error'  )
			}
			// init the event on the collapsible class
			$('.collapsible').collapsible({
				 onOpen: function(el){
					 $($(el).find('i')[0]).text('keyboard_arrow_down')
				 },
				 onClose: function(el){
					 $($(el).find('i')[0]).text('keyboard_arrow_right')
				 }
			});
		});
	}
}
