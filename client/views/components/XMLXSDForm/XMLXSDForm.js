export class XMLXSDForm{

	/* Constructor
	@xmlxsdObj : XMLXSDObj object
	@id : id of the form (id of the extractor in MongoDB)
	@name : name of the form (name of the extractor)
	@divId : the id of the div which will contain the code of the form
	*/
	constructor(xmlxsdObj,id,name,divId, visualizer){
		this.xmlxsdObj=xmlxsdObj;
		this.id=id;
		this.name=name;
		this.divId=divId;
		this.visualizer = visualizer
		this.displayedElement = xmlxsdObj;
		this.html="";

		this.eventHandler=[];

		//the stack contains JSON objects {tag:'String', obj:'XMLXSDObject'}
		this.stack=[];

		// management of the attributs
		this.attrManage=false;
		this.attrFormName="";
		this.inputHtml="";
		this.currentNodeValue = undefined

		this.currentNodeValue = undefined
		this.htmlUpdate=false;
	}

	setVisualizer(visualizer){
		this.visualizer = visualizer
	}

	equals(object){
		var result = false;
		if(typeof this === typeof object){
			result = this.id === object.id &&
				this.name === object.name &&
				this.divId === object.divId
		}
		return result
	}

	/* Generate the code of the form
	*/
	generateForm(){
		this.xmlxsdObj.accept(this);
	}

	/* Visitor pattern : visit function
	@xmlxsdObj : XMLXSDObj object
	*/
	visitXMLXSDObject(xmlxsdObj){
		// console.log('visitXMLXSDObject',xmlxsdObj);

		var jqDivId='#'+this.divId;

		$(jqDivId).html(this.html);


		// console.log($(jqIdconfig));
		var that=this;
		//  Appear at the same time
		// $(jqIdconfig).click(function(){
		that.stack.push({
			tag:that.name,
			obj:xmlxsdObj.content
		});
		xmlxsdObj.content.accept(that);
		var ul = $("#" + this.divId).find('ul')[0]
		$(ul).collapsible('open', 0)
		$($($(ul).find('.collapsible-header')[0]).find('i')[0]).text('keyboard_arrow_down')

		// });
	}

	/* Visitor pattern : visit function
	@xmlxsdElt : XMLXSDElt object
	*/
	visitXMLXSDElt(xmlxsdElt){
		// console.log('visitXMLXSDElt',xmlxsdElt);
		var $div = $('<div id="extractor' + this.id + 'config" />')
		var visualizer = this.visualizer
		this.html = $div

		// generate nav
		$div.append(this.generateNav())
		// end generate nav

		// Edit elt
		var $ul = $('<ul id="elt'+xmlxsdElt.name+'config" class="collapsible"/>');
		$div.append($ul)
		var $li = $('<li/>')
		$ul.append($li)

		var headStack=this.stack[this.stack.length-1];
		if (typeof headStack!== 'undefined'){
			$li.append(this.generateHeaderContent('','keyboard_arrow_right',headStack.tag,false));
		}else{
			$li.append(this.generateHeaderContent('','keyboard_arrow_right',this.name,false));
		}
		var $divBody =$('<div class="collapsible-body"/>')
		$li.append($divBody)
		$ul = $('<ul id="ulElt'+xmlxsdElt.name+'config" class="collapsible"/>');
		$divBody.append($ul)
		var that=this;
		xmlxsdElt.eltsList.forEach(function(elt,i){
			var idName=that.id+'_elt'+xmlxsdElt.name+i+'config';

			$li = $('<li/>');
			$ul.append($li)
			// check if the element can be delete or not
			if (xmlxsdElt.eltsList.length!=xmlxsdElt.minOccurs){
				$li.append(that.generateHeaderContent(idName, 'keyboard_arrow_right',xmlxsdElt.name,true));
			}
			else{
				$li.append(that.generateHeaderContent(idName,'keyboard_arrow_right', xmlxsdElt.name,false));
			}

			that.eventHandler.push({
				function:function(){
					that.stack.push({
						tag:xmlxsdElt.name,
						obj:xmlxsdElt.eltsList[0]
					});
					that.displayedElement = elt
					elt.accept(that);
					var ul = $("#" + that.divId).find('ul')[0]
					$(ul).collapsible('open', 0)
					$($($(ul).find('.collapsible-header')[0]).find('i')[0]).text('keyboard_arrow_down')
				},
				id:idName,
				eventName:'click'
			});

			if (xmlxsdElt.eltsList.length!=xmlxsdElt.minOccurs){
				that.eventHandler.push({
					function:function(){
						var deleted = xmlxsdElt.deleteElement(i);
						that.displayedElement = xmlxsdElt
						xmlxsdElt.accept(that);
						var ul = $("#" + that.divId).find('ul')[0]
						$(ul).collapsible('open', 0)
						$($($(ul).find('.collapsible-header')[0]).find('i')[0]).text('keyboard_arrow_down')
						if(typeof visualizer !== 'undefined' &&
							deleted ){
							visualizer.notifyAll();
						}
					},
					id:idName+'clear',
					eventName:'click'
				});
			};

		});
		//Bouton d'ajout d'elt si nécessaire
		if (xmlxsdElt.eltsList.length!=xmlxsdElt.maxOccurs){
			var idEltAdd='elt'+xmlxsdElt.name +'add';

			$li = $('<li>');
			$ul.append($li)
			$li.append(that.generateHeaderContent(idEltAdd, 'add_circle', xmlxsdElt.name, false))

			this.eventHandler.push({
				function:function(){
					xmlxsdElt.type.accept(xmlxsdElt);
					that.displayedElement = xmlxsdElt;
					xmlxsdElt.accept(that);
					var ul = $("#" + that.divId).find('ul')[0]
					$(ul).collapsible('open', 0)
					$($($(ul).find('.collapsible-header')[0]).find('i')[0]).text('keyboard_arrow_down')
					if(typeof visualizer !== 'undefined'){
						visualizer.notifyAll();
					}
				},
				id:idEltAdd,
				eventName:'click'
			});
		}
		// displaying GUI
		var jqDivId='#'+this.divId;
		$(jqDivId).html(this.html);

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

	/* Visitor pattern : visit function
	@xmlxsdSeq : XMLXSDSequence object
	*/
	visitXMLXSDSequence(xmlxsdSeq){
		this.eventHandler=[];
		// console.log('visitXMLXSDSeq',xmlxsdSeq);

		var $div = $('<div id="extractor' + this.id + 'config"/>')
		this.html = $div
		var visualizer = this.visualizer
		// generate nav
		$div.append(this.generateNav());

		var $ul = $('<ul id="seq'+xmlxsdSeq.name+'config" class="collapsible"/>');
		$div.append($ul)
		var $li = $('<li>')
		$ul.append($li)
		$li.append(this.generateHeaderContent("seq"+xmlxsdSeq.name+"configTitle",'keyboard_arrow_right', this.stack[this.stack.length-1].tag, false));
		var $divBody = $('<div id="seq'+xmlxsdSeq.name+'configContent" class="collapsible-body"/>');
		$li.append($divBody)

		$divBody.append(this.generateAttrsForm(xmlxsdSeq));

		var that=this;

		$ul = $('<ul id="ulxmlxsdSeqconfig" class="collaspsible"/>');
		$divBody.append($ul)

		xmlxsdSeq.seqList.forEach(function(seq,k){
			seq.forEach(function(xmlxsdElt,j){

				xmlxsdElt.eltsList.forEach(function(elt,i){
					var idName=that.id+'_elt'+xmlxsdElt.name+k+'_'+j+'_'+i+'config';

					$li = $('<li/>');
					$ul.append($li)
					if(xmlxsdElt.eltsList.length!=xmlxsdElt.minOccurs){
						$li.append(that.generateHeaderContent(idName,'keyboard_arrow_right', xmlxsdElt.name,true));
					}else{
						$li.append(that.generateHeaderContent(idName,'keyboard_arrow_right', xmlxsdElt.name,false));
					}

					that.eventHandler.push({
						function:function(){
							that.stack.push({
								tag:xmlxsdElt.name,
								obj:xmlxsdElt.eltsList[i]
							});
							that.displayedElement = elt
							elt.accept(that);
							var ul = $("#" + that.divId).find('ul')[0]
							$(ul).collapsible('open', 0)
							$($($(ul).find('.collapsible-header')[0]).find('i')[0]).text('keyboard_arrow_down')
						},
						id:idName,
						eventName:'click'
					});

					if (xmlxsdElt.eltsList.length!=xmlxsdElt.minOccurs){
						that.eventHandler.push({
							function:function(){
								var deleted = xmlxsdElt.deleteElement(i);
								that.displayedElement = xmlxsdSeq;
								console.log('delete sequence')
								xmlxsdSeq.accept(that);
								var ul = $("#" + that.divId).find('ul')[0]
								$(ul).collapsible('open', 0)
								$($($(ul).find('.collapsible-header')[0]).find('i')[0]).text('keyboard_arrow_down')
								if(typeof visualizer !== 'undefined' &&
									deleted ){
									visualizer.notifyAll();
								}
							},
							id:idName+'clear',
							eventName:'click'
						});
					};

				});

				//Bouton d'ajout d'elt si nécessaire
				if (xmlxsdElt.eltsList.length!=xmlxsdElt.maxOccurs){
					var idEltAdd='elt'+xmlxsdElt.name +'add'+k+'_'+j;

					$li =$('<li/>');
					$ul.append($li)
					$li.append(that.generateHeaderContent(idEltAdd, 'add_circle', xmlxsdElt.name, false));

					that.eventHandler.push({
						function:function(){
							xmlxsdElt.type.accept(xmlxsdElt);
							that.displayedElement = xmlxsdSeq;
							xmlxsdSeq.accept(that);
							var ul = $("#" + that.divId).find('ul')[0]
							$(ul).collapsible('open', 0)
							$($($(ul).find('.collapsible-header')[0]).find('i')[0]).text('keyboard_arrow_down')
							if(typeof visualizer !== 'undefined'){
								visualizer.notifyAll();
							}

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

		// displaying GUI
		var jqDivId='#'+this.divId;

		$(jqDivId).html(this.html);


		this.applyEventHandler();
	}

	/* Visitor pattern : visit function
	@xmlxsdNodeValue: XMLXSDNodeValue object
	*/
	visitXMLXSDNodeValue(xmlxsdNodeValue){
		// console.log('visit nodeValue',xmlxsdNodeValue);
		this.currentNodeValue=xmlxsdNodeValue;
		// console.log('nodeValue', xmlxsdNodeValue)
		xmlxsdNodeValue.type.accept(this);
	}

	/* Visitor pattern : visit function
	@xmlxsdExt : XMLXSDExtensionType object
	*/
	visitXMLXSDExtensionType(xmlxsdExt){
		// console.log('visit XMLXSDExt',xmlxsdExt);
		this.eventHandler=[];

		var $div = $('<div id="extractor' + this.id + 'config" />');
		this.html = $div;

		// generate nav
		$div.append(this.generateNav());

		var $ul = $('<ul id="ext'+xmlxsdExt.name+'config" class="collapsible"/>');
		$div.append($ul);
		var $li =$('<li/>');
		$ul.append($li);
		$li.append(this.generateHeaderContent('ext'+xmlxsdExt.name+'configTitle','keyboard_arrow_down',this.stack[this.stack.length-1].tag,false));
		var $divBody = $('<div id="ext'+xmlxsdExt.name+'configContent" class="collapsible-body row"/>');
		$li.append($divBody);

		$divBody.append(this.generateAttrsForm(xmlxsdExt));
		this.currentNodeValue=xmlxsdExt;

		this.htmlUpdate=true;
		xmlxsdExt.baseType.accept(this);
		this.htmlUpdate=false;

	}

	/* Visitor pattern : visit function
	@xsdBool : XSDBooleanType object
	*/
	visitXSDBooleanType(xsdBool){
		if (this.attrManage){
			var visualizer = this.visualizer
			var attr=this.currentAttr;
			var disabled;
			var value;
			if((attr.use === "optional" && typeof attr.value === 'undefined')
				||typeof attr.fixedValue !== 'undefined'){
				disabled = true;
			}else{
				disabled = false
			}
			if(typeof attr.fixedValue !== 'undefined'){
				value = attr.fixedValue
			}
			else if(typeof attr.value !== 'undefined'){
				value = attr.value;
			}else if(typeof attr.defaultValue !== 'undefined'){
				value = attr.defaultValue;
			}
			var selectFormName=this.attrFormName;
			this.inputHtml = this.generateSelect(selectFormName,[true, false], value, disabled);
			this.eventHandler.push({
					function:function(){
						var jqSelectFormName='#'+selectFormName;
						var oldValue = attr.value;
						attr.setValue($(jqSelectFormName).val());
						newValue = attr.value;
						$(jqSelectFormName).val(newValue);
						if(typeof visualizer !== 'undefined' &&
							oldValue !== newValue){
							visualizer.notifyAll();
						}
					},
					id: selectFormName,
					eventName:'change'
				});
		}else{
			if (!this.htmlUpdate){
				this.eventHandler=[];
				var $div = $('<div id="extractor' + this.id + 'config"/>');
				this.html = $div

				// generate nav
				$div.append(this.generateNav());
				var $ul = $('<ul id="typefloatconfig" class="collapsible"/>');
				$div.append($ul)
				var $li = $('<li/>')
				$ul.append($li)

				var headStack=this.stack[this.stack.length-1];
				if (typeof headStack !== 'undefined'){
					$li.append(this.generateHeaderContent('','keyboard_arrow_right',headStack.tag,false));
				}else{
					$li.append(this.generateHeaderContent('','keyboard_arrow_right',this.name,false));
				}
				var $divBody =$('<div class="collapsible-body"/>')
				$li.append($divBody)
			}

			// displaying GUI
			var jqDivId='#'+this.divId;

			$(jqDivId).html(this.html);

			this.applyEventHandler();
		}
	}

	/* Visitor pattern : visit function
	@xsdDeci : XSDDecimalType object
	*/
	visitXSDDecimalType(xsdDeci){
		if (this.attrManage){
			var visualizer = this.visualizer
			var attr=this.currentAttr;
			var disabled;
			var value;
			if((attr.use === "optional" && typeof attr.value === 'undefined')
				||typeof attr.fixedValue !== 'undefined'){
				disabled = true;
			}else{
				disabled = false
			}

			if(typeof attr.fixedValue !=='undefined'){
				value = attr.fixedValue
			}else if(typeof attr.value !== 'undefined'){
				value = attr.value;
			}else if(typeof attr.defaultValue !== 'undefined'){
				value = attr.defaultValue;
			}

			if (xsdDeci.isEnumerated()){
				var selectFormName=this.attrFormName;
				this.inputHtml = this.generateSelect(selectFormName, xsdDeci.enumeration, value, disabled);

				this.eventHandler.push({
						function:function(){
							var jqSelectFormName='#'+selectFormName;
							var oldValue = attr.value;
							attr.setValue($(jqSelectFormName).val());
							newValue = attr.value;
							$(jqSelectFormName).val(newValue);
							if(typeof visualizer !== 'undefined' &&
								oldValue !== newValue){
								visualizer.notifyAll();
							}
						},
						id: selectFormName,
						eventName:'change'
					});
			}else{
				var formName=this.attrFormName;
				this.inputHtml = this.generateInput(formName, "number", undefined, value, disabled);

				this.eventHandler.push({
					function:function(){
						var jqFormName='#'+formName;
						var oldValue = attr.value;
						attr.setValue($(jqFormName).val());
						newValue = attr.value;
						$(jqFormName).val(newValue);
						if(typeof visualizer !== 'undefined' &&
							oldValue !== newValue){
							visualizer.notifyAll();
						}
					},
					id:formName,
					eventName:'focusout'
				});
			}
		}else{
			if (!this.htmlUpdate){
				this.eventHandler=[];
				var $div = $('<div id="extractor' + this.id + 'config"/>');
				this.html = $div

				// generate nav
				$div.append(this.generateNav());

				var $ul = $('<ul id="typeintegerconfig" class="collapsible"/>');
				$div.append($ul)
				var $li = $('<li/>')
				$ul.append($li)

				var headStack=this.stack[this.stack.length-1];
				if (typeof headStack !== 'undefined'){
					$li.append(this.generateHeaderContent('','keyboard_arrow_right',headStack.tag,false));
				}else{
					$li.append(this.generateHeaderContent('','keyboard_arrow_right',this.name,false));
				}
				var $divBody =$('<div class="collapsible-body"/>')
				$li.append($divBody)
			}

			// displaying GUI
			var jqDivId='#'+this.divId;

			$(jqDivId).html(this.html);

			// console.log(jqDivId);

			this.applyEventHandler();
		}
	}

	/* Visitor pattern : visit function
	@xsdFloat : XSDFloatType object
	*/
	visitXSDFloatType(xsdFloat){
		if (this.attrManage){
			var visualizer = this.visualizer
			var attr=this.currentAttr;
			var disabled;
			var value;
			if((attr.use === "optional" && typeof attr.value === 'undefined')
				||typeof attr.fixedValue !== 'undefined'){
				disabled = true;
			}else{
				disabled = false
			}
			if(typeof attr.fixedValue !==  'undefined'){
				value = attr.fixedValue
			}
			else if(typeof attr.value !== 'undefined'){
				value = attr.value;
			}else if(typeof attr.defaultValue !== 'undefined'){
				value = attr.defaultValue;
			}
			if (xsdFloat.isEnumerated()){
				var selectFormName=this.attrFormName;
				this.inputHtml = this.generateSelect(selectFormName, xsdFloat.enumeration, value, disabled);
				this.eventHandler.push({
						function:function(){
							var jqSelectFormName='#'+selectFormName;
							var oldValue = attr.value;
							attr.setValue($(jqSelectFormName).val());
							newValue = attr.value;
							$(jqSelectFormName).val(newValue);
							if(typeof visualizer !== 'undefined' &&
								oldValue !== newValue){
								visualizer.notifyAll();
							}
						},
						id: selectFormName,
						eventName:'change'
					});

			}else{
				var formName=this.attrFormName;
				this.inputHtml = this.generateInput(formName, "number", 0.01, value, disabled);

				this.eventHandler.push({
					function:function(){
						var jqFormName='#'+formName;
						var oldValue = attr.value;
						attr.setValue($(jqFormName).val());
						newValue = attr.value;
						$(jqFormName).val(newValue);
						if(typeof visualizer !== 'undefined' &&
							oldValue !== newValue){
							visualizer.notifyAll();
						}
					},
					id:formName,
					eventName:'focusout'
				});
			}
			return result
		}else{
			if (!this.htmlUpdate){
				this.eventHandler=[];
				var $div = $('<div id="extractor' + this.id + 'config"/>');
				this.html = $div

				// generate nav
				$div.append(this.generateNav());
				var $ul = $('<ul id="typefloatconfig" class="collapsible"/>');
				$div.append($ul)
				var $li = $('<li/>')
				$ul.append($li)

				var headStack=this.stack[this.stack.length-1];
				if (typeof headStack !== 'undefined'){
					$li.append(this.generateHeaderContent('','keyboard_arrow_right',headStack.tag,false));
				}else{
					$li.append(this.generateHeaderContent('','keyboard_arrow_right',this.name,false));
				}
				var $divBody =$('<div class="collapsible-body"/>')
				$li.append($divBody)
			}

			// displaying GUI
			var jqDivId='#'+this.divId;

			$(jqDivId).html(this.html);

			this.applyEventHandler();
		}
	}

	/* Visitor pattern : visit function
	@xsdInt : XSDIntegerType object
	*/
	visitXSDIntegerType(xsdInt){
		if (this.attrManage){
			var visualizer = this.visualizer
			var attr=this.currentAttr;
			var disabled;
			var value;
			if((attr.use === "optional" && typeof attr.value === 'undefined')
				||typeof attr.fixedValue !== 'undefined'){
				disabled = true;
			}else{
				disabled = false
			}
			if(typeof attr.fixedValue !== 'undefined'){
				value = attr.fixedValue
			}
			else if(typeof attr.value !== 'undefined'){
				value = attr.value;
			}else if(typeof attr.defaultValue !== 'undefined'){
				value = attr.defaultValue;
			}
			// console.log('XSD int', xsdInt)
			if (xsdInt.isEnumerated()){
				var selectFormName=this.attrFormName;
				this.inputHtml = this.generateSelect(selectFormName, xsdInt.enumeration, value, disabled);

				this.eventHandler.push({
						function:function(){
							var jqSelectFormName='#'+selectFormName;
							var oldValue = attr.value;
							attr.setValue($(jqSelectFormName).val());
							newValue = attr.value;
							$(jqSelectFormName).val(newValue);
							if(typeof visualizer !== 'undefined' &&
								oldValue !== newValue){
								visualizer.notifyAll();
							}
						},
						id: selectFormName,
						eventName:'change'
					});
			}else{
				var formName=this.attrFormName;
				this.inputHtml = this.generateInput(formName, "number", undefined, value, disabled);

				this.eventHandler.push({
					function:function(){
						var jqFormName='#'+formName;
						var oldValue = attr.value;
						attr.setValue($(jqFormName).val());
						newValue = attr.value;
						$(jqFormName).val(newValue);
						if(typeof visualizer !== 'undefined' &&
							oldValue !== newValue){
							visualizer.notifyAll();
						}
					},
					id:formName,
					eventName:'focusout'
				});
			}
		}else{
			if (!this.htmlUpdate){
				this.eventHandler=[];
				var $div = $('<div id="extractor' + this.id + 'config"/>');
				this.html = $div

				// generate nav
				$div.append(this.generateNav());

				var $ul = $('<ul id="typeintegerconfig" class="collapsible"/>');
				$div.append($ul)
				var $li = $('<li/>')
				$ul.append($li)

				var headStack=this.stack[this.stack.length-1];
				if (typeof headStack!== 'undefined'){
					$li.append(this.generateHeaderContent('','keyboard_arrow_right',headStack.tag,false));
				}else{
					$li.append(this.generateHeaderContent('','keyboard_arrow_right',this.name,false));
				}
				var $divBody =$('<div class="collapsible-body"/>')
				$li.append($divBody)
			}

			// displaying GUI
			var jqDivId='#'+this.divId;

			$(jqDivId).html(this.html);


			this.applyEventHandler();
		}
	}

	/* Visitor pattern : visit function
	@xsdString : XSDStringType object
	*/
	visitXSDStringType(xsdString){
		// console.log('visit XSDStringType')
		var that = this
		if (this.attrManage){
			var visualizer = this.visualizer
			var attr=this.currentAttr;
			var disabled;
			var value;
			if((attr.use === "optional" && typeof attr.value === 'undefined')
				||typeof attr.fixedValue !== 'undefined'){
				disabled = true;
			}else{
				disabled = false
			}
			if(typeof attr.fixedValue !== 'undefined'){
				value = attr.fixedValue;
			}else if(typeof attr.value !== 'undefined'){
				value = attr.value;
			}else if(typeof attr.defaultValue !== 'undefined'){
				value = attr.defaultValue;
			}
			if (xsdString.isEnumerated()){
				var selectFormName=this.attrFormName;
				this.inputHtml = this.generateSelect(selectFormName, xsdString.enumeration, value, disabled);

				this.eventHandler.push({
					function:function(){
						var jqSelectFormName='#'+selectFormName;
						var oldValue = attr.value;
						attr.setValue($(jqSelectFormName).val());
						newValue = attr.value;
						$(jqSelectFormName).val(newValue);
						if(typeof visualizer !== 'undefined' &&
							oldValue !== newValue){
							visualizer.notifyAll();
						}
					},
					id: selectFormName,
					eventName:'change'
				});

			}else{
				var formName=this.attrFormName;
				this.inputHtml = this.generateInput(formName, "text", undefined, value, disabled);
				this.eventHandler.push({
					function:function(){
						var jqFormName='#'+formName;
						var oldValue = attr.value;
						attr.setValue($(jqFormName).val());
						newValue = attr.value;
						if(typeof visualizer !== 'undefined' &&
							oldValue !== newValue){
							visualizer.notifyAll();
						}
					},
					id:formName,
					eventName:'focusout'
				});
			}
		}
		else
		{
			if (!this.htmlUpdate){
				this.eventHandler=[];
				var $div = $('<div id="extractor' + this.id + 'config"/>');
				this.html = $div

				// generate nav
				$div.append(this.generateNav());

				var $ul = $('<ul id="typestringconfig" class="collapsible"/>');
				$div.append($ul)
				var $li = $('<li/>')
				$ul.append($li)

				var headStack=this.stack[this.stack.length-1];
				if (typeof headStack !== 'undefined'){
					$li.append(this.generateHeaderContent('','keyboard_arrow_right',headStack.tag,false));
				}else{
					$li.append(this.generateHeaderContent('','keyboard_arrow_right',this.name,false));
				}
				var $divBody =$('<div class="collapsible-body"/>')
				$li.append($divBody)
			}

			// displaying GUI
			var jqDivId='#'+this.divId;

			$(jqDivId).html(this.html);

			this.applyEventHandler();
		}

	}

	/* Visitor pattern : visit function
	@xsdVoid : XSDVoidType object
	*/
	visitXSDVoidType(xsdVoidType){
		// console.log('htmlUpdate', !this.htmlUpdate)
		if (!this.htmlUpdate){
			this.eventHandler=[];
			var $div = $('<div id="extractor' + this.id + 'config"/>');
			this.html = $div
			// this.html= '<div id="extractor' + this.id + 'config" >'

			// generate nav
			$div.append(this.generateNav());
			// this.html+=this.generateNav();

			var $ul = $('<ul id="typevoidconfig" class="collapsible"/>');
			$div.append($ul)
			var $li = $('<li/>')
			$ul.append($li)

			var headStack=this.stack[this.stack.length-1];
			if (typeof headStack !== 'undefined'){
				$li.append(this.generateHeaderContent('','keyboard_arrow_right',headStack.tag,false));
			}else{
				$li.append(this.generateHeaderContent('','keyboard_arrow_right',this.name,false));
			}
			var $divBody =$('<div class="collapsible-body"/>')
			$li.append($divBody)
		}
		// displaying GUI
		var jqDivId='#'+this.divId;

		$(jqDivId).html(this.html);

		this.applyEventHandler();

		// console.log('vide:', xsdVoidType)
	}

	/* Visitor pattern : visit function
	@xsdRestriction XSDRestrictionType object
	*/
	visitXSDRestrictionType(xsdRestriction){
		var type = xsdRestriction.baseType;
		type.accept(this)
	}

	/* Generate the code navigation bar for the form
	@return the code for the navigation bar
	*/
	generateNav(){
		var nbElementByNav = 3
		var result = ''
		result += '<div class="row nav-line" id="nav-'+ this.id + '_config">'
		result += '<nav>'
		result += '<div class="nav-wrapper">'
		result += '<div class="col s12">'
		var nbCharacter = 0
		var nbCharacterRow = 0
		var sizeRow = 24
		var that=this;
		this.stack.forEach(function(elm,i){
			var idName=that.id+'navConfig'+i;
			if (i!==that.stack.length-1){
				if(elm.tag.length > 24){
					nbCharacter = 24
				}else{
					nbCharacter = elm.tag.length
				}
				if(nbCharacterRow + nbCharacter > sizeRow){
					// add empty breadcrumb for trigger before style in scss
					// result += '<a id="'+that.id+'navConfig'+i+'" class="breadcrumb"/>';
					result += '</div>';
					result += '</nav>'
					result += '</div>'
					result += '<div class="row nav-line" id="nav-'+ that.id + '_config">'
					result +=' <nav>'
					result +=' <div class="nav-wrapper">'
					result += '<div class="col s12">'
					nbCharacterRow = 0
				}
				nbCharacterRow += nbCharacter
				result+='<a id="'+idName+'" class="breadcrumb">' + elm.tag.substr(0,sizeRow) +'</a>';
			}

			that.eventHandler.push({
				function:function(){
					that.stack=that.stack.slice(0,i + 1);
					that.displayedElement = elm.obj
					elm.obj.accept(that);
					var ul = $("#" + that.divId).find('ul')[0]
					$(ul).collapsible('open', 0)
					$($($(ul).find('.collapsible-header')[0]).find('i')[0]).text('keyboard_arrow_down')
				},
				id:idName,
				eventName:'click'
			});
		});
		result += '</div>';
		result += '</nav>'
		result += '</div>';
		return result
	}

	/* Generate the code for content of the header in this.html
	@id identifiant of the hedaer
	@icon icon place before the nameHeader can be none
	@nameHeader name of the header
	@deletable boolean to display or not the clear element
	@return the code for the header element
	*/
	generateHeaderContent(id, icon, nameHeader,deletable){
		var result = ''
		result+='<div id="'+id+'" class="collapsible-header white-text">'
		result+='<div class="col s2">'
		result+= '<i class="material-icons">'+icon+'</i>'
		result+= '</div>'
		result+= '<div class="col s8">'
		result+= nameHeader
		result+='</div>'
		result+='<div class="col s2">'
		if(deletable){
			result+='<i id="'+id+'clear" class="red darken-4 material-icons tiny deleteButton"> clear</i>';
		}
		result+='</div>'
		result+='</div>'
		return result;
	}

	/* Generate the code for the attribute of the xmlxsd
	@obj a xmlxsd complexType or simpleType
	@return the code for the attributes
	*/
	generateAttrsForm(obj){
		var that=this;
		var result = '';
		var visualizer = this.visualizer;
		$.each(obj.attrs,function(key,attr){
			var formName=attr.name+'form';
			var jqFormName='#'+formName;
			var switchName=attr.name+'switch';
			var jqSwitchName='#'+switchName;
			var sizeInput = 12
			result += '<div class="row">';

			// console.log('attr', attr)
			// console.log('attr.use', attr.use)
			switch(attr.use){
				case 'optional' :
				sizeInput = 9
				result +='<div class="switch col s3"><label>Off';
				if (typeof attr.value !== 'undefined'){
					result+='<input id="'+switchName+'" type= "checkbox" checked/>';
				}else{
					result+='<input id="'+switchName+'" type = "checkbox"/>';
				}
				result+='<span class = "lever"></span>On</label></div>';
				that.eventHandler.push({
					function:function(){
						var value;
						if(typeof attr.fixedValue !== 'undefined'){
							value = attr.fixedValue
						}else if(typeof attr.value !== 'undefined'){
							value = attr.value;
						}else if(typeof attr.defaultValue !== 'undefined'){
							value = attr.defaultValue;
						}

						if($(jqSwitchName).prop('checked') &&
							typeof attr.fixedValue === 'undefined'){
							$(jqFormName).prop("disabled", false)
							attr.setValue(value);
							$(jqFormName).val(value)
							if(typeof visualizer !== 'undefined' &&
							 typeof value !== 'undefined'){
								 visualizer.notifyAll();
							 }
						} else if($(jqSwitchName).prop('checked') &&
						 	typeof attr.fixedValue !== 'undefined'){
							$(jqFormName).prop("disabled", true)
							attr.setValue(value);
							$(jqFormName).val(value)
							if(typeof value !== 'undefined'){
								 visualizer.notifyAll();
							 }

						}else{
							// when switch not checked
							$(jqFormName).prop("disabled", true);
							attr.setValue(undefined);
							$(jqFormName).val(undefined)
							if(typeof visualizer !== 'undefined'){
								visualizer.notifyAll();
							}
						}

						// reinitialize the material select with the new propertie
						if($(jqFormName)[0].localName === "select"){
							$(jqFormName).material_select()
						}

					},
					id: switchName,
					eventName:'change'
				});
				break;
				case 'required' :
				// that.html+='<li>'
				break;
			}
			if (attr.use!=="prohibited"){
				result+='<div class="col s'+ sizeInput +'">'
				result+=attr.name + ' : '
				that.attrManage=true;
				that.attrFormName=formName;
				that.currentAttr=attr;

				result+='<div class="input-field inline">'
				attr.type.accept(that);
				result +=that.inputHtml
				result+='</div>'

				that.attrManage=false;
				result+='</div>'
			}
			result+='</div>'
		})
		return result
	}

	/* Generate the code for the text input value
	 @id of the input element
	 @type of the input element
	 @step of the input element only for the number
	 @value default value of the input element
	 @returns the code for the input element
	*/
	generateInput(id, type, step, value, disabled){
		var result =''
		result+='<input id="'+ id +'" type="'+ type +'" '
		if(type === "number" && typeof step !== 'undefined'){
			result+='step="'+ step +'" '
		}
		if(typeof value !== 'undefined'){
			result+='value="'+ value +'" '
		}
		if(disabled){
			result+='disabled '
		}
		result+='/>'
		return result
	}

	/* Generate the code for the select element
	@id of the select element
	@enumeration the list of the option
	@default the default value of the selected option
	@result
	*/
	generateSelect(id, enumValues, defaultValue,disabled){
		var result = ''
		var that = this
		if(disabled){
			result+='<select id="'+ id +'" class="default-browser" disabled>'
		}else{
			result+='<select id="'+ id +'" class="default-browser">'
		}
		if(typeof defaultValue !== 'undefined'){
			result+='<option value="" disabled>Choose your option</option>'
		}else{
			result+='<option value="" selected="selected" disabled>Choose your option</option>'
		}
		enumValues.forEach(function(option){
			if (defaultValue === option){
				result+='<option value="'+option+'" selected="selected">'+option+'</option>';
				isSelected = true
			}else{
				result+='<option value="'+option+'">'+option+'</option>';
			}
		})
		result+='</select>'
		return result
	}

	/* Apply the event of this.eventHandler and	initialize some element
	*/
	applyEventHandler(){
		this.eventHandler.forEach(function(handler){
			var jqElt
			if(typeof handler.id !== 'undefined' &&
				 typeof handler.eventName !== 'undefined' &&
			   typeof handler.function !== 'undefined'){
				jqElt ='#'+handler.id;
				$(jqElt).on(handler.eventName,handler.function);
			}else{
				alert('applyEventHandler : Event Handler Error'  )
			}
		});
		// init the select elements
		$('select').material_select()

		// init the event on the collapsible class
		$('.collapsible').collapsible({
			onOpen: function(el){
				$($(el).find('i')[0]).text('keyboard_arrow_down')
			},
			onClose: function(el){
				$($(el).find('i')[0]).text('keyboard_arrow_right')
			}
		});
	}

	/* Display the form
	* call by the tool of visualisation (time line, overlay)
	@stack Array of JSON Object {tag:String, obj:XMLXSDElment}
	*/
	displayForm(stack){
		this.stack = stack;
		this.eventHandler = []
		if(stack.length > 0){
			this.displayedElement =	stack[stack.length - 1].obj
		}else{
			this.displayedElement = this.xmlxsdObj
		}
		this.displayedElement.accept(this)
		var ul = $("#" + this.divId).find('ul')[0]
		$(ul).collapsible('open', 0)
		$($($(ul).find('.collapsible-header')[0]).find('i')[0]).text('keyboard_arrow_down')
	}

	/* Observer pattern : update function
	*/
	update(){
			var saveStack = this.stack.slice(0)
			this.eventHandler = [];
			this.displayedElement.accept(this)
			var saveEventHandler = this.eventHandler.slice(0);

			// restore the save stack before accept
			this.stack = saveStack;

			this.eventHandler = [];
			var parentNav = $('#' + this.divId).children(':first');
			$(parentNav).children('div[class~="nav-line"]').remove();
			$(parentNav).prepend(this.generateNav());

			// apply the event of the generate stack
			this.applyEventHandler();

			// restore the save eventHandler before the generateNav
			this.eventHandler = saveEventHandler;

			if($('#'+ this.divId).css('display') !== 'none'){
				var ul = $("#" + this.divId).find('ul')[0]
				$(ul).collapsible('open', 0)
				$($($(ul).find('.collapsible-header')[0]).find('i')[0]).text('keyboard_arrow_down')
			}
	}
}
