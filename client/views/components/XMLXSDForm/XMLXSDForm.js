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
			obj:xmlxsdObj.content,
			i:0
		});
		xmlxsdObj.content.accept(that);

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
		var $divEditor = $('<div id="elt'+xmlxsdElt.name+'config" class="editor"/>');
		$div.append($divEditor)

		var headStack=this.stack[this.stack.length-1];
		var idHeader;
		if (typeof headStack!== 'undefined'){
			idHeader = this.id+'_header_elt'+headStack.tag+'config';
			$divEditor.append(this.generateHeaderContent(idHeader,'keyboard_arrow_down',headStack.tag,false,undefined));
		}else{
			idHeader = this.id+'_header'+this.name+'config';
			$divEditor.append(this.generateHeaderContent(ideHeader,'keyboard_arrow_down',this.name,false, undefined));
		}
		var that=this;
		this.eventHandler.push({
			function:function(){
				that.eventEditorHeader(this);
			},
			id:idHeader,
			eventName:'click'
		});
		var $divBody =$('<div class="editor-body row"/>')
		$divEditor.append($divBody)

		xmlxsdElt.eltsList.forEach(function(elt,i){
			var idName=that.id+'_elt'+xmlxsdElt.name+i+'config';
			var idClear = that.id+'_'+idName+'_clear';
			var $divElement = $('<div class="editor-element"/>');
			$divBody.append($divElement);
			// check if the element can be delete or not
			if (xmlxsdElt.eltsList.length!=xmlxsdElt.minOccurs){
				$divElement.append(that.generateHeaderContent(idName, 'keyboard_arrow_right',
					xmlxsdElt.name,true, idClear));
			}
			else{
				$divElement.append(that.generateHeaderContent(idName,'keyboard_arrow_right',
					xmlxsdElt.name,false, undefined));
			}

			that.eventHandler.push({
				function:function(){
					that.stack.push({
						tag:xmlxsdElt.name,
						obj:xmlxsdElt.eltsList[0],
						i:0
					});
					that.displayedElement = elt
					elt.accept(that);
				},
				id:idName,
				eventName:'click'
			});

			if (xmlxsdElt.eltsList.length!=xmlxsdElt.minOccurs){
				that.eventHandler.push({
					function:function(){
						var duration = 500 // 500ms
						$(this).parent().fadeOut(duration);
						that.displayedElement = xmlxsdElt
						// wait the end of the animation fadeOut to remove the element
						setTimeout(function() {
							var deleted = xmlxsdElt.deleteElement(i);
							xmlxsdElt.accept(that);
							if(typeof visualizer !== 'undefined' &&
							deleted ){
								visualizer.notifyAll();
							}
						}, duration);
					},
					id:idClear,
					eventName:'click'
				});
			};

		});
		//Bouton d'ajout d'elt si nécessaire
		if (xmlxsdElt.eltsList.length!=xmlxsdElt.maxOccurs){
			var idEltAdd=that.id+'_'+xmlxsdElt.name +'_add';

			// $li = $('<li>');
			// $ul.append($li)
			$divBody.append(that.generateHeaderContent(idEltAdd, 'add_circle',
			 	xmlxsdElt.name, false, undefined))

			this.eventHandler.push({
				function:function(){
					xmlxsdElt.type.accept(xmlxsdElt);
					that.displayedElement = xmlxsdElt;
					xmlxsdElt.accept(that);
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
		var that=this;
		// console.log('visitXMLXSDSeq',xmlxsdSeq);

		var $div = $('<div id="extractor' + this.id + 'config"/>')
		this.html = $div
		var visualizer = this.visualizer
		// generate nav
		$div.append(this.generateNav());

		var $divEditor = $('<div id="seq'+xmlxsdSeq.name+'config" class="editor"/>');
		$div.append($divEditor)

		var idHeader = this.id+"_header_seq"+xmlxsdSeq.name+"configTitle";
		$divEditor.append(this.generateHeaderContent(idHeader,'keyboard_arrow_down',
		 	this.stack[this.stack.length-1].tag, false, undefined));

		this.eventHandler.push({
				function:function(){
					that.eventEditorHeader(this);
				},
				id:idHeader,
				eventName:'click'
			});

		var $divBody = $('<div id="seq'+xmlxsdSeq.name+'configContent" class="editor-body row"/>');
		$divEditor.append($divBody)

		$divBody.append(this.generateAttrsForm(xmlxsdSeq));

		xmlxsdSeq.seqList.forEach(function(seq,k){
			seq.forEach(function(xmlxsdElt,j){

				xmlxsdElt.eltsList.forEach(function(elt,i){
					var idName= that.id+'_elt'+xmlxsdElt.name+k+'_'+j+'_'+i+'config';
					var idClear = idName+'_clear';
					var $divElement = $('<div class="editor-element"/>');
					$divBody.append($divElement)

					if(xmlxsdElt.eltsList.length!=xmlxsdElt.minOccurs){
						$divElement.append(that.generateHeaderContent(idName,'keyboard_arrow_right',
							xmlxsdElt.name,true, idClear));
					}else{
						$divElement.append(that.generateHeaderContent(idName,'keyboard_arrow_right',
						 	xmlxsdElt.name,false, undefined));
					}


					that.eventHandler.push({
						function:function(){
							that.stack.push({
								tag:xmlxsdElt.name,
								obj:xmlxsdElt.eltsList[i],
								i:i
							});
							that.displayedElement = elt
							elt.accept(that);
						},
						id:idName,
						eventName:'click'
					});

					if (xmlxsdElt.eltsList.length!=xmlxsdElt.minOccurs){
						that.eventHandler.push({
							function:function(){
								var duration = 500 // 500ms
								$(this).parent().fadeOut(duration);
								that.displayedElement = xmlxsdSeq;

								setTimeout(function() {
									var deleted = xmlxsdElt.deleteElement(i);
									xmlxsdSeq.accept(that);
									if(typeof visualizer !== 'undefined' &&
									deleted ){
										visualizer.notifyAll();
									}
								}, duration);
							},
							id:idClear,
							eventName:'click'
						});
					};

				});

				//Bouton d'ajout d'elt si nécessaire
				if (xmlxsdElt.eltsList.length!=xmlxsdElt.maxOccurs){
					var idEltAdd=that.id+'_'+xmlxsdElt.name +'add'+k+'_'+j;

					$divBody.append(that.generateHeaderContent(idEltAdd, 'add_circle',
					 	xmlxsdElt.name, false, undefined));

					that.eventHandler.push({
						function:function(){
							xmlxsdElt.type.accept(xmlxsdElt);
							that.displayedElement = xmlxsdSeq;
							xmlxsdSeq.accept(that);
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
		var that = this;

		var $div = $('<div id="extractor' + this.id + 'config" />');
		this.html = $div;

		// generate nav
		$div.append(this.generateNav());

		var $divEditor = $('<div id="ext'+xmlxsdExt.name+'config" class="editor"/>');
		$div.append($divEditor);
		var idHeader = this.id+'_header_ext'+xmlxsdExt.name+'configTitle'
		$divEditor.append(this.generateHeaderContent(idHeader,'keyboard_arrow_down',
		 	this.stack[this.stack.length-1].tag,false, undefined));

		this.eventHandler.push({
				function:function(){
					that.eventEditorHeader(this);
				},
				id:idHeader,
				eventName:'click'
			});

		var $divBody = $('<div id="ext'+xmlxsdExt.name+'configContent" class="editor-body row"/>');
		$divEditor.append($divBody);

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
			var selectFormName=this.id+'_'+this.attrFormName;
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
				var $ul = $('<ul id="typefloatconfig" class="editor"/>');
				$div.append($ul)
				var $li = $('<li/>')
				$ul.append($li)

				var headStack=this.stack[this.stack.length-1];
				if (typeof headStack !== 'undefined'){
					$li.append(this.generateHeaderContent('','keyboard_arrow_down',
						headStack.tag,false, undefined));
				}else{
					$li.append(this.generateHeaderContent('','keyboard_arrow_down',
						this.name,false, undefined));
				}
				var $divBody =$('<div class="editor-body row"/>')
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
				var selectFormName=this.id+'_'+this.attrFormName;
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
				var formName=this.id+'_'+this.attrFormName;
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
					eventName:'change'
				});
			}
		}else{
			if (!this.htmlUpdate){
				this.eventHandler=[];
				var $div = $('<div id="extractor' + this.id + 'config"/>');
				this.html = $div

				// generate nav
				$div.append(this.generateNav());

				var $ul = $('<ul id="typeintegerconfig" class="editor row"/>');
				$div.append($ul)
				var $li = $('<li/>')
				$ul.append($li)

				var headStack=this.stack[this.stack.length-1];
				if (typeof headStack !== 'undefined'){
					$li.append(this.generateHeaderContent('','keyboard_arrow_down',
						headStack.tag,false, undefined));
				}else{
					$li.append(this.generateHeaderContent('','keyboard_arrow_down',
						this.name,false, undefined));
				}
				var $divBody =$('<div class="editor-body row"/>')
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
				var selectFormName=this.id+'_'+this.attrFormName;
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
				var formName=this.id+'_'+this.attrFormName;
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
					eventName:'change'
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
				var $ul = $('<ul id="typefloatconfig" class="editor row"/>');
				$div.append($ul)
				var $li = $('<li/>')
				$ul.append($li)

				var headStack=this.stack[this.stack.length-1];
				if (typeof headStack !== 'undefined'){
					$li.append(this.generateHeaderContent('','keyboard_arrow_down',
						headStack.tag,false, undefined));
				}else{
					$li.append(this.generateHeaderContent('','keyboard_arrow_down',
						this.name,false, undefined));
				}
				var $divBody =$('<div class="editor-body row"/>')
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
				var selectFormName=this.id+'_'+this.attrFormName;
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
				var formName=this.id+'_'+this.attrFormName;
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
					eventName:'change'
				});
			}
		}else{
			if (!this.htmlUpdate){
				this.eventHandler=[];
				var $div = $('<div id="extractor' + this.id + 'config"/>');
				this.html = $div

				// generate nav
				$div.append(this.generateNav());

				var $ul = $('<ul id="typeintegerconfig" class="editor row"/>');
				$div.append($ul)
				var $li = $('<li/>')
				$ul.append($li)

				var headStack=this.stack[this.stack.length-1];
				if (typeof headStack!== 'undefined'){
					$li.append(this.generateHeaderContent('','keyboard_arrow_down',
						headStack.tag,false, undefined));
				}else{
					$li.append(this.generateHeaderContent('','keyboard_arrow_down',
						this.name,false, undefined));
				}
				var $divBody =$('<div class="editor-body row"/>')
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
				var selectFormName=this.id+'_'+this.attrFormName;
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
				var formName=this.id+'_'+this.attrFormName;
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

				var $ul = $('<ul id="typestringconfig" class="editor row"/>');
				$div.append($ul)
				var $li = $('<li/>')
				$ul.append($li)

				var headStack=this.stack[this.stack.length-1];
				if (typeof headStack !== 'undefined'){
					$li.append(this.generateHeaderContent('','keyboard_arrow_down',
						headStack.tag,false, undefined));
				}else{
					$li.append(this.generateHeaderContent('','keyboard_arrow_down',
						this.name,false, undefined));
				}
				var $divBody =$('<div class="editor-body row"/>')
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

			var $ul = $('<ul id="typevoidconfig" class="editor row"/>');
			$div.append($ul)
			var $li = $('<li/>')
			$ul.append($li)

			var headStack=this.stack[this.stack.length-1];
			if (typeof headStack !== 'undefined'){
				$li.append(this.generateHeaderContent('','keyboard_arrow_down',
					headStack.tag,false, undefined));
			}else{
				$li.append(this.generateHeaderContent('','keyboard_arrow_down',
					this.name,false,undefined));
			}
			var $divBody =$('<div class="editor-body row"/>')
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
	generateHeaderContent(id, icon, nameHeader,deletable, idClear){
		var result = '';
		var sizeHeader = 12;
		if(deletable){
			sizeHeader -= 2;
		}
		result+='<div id="'+id+'" class="editor-header valign-wrapper blue darken-4 white-text col s'+sizeHeader+'">'
		result+= '<i class="material-icons small col s2">'+icon+'</i>'
		result+= '<div class="col s10">'
		result+= nameHeader
		result+='</div>'
		result+='</div>'
		if(deletable && typeof idClear !=='undefined'){
			result+='<i id="'+idClear+'" class="red-text material-icons small deleteButton col s2"> clear</i>';
		}
		result = $.parseHTML(result);
		if(icon === "keyboard_arrow_down"){
			$(result).prop('opened', true);
			// $(result).addClass('active');
		}else if(icon == "keyboard_arrow_right"){
			$(result).prop('opened', false);
		}
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
		// console.log('this.eventHandler', this.eventHandler);
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

		// click on .editor-header
		// $('#'+this.divId).find('.editor-header').click(function(){
		// })
	}

	/* Event called on the editor header element
	*/
	eventEditorHeader(target){
		var divBody = $(target).parent().children('.editor-body')
		if(divBody.length === 1){
			if($(target).prop('opened')){
				$(divBody).css('padding', '0rem')
				$(divBody).css('max-height', '0px')
				$(target).children('i').text('keyboard_arrow_right')
				$(target).prop('opened', false)
			}else{
				var maxHeight = $(divBody).prop('scrollHeight');
				$(divBody).css('padding', '0.5rem')
				$(divBody).css('max-height', maxHeight+'px');
				$(target).children('i').text('keyboard_arrow_down')
				$(target).prop('opened', true)
			}
		}

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
	}

	/* Observer pattern : update function
	*/
	updateVisualizer(){

		var saveStack = this.stack.slice(0)
		this.eventHandler = [];
		this.stack = [];
		this.xmlxsdObj = this.visualizer.getXmlXsdObj();

		var that = this;

		//Reconstruct the stack from the last stack with new xmlxsdObj
		saveStack.forEach(function(elm,i){
			if(that.stack.length==0){
				that.displayedElement = that.xmlxsdObj.content;
				that.stack.push({
					tag:that.name,
					obj:that.xmlxsdObj.content,
					i:0
				});
			}
			else if(that.stack.length==1){
				that.displayedElement = that.displayedElement.eltsList[0];
				that.stack.push({
					tag:elm.tag,
					obj:that.displayedElement,
					i:0
				});
			}
			else if(elm.obj.name==="sequence" || elm.obj.name==="extension"){
				var displayed = $(that.displayedElement.seqList[0]).filter(function(j,seq){
					return elm.tag===seq.name;
				});

				if(displayed[0].eltsList[elm.i]!=null){
					that.displayedElement = displayed[0].eltsList[elm.i];

					that.stack.push({
						tag:elm.tag,
						obj:that.displayedElement,
						i:elm.i
					});
				}
			}
		});

		this.displayedElement.accept(this)
		var saveEventHandler = this.eventHandler.slice(0);

		this.eventHandler = [];

		var parentNav = $('#' + this.divId).children(':first');
		$(parentNav).children('div[class~="nav-line"]').remove();
		$(parentNav).prepend(this.generateNav());

		// apply the event of the generate stack
		this.applyEventHandler();

		// restore the save eventHandler before the generateNav
		this.eventHandler = saveEventHandler;
	}

}
