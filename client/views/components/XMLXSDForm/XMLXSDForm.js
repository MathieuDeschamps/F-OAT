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
		
		
		this.html= '<div id="extractor' + this.id + 'config" >'
		this.html +=' <nav id="nav-'+ this.id + 'config">'
		this.html += '<div class="nav-wrapper white-text blue darken-4 row">'
		this.html += '<div class="col s12" id="anchor">'
		this.html += '<a id="'+this.id+'config" >' + this.name +'</a>'
		this.html += '</div></div></nav>'
		this.html += '</div>';
		//this.html+= '<div id="extractor' + this.id + 'configFields" >';
		//this.html+= '</div>';
		
		var jqDivId='#'+this.divId;
		
		$(jqDivId).html(this.html);
		
		
		
		var jqIdconfig='#'+this.id+'config';
		console.log($(jqIdconfig));
		var that=this;
		$(jqIdconfig).click(function(){
			that.stack.push(xmlxsdObj.content);
			xmlxsdObj.content.accept(that);
		});
	}
	
	visitXMLXSDElt(xmlxsdElt){
		console.log('visitXMLXSDElt',xmlxsdElt);
		this.html= '<div id="extractor' + this.id + 'config" >'
		
		// generate nav
		this.generatenav();
		// end generate nav
		
		
		// Edit elt
		this.html+='<div id="elt'+xmlxsdElt.name+'config" class="card row">'; // class? col s12 m6
		var headStack=this.stack[this.stack.length-1];
		if (headStack!=undefined){
			this.html+='<div class="blue darken-4 row white-text">'+headStack.name+'</div>';
		}else{
			this.html+='<div class="blue darken-4 row white-text">'+this.name+'</div>';
		}
		this.html+='<ul id="ulElt'+xmlxsdElt.name+'config" >'; // class?
		var that=this;
		xmlxsdElt.eltsList.forEach(function(elt,i){
			var idName='elt'+xmlxsdElt.name+i+'config';
			
			that.html+='<li>';
			
			that.html+='<div id="'+idName+'" class="col s10 offset-s1 white-text blue darken-4 row btn">';
			that.html+=xmlxsdElt.name;
			that.html+='</div>'
			that.eventHandler.push({
				function:function(){
					that.stack.push(xmlxsdElt); 
					elt.accept(that);
				},
				id:idName,
				eventName:'click'
			});
				
			if (xmlxsdElt.eltsList.length!=xmlxsdElt.minOccurs){
				that.html+='<i id="'+idName+'clear" class="col s1 material-icons"> clear</i>';
				that.eventHandler.push({
					function:function(){
						xmlxsdElt.eltsList.splice(i,1);
						xmlxsdElt.accept(that);
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
				},
				id:idEltAdd,
				eventName:'click'
			});
		}

		//
		this.html+='</div>'
	
		
		
		
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
		
		this.html+='<div id="seq'+xmlxsdSeq.name+'config" class="card">'; // class?
		
		this.html+='<div id="seq'+xmlxsdSeq.name+'configTitle" class="card-title white-text blue darken-4">'+this.stack[this.stack.length-1].name+'</div>'; // class?
		this.html+='<div id="seq'+xmlxsdSeq.name+'configContent" class="card-content ">'
		
		this.generateAttrsForm(xmlxsdSeq);
		
		
		var that=this;
		
		this.html+='<ul id="ulxmlxsdSeqconfig" >'; // class?
		
		xmlxsdSeq.seqList.forEach(function(seq,k){
			seq.forEach(function(xmlxsdElt,j){
				that.html+='<ul id="ulElt'+xmlxsdElt.name+'config" >'; // class?
				
				xmlxsdElt.eltsList.forEach(function(elt,i){
					var idName='elt'+xmlxsdElt.name+k+'_'+j+'_'+i+'config';
			
					that.html+='<li>';
			
					that.html+='<div id="'+idName+'" class="col s10 offset-s1 white-text blue darken-4 row btn">';
					that.html+=xmlxsdElt.name;
					that.html+='</div>'
				
					that.eventHandler.push({
						function:function(){
							that.stack.push(xmlxsdSeq); 
							that.stack.push(xmlxsdElt); 
							console.log('visit XMLXSDSeq ',elt);
							elt.accept(that);
						},
						id:idName,
						eventName:'click'
					});
				
					if (xmlxsdElt.eltsList.length!=xmlxsdElt.minOccurs){
						that.html+='<i id="'+idName+'clear" class="col s1 material-icons"> clear</i>';
						that.eventHandler.push({
							function:function(){
								xmlxsdElt.eltsList.splice(i,1);
								xmlxsdSeq.accept(that);
							},
							id:idName+'clear',
							eventName:'click'
						});
					};
			
					that.html+='</li>';
				});
				that.html+='</ul>';
				
				//Bouton d'ajout d'elt si nécessaire
				if (xmlxsdElt.eltsList.length!=xmlxsdElt.maxOccurs){
					var idEltAdd='elt'+xmlxsdElt.name +'add'+k+'_'+j;
					that.html+='<a id='+idEltAdd+' class="waves-effect waves-light btn">';
					that.html+='<i class="col s1 material-icons large right">add_circle </i>';
					that.html+=xmlxsdElt.name+'</a>';
				
					that.eventHandler.push({
						function:function(){
							console.log(xmlxsdElt.type);
							xmlxsdElt.type.accept(xmlxsdElt);
							xmlxsdSeq.accept(that);
						},
						id:idEltAdd,
						eventName:'click'});
				}
			});
			
			
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
		this.html+='</div>';
		
		
		this.html+='</div>';
		
		
		
		
		// displaying GUI
		var jqDivId='#'+this.divId;
		
		$(jqDivId).html(this.html);
		
		console.log(jqDivId);
		
		this.applyEventHandler();
	}
	
	
	generatenav(){
		this.html +=' <nav id="nav-'+ this.id + 'config">'
		
		this.html += '<div class="nav-wrapper white-text blue darken-4 row">'
		this.html += '<div class="col s12" id="anchor">'
		// breadcrumb --> problème eventhandler
		this.html += '<a id="'+this.id+'config" >' + this.name +'</a>';
		var that=this;
		
		//this.html += '<i class="material-icons">keyboard_arrow_right</i>'
		//this.html += '<a id="'+this.id+'config2" class="breadcrumb">  ' + xmlxsdElt.name +'</a>'		
		//
		
		this.stack.forEach(function(obj,i){
			console.log(obj);
			//if (i!=that.stack.length-1){
				that.html+='<a id="'+that.id+'navConfig'+i+'"> > ' + obj.name +'</a>';
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
		
		this.html+='<div id="seq'+xmlxsdExt.name+'config" class="card">'; // class?
		
		this.html+='<div id="seq'+xmlxsdExt.name+'configTitle" class="card-title white-text blue darken-4">'+this.stack[this.stack.length-1].name+'</div>'; // class?
		this.html+='<div id="seq'+xmlxsdExt.name+'configContent" class="card-content ">'
		
		
		
		this.html+='<div id="xmlxsdExtconfig">'; // class?
		
		this.generateAttrsForm(xmlxsdExt);
		
		
		this.currentNodeValue=xmlxsdExt;
		
		
		this.htmlUpdate=true;
		console.log(xmlxsdExt);
		console.log(xmlxsdExt.baseType);
		xmlxsdExt.baseType.accept(this);
		this.htmlUpdate=false;
		
		this.html+='</div>';
		this.html+='</div>';
	}
	
	
	
	generateAttrsForm(obj){
		console.log('generateAttrsForm',obj.attrs);
		var that=this;
		this.html+='<ul id="ulAttrs'+obj.name+'config" >'; // class?
		$.each(obj.attrs,function(key,attr){
			console.log('generateAttrsForm : ',attr.name,attr);
			var formName=attr.name+'form';
			var jqFormName='#'+formName;
			switch(attr.use){
				case 'optional' :
					that.html+='<li>'+attr.name;
					var switchName=attr.name+'switch';
					if (attr.value!=undefined){
						that.html+='<div class="switch"><label>Off<input id="'+switchName+'" type= "checkbox" checked> <span class = "lever"></span>On</label></div>';
					}else{
						that.html+='<div class="switch"><label>Off<input id="'+switchName+'" type = "checkbox"> <span class = "lever"></span>On</label></div>';
					}
					that.eventHandler.push({
						function:function(){
							var jqSwitchName='#'+switchName;
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
					that.html+='<li>'+attr.name;
					break;
			}
			if (attr.use!="prohibited"){
				that.attrManage=true;
				that.attrFormName=formName;
				that.currentAttr=attr;
				attr.type.accept(that);
				that.attrManage=false;
			}
			that.html+='</li>';
		})
		this.hmlt+='</ul>';
	}
	
	visitXSDStringType(xsdString){
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
				this.html+='<div><textarea id="'+formName+'" class="materialize-textarea">'+attr.value+'</textarea></div>';//
				this.html+='<a id="'+attrButtonName+'" class="waves-effect waves-light btn">Apply</a>';
				this.eventHandler.push({
					function:function(){
						var jqFormName='#'+formName;
						attr.setValue($(jqFormName).val());
						console.log(attr,$(jqFormName).val(),formName);
					},
					id:attrButtonName,
					eventName:'click'
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
			this.html+='<div> Node Value : </div>';
			var nodeValue=this.currentNodeValue;
			if (xsdString.isEnumerated()){
				var selectFormName='selectNodeValue';
				this.html+='<select id="'+selectFormName+'">';
				xsdString.enumeration.forEach(function(value){
					if (nodeValue.value==value){
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
				console.log('nodeValue');
				var formName='nodeValueForm';
				var attrButtonName='button'+formName;
				this.html+='<textarea id="'+formName+'" class="materialize-textarea">'+nodeValue.value+'</textarea>';
				this.html+='<a id="'+attrButtonName+'" class="waves-effect waves-light btn">Apply</a>';
				this.eventHandler.push({
					function:function(){
						var jqFormName='#'+formName;
						nodeValue.setValue($(jqFormName).val());
					},
					id:attrButtonName,
					eventName:'click'
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
				this.html+='<input id="'+formName+'" type="number" class="materialize-textarea" value="'+attr.value+'"/>';
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
			
			var nodeValue=this.currentNodeValue;
			this.html+='<div> Node Value : </div>';
			if (xsdInt.isEnumerated()){
				var selectFormName='selectNodeValue';
				this.html+='<select id="'+selectFormName+'">';
				xsdInt.enumeration.forEach(function(value){
					if (nodeValue.value==value){
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
				console.log('nodeValue');
				var formName='nodeValueForm';
				var attrButtonName='button'+formName;
				this.html+='<input type="number" id="'+formName+'" >'+nodeValue.value+'</input>';
				this.html+='<a id="'+attrButtonName+'" class="waves-effect waves-light btn">Apply</a>';
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
	
	applyEventHandler(){
		this.eventHandler.forEach(function(handler){
			var jqId='#'+handler.id;
			$(jqId).on(handler.eventName,handler.function);
		});
	}
}