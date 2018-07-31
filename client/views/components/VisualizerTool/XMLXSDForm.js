export class XMLXSDForm{

	/* Constructor
	@xmlxsdObj: XMLXSDObj object
	@id: id of the form (id of the extractor in MongoDB)
	@name: name of the form (name of the extractor)
	@divId: the id of the div which will contain the code of the form
	@visualizer: visualizer which created the XMLXSDForm
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
		this.idFocusedInput = undefined
		this.currentNodeValue = undefined

		this.currentNodeValue = undefined
		this.htmlUpdate=false;
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
	@xmlxsdObj: XMLXSDObj object
	*/
	visitXMLXSDObject(xmlxsdObj){
		// console.log('visitXMLXSDObject',xmlxsdObj);
		var jqDivId='#'+this.divId;

		$(jqDivId).html(this.html);

		var that=this;
		that.stack.push({
			tag:that.name,
			obj:xmlxsdObj.content,
			i:0
		});
		xmlxsdObj.content.accept(that);

	}

	/* Visitor pattern : visit function
	@xmlxsdElt: XMLXSDElt object
	*/
	visitXMLXSDElt(xmlxsdElt){
		// console.log('visitXMLXSDElt',xmlxsdElt);
		var $div = $('<div id="' + this.id + '_extractor" />')
		this.html = $div

		// generate nav
		$div.append(this.generateNav())
		// end generate nav

		// Edit elt
		var $divEditor = $('<div id="'+this.id+'_elt_'+xmlxsdElt.name+'_config" class="editor grey lighten-4"/>');
		$div.append($divEditor)

		var headStack=this.stack[this.stack.length-1];
		var idHeader;
		if (typeof headStack!== 'undefined'){
			idHeader = this.id+'_elt_'+headStack.tag+'_header';
			$divEditor.append(this.generateHeaderContent(idHeader,'keyboard_arrow_down',headStack.tag,false,undefined));
		}else{
			idHeader = this.id+'_elt_'+this.name+'_header';
			$divEditor.append(this.generateHeaderContent(ideHeader,'keyboard_arrow_down',this.name,false, undefined));
		}
		var that=this;
		this.addEventEditorHeader(idHeader);
		var idBody = this.id+'_elt_'+this.name+'_body';
		var $divBody =$('<div id="'+idBody+'" class="editor-body row"/>')
		$divEditor.append($divBody)

		xmlxsdElt.eltsList.forEach(function(elt,i){
			var idName=that.id+'_elt_'+xmlxsdElt.name+'_'+i+'_element';
			var idClear = idName+'_clear';
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
							if(typeof that.visualizer !== 'undefined' &&
							deleted ){
								that.visualizer.notifyAll();
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
			var idEltAdd=that.id+'_elt_'+xmlxsdElt.name +'_add';

			$divBody.append(that.generateHeaderContent(idEltAdd, 'add_circle',
			 	xmlxsdElt.name, false, undefined))

			this.eventHandler.push({
				function:function(){
					xmlxsdElt.type.accept(xmlxsdElt);
					// add a new element
					xmlxsdElt.type.accept(xmlxsdElt);
					// move into the new element
					var eltsList = xmlxsdElt.eltsList;
					var newElt = eltsList[eltsList.length - 1]
					that.displayedElement =newElt;
					newElt.accept(that);
					that.stack.push({
						tag:xmlxsdElt.name,
						obj:newElt,
						i:eltsList.length - 1
					});
					if(typeof that.visualizer !== 'undefined'){
						that.visualizer.notifyAll();
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
	@xmlxsdSeq: XMLXSDSequence object
	*/
	visitXMLXSDSequence(xmlxsdSeq){
		this.eventHandler=[];
		var that=this;
		// console.log('visitXMLXSDSeq',xmlxsdSeq);

		var $div = $('<div id="'+ this.id + '_extractor"/>')
		this.html = $div
		// generate nav
		$div.append(this.generateNav());

		var $divEditor = $('<div id="'+this.id+'_seq_'+xmlxsdSeq.name+'_config" class="editor grey lighten-4"/>');
		$div.append($divEditor)

		var idHeader = this.id+"_seq_"+xmlxsdSeq.name+"_header";
		var deletable = false
		var idClearHeader = idHeader + '_clear';
		if(this.stack.length > 1){
			var lastElement = this.stack[this.stack.length - 1]
			var parentElement = this.stack[this.stack.length - 2]
			if(typeof parentElement.obj !== 'undefined' &&
				typeof parentElement.obj.name !== 'undefined' &&
				parentElement.obj.name === 'sequence'){
				var xmlxsdElt = $(parentElement.obj.seqList[0]).filter(function(){
					return this.name === lastElement.tag
				})[0]
				var deletable = xmlxsdElt.canBeDeleted(lastElement.i);
					if(deletable){
						this.eventHandler.push({
							function:function(){
								var duration = 500 // 500ms
								$(this).parent().parent().fadeOut(duration);
								that.displayedElement = parentElement;
								that.stack.pop();
								setTimeout(function() {
									var deleted = xmlxsdElt.deleteElement(lastElement.i);
									parentElement.obj.accept(that);
									if(typeof that.visualizer !== 'undefined' &&
									deleted ){
										that.visualizer.notifyAll();
									}
								}, duration);
							},
							id:idClearHeader,
							eventName: 'click'
						})
					}
				}
		}

		$divEditor.append(this.generateHeaderContent(idHeader,'keyboard_arrow_down',
		 	this.stack[this.stack.length-1].tag, deletable, idClearHeader));

		this.addEventEditorHeader(idHeader);

		var idBody = this.id+'_seq_'+xmlxsdSeq.name+'_body';
		var $divBody = $('<div id="'+idBody+'" class="editor-body row"/>');
		$divEditor.append($divBody)

		$divBody.append(this.generateAttrsForm(xmlxsdSeq));

		xmlxsdSeq.seqList.forEach(function(seq,k){
			seq.forEach(function(xmlxsdElt,j){

				xmlxsdElt.eltsList.forEach(function(elt,i){
					var idName= that.id+'_elt_'+xmlxsdElt.name+'_'+k+'-'+j+'-'+i+'_element';
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
									if(typeof that.visualizer !== 'undefined' &&
									deleted ){
										that.visualizer.notifyAll();
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
					var idEltAdd=that.id+'_elt_'+xmlxsdElt.name+'_add_'+k+'-'+j;

					$divBody.append(that.generateHeaderContent(idEltAdd, 'add_circle',
					 	xmlxsdElt.name, false, undefined));

					that.eventHandler.push({
						function:function(){
							// add a new element
							xmlxsdElt.type.accept(xmlxsdElt);
							// move into the new element
							var eltsList = xmlxsdElt.eltsList;
							var newElt = eltsList[eltsList.length - 1]
							that.displayedElement =newElt;
							newElt.accept(that);
							that.stack.push({
								tag:xmlxsdElt.name,
								obj:newElt,
								i:eltsList.length - 1
							});
							if(typeof that.visualizer !== 'undefined'){
								that.visualizer.notifyAll();
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
	@xmlxsdExt: XMLXSDExtensionType object
	*/
	visitXMLXSDExtensionType(xmlxsdExt){
		// console.log('visit XMLXSDExt',xmlxsdExt);
		this.eventHandler=[];
		var that = this;

		var $div = $('<div id="'+ this.id +'_extractor" />');
		this.html = $div;

		// generate nav
		$div.append(this.generateNav());

		var $divEditor = $('<div id="'+this.id+'_ext_'+xmlxsdExt.name+'_config" class="editor grey lighten-4"/>');
		$div.append($divEditor);
		var idHeader = this.id+'_ext_'+xmlxsdExt.name+'_header'
		var deletable = false
		var idClearHeader = idHeader + '_clear';
		if(this.stack.length > 1){
			var lastElement = this.stack[this.stack.length - 1]
			var parentElement = this.stack[this.stack.length - 2]

			if(typeof parentElement.obj !== 'undefined' &&
				typeof parentElement.obj.name !== 'undefined' &&
				parentElement.obj.name === 'sequence'){
				var xmlxsdElt = $(parentElement.obj.seqList[0]).filter(function(){
					return this.name === lastElement.tag
				})[0]
				var deletable = xmlxsdElt.canBeDeleted(lastElement.i);
					if(deletable){
						this.eventHandler.push({
							function:function(){
								var duration = 500 // 500ms
								$(this).parent().parent().fadeOut(duration);
								that.displayedElement = parentElement;
								that.stack.pop();
								setTimeout(function() {
									var deleted = xmlxsdElt.deleteElement(lastElement.i);
									parentElement.obj.accept(that);
									if(typeof that.visualizer !== 'undefined' &&
									deleted ){
										that.visualizer.notifyAll();
									}
								}, duration);
							},
							id:idClearHeader,
							eventName: 'click'
						})
					}
				}
		}

		$divEditor.append(this.generateHeaderContent(idHeader,'keyboard_arrow_down',
		 	this.stack[this.stack.length-1].tag,deletable, idClearHeader));

		this.addEventEditorHeader(idHeader)

		var idBody = this.id+'_ext_'+xmlxsdExt.name+'_body'
		var $divBody = $('<div id="'+idBody+'" class="editor-body row"/>');
		$divEditor.append($divBody);

		$divBody.append(this.generateAttrsForm(xmlxsdExt));
		this.currentNodeValue=xmlxsdExt;

		this.htmlUpdate=true;
		xmlxsdExt.baseType.accept(this);
		this.htmlUpdate=false;

	}

	/* Visitor pattern : visit function
	@xsdBool: XSDBooleanType object
	*/
	visitXSDBooleanType(xsdBool){
		if (this.attrManage){
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
			var formName=this.attrFormName;
			this.inputHtml = this.generateSelect(formName,[true, false], value, disabled);

			this.addEventInput(formName)
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
	@xsdDeci: XSDDecimalType object
	*/
	visitXSDDecimalType(xsdDeci){
		if (this.attrManage){
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
			var formName=this.attrFormName;
			if (xsdDeci.isEnumerated()){
				this.inputHtml = this.generateSelect(formName, xsdDeci.enumeration, value, disabled);
			}else{
				this.inputHtml = this.generateInput(formName, 'number', undefined, value, disabled);
			}
			this.addEventInput(formName)
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
	@xsdFloat: XSDFloatType object
	*/
	visitXSDFloatType(xsdFloat){
		if (this.attrManage){
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
			var formName=this.attrFormName;
			if (xsdFloat.isEnumerated()){
				this.inputHtml = this.generateSelect(formName, xsdFloat.enumeration, value, disabled);
			}else{
				this.inputHtml = this.generateInput(formName, 'number', 0.01, value, disabled);
			}
			this.addEventInput(formName)
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
	@xsdInt: XSDIntegerType object
	*/
	visitXSDIntegerType(xsdInt){
		if (this.attrManage){
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
			var formName=this.attrFormName;
			if (xsdInt.isEnumerated()){
				this.inputHtml = this.generateSelect(formName, xsdInt.enumeration, value, disabled);
			}else{
				this.inputHtml = this.generateInput(formName, 'number', 1, value, disabled);
			}
			this.addEventInput(formName)

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
	@xsdString: XSDStringType object
	*/
	visitXSDStringType(xsdString){
		// console.log('visit XSDStringType')
		var that = this
		if (this.attrManage){
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
			var formName=this.attrFormName;
			if (xsdString.isEnumerated()){
				this.inputHtml = this.generateSelect(formName, xsdString.enumeration, value, disabled)
			}
			else{
				this.inputHtml = this.generateInput(formName, 'text', undefined, value, disabled);
			}
			this.addEventInput(formName)
		}
		else
		{
			if (!this.htmlUpdate){
				this.eventHandler=[];
				var $div = $('<div id="extractor' + this.id + 'config"/>');
				this.html = $div

				// generate nav
				$div.append(this.generateNav());

				var $ul = $('<ul id="typestringconfig" class="editor row grey lighten-4"/>');
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
	@xsdVoid: XSDVoidType object
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
	@xsdRestriction: XSDRestrictionType object
	*/
	visitXSDRestrictionType(xsdRestriction){
		var type = xsdRestriction.baseType;
		type.accept(this)
	}

	/* Generate the code navigation bar for the form
	@returns: the code for the navigation bar
	*/
	generateNav(){
		// console.log('this.stack', this.stack)
		var nbElementByNav = 3;
		var result = '';
		var lineNumber = 0;
		result += '<div class="row nav-line" id="'+ this.id + '_'+lineNumber+'_nav">';
		result += '<nav>';
		result += '<div class="nav-wrapper">'
		result += '<div class="col s12">'
		var nbCharacter = 0
		var nbCharacterRow = 0
		var sizeRow = 24
		var that=this;
		this.stack.forEach(function(elm,i){
			var idName=that.id+'_'+i+'_element';
			if (i!==that.stack.length-1){
				if(elm.tag.length > 24){
					nbCharacter = 24
				}else{
					nbCharacter = elm.tag.length
				}
				if(nbCharacterRow + nbCharacter > sizeRow){
					result += '</div>';
					result += '</nav>';
					result += '</div>';
					lineNumber++;
					result += '<div class="row nav-line" id="'+ that.id + '_'+lineNumber+'_nav">'
					result +=' <nav>';
					result +=' <div class="nav-wrapper">';
					result += '<div class="col s12">';
					nbCharacterRow = 0;
				}
				nbCharacterRow += nbCharacter;
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
	@id: identifiant of the hedaer
	@icon: icon place before the nameHeader can be none
	@nameHeader: name of the header
	@deletable: boolean to display or not the clear element
	@returns: the code for the header element
	*/
	generateHeaderContent(id, icon, nameHeader,deletable, idClear){
		var result = '';
		var sizeHeader = 12;
		if(deletable){
			sizeHeader -= 2;
		}
		result+='<div class="row indigo lighten-2">';
		result+='<div id="'+id+'" class="editor-header valign-wrapper white-text col s'+sizeHeader+'">';
		result+= '<i class="material-icons small col s2" title="'+TAPi18n.__('add_element')+'">'+icon+'</i>';
		result+= '<div class="col s10">';
		result+= nameHeader;
		result+='</div>';
		result+='</div>';
		if(deletable && typeof idClear !=='undefined'){
			result+='<div class="white-text">'
			result+='<i id="'+idClear+'" class="deleteButton material-icons small right" title="'+TAPi18n.__('remove_element')+'">remove_circle</i>';
			result+='</div>'
		}
		result+='</div>';
		result = $.parseHTML(result);
		if(icon === "keyboard_arrow_down"){
			$(result).children('.editor-header').prop('opened', true);
		}else if(icon == "keyboard_arrow_right"){
			$(result).children('.editor-header').prop('opened', false);
		}
		return result;
	}

	/* Generate the code for the attribute of the xmlxsd
	@obj: a xmlxsd complexType or simpleType
	@returns: the code for the attributes
	*/
	generateAttrsForm(obj){
		var that=this;
		var result = '';
		$.each(obj.attrs,function(key,attr){
			var formName=that.id+'_'+attr.name+'_form';
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
							if(typeof that.visualizer !== 'undefined' &&
							 typeof value !== 'undefined'){
								 that.visualizer.notifyAll();
							 }
						} else if($(jqSwitchName).prop('checked') &&
						 	typeof attr.fixedValue !== 'undefined'){
							$(jqFormName).prop("disabled", true)
							attr.setValue(value);
							$(jqFormName).val(value)
							if(typeof value !== 'undefined'){
								 that.visualizer.notifyAll();
							 }

						}else{
							// when switch not checked
							$(jqFormName).prop("disabled", true);
							attr.setValue(undefined);
							$(jqFormName).val(undefined)
							if(typeof that.visualizer !== 'undefined'){
								that.visualizer.notifyAll();
							}
						}

						// reinitialize the material select with the new propertie
						if($(jqFormName).prop('localName') === "select"){
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
	 @id: of the input element
	 @type: of the input element
	 @step: of the input element only for the number
	 @value: default value of the input element
	 @returns: the code for the input element
	*/
	generateInput(id, type, step, defaultValue, disabled){
		var result =''
		result+='<input id="'+ id +'" class="white style-input-xmlform" type="'+ type +'" '
		if(type === "number" && typeof step !== 'undefined'){
			result+='step="'+ step +'" '
		}
		if(typeof defaultValue !== 'undefined'){
			result+='value="'+ defaultValue +'" '
		}
		if(disabled){
			result+='disabled '
		}
		result+='/>'
		return result
	}

	/* Generate the code for the select element
	@id: of the select element
	@enumeration: the list of the option
	@default: the default value of the selected option
	@result
	*/
	generateSelect(id, enumValues, defaultValue,disabled){
		var result = ''
		var that = this
		if(disabled){
			result+='<select id="'+ id +'" class="default-browser white style-input-xmlform" disabled>'
		}else{
			result+='<select id="'+ id +'" class="default-browser white style-input-xmlform">'
		}
		if(typeof defaultValue !== 'undefined'){
			result+='<option value="" disabled>'+TAPi18n.__('choose_option')+'</option>'
		}else{
			result+='<option value="" selected="selected" disabled>'+TAPi18n.__('choose_option')+'</option>'
		}
		enumValues.forEach(function(option){
			if (defaultValue === option){
				result+='<option value="'+option+'" selected="selected">'+option+'</option>';
				var isSelected = true
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
		$('#'+this.divId).find('select').material_select()
	}

	/* Add the event for the editor header to eventHandler
	@idHeader: id of the header
	*/
	addEventEditorHeader(idHeader){
		this.eventHandler.push({
			function:function(){
				var divBody = $(this).parent().parent().children('.editor-body')
				if(divBody.length === 1){
					if($(this).prop('opened')){
						var maxHeight = $(divBody).prop('scrollHeight');
						$(divBody).css('overflow', 'hidden');
						$(divBody).css('max-height', 0+'px');
						$(this).children('i').text('keyboard_arrow_right')
						$(this).prop('opened', false)
					}else{
						var maxHeight = $(divBody).prop('scrollHeight');
						$(divBody).css('max-height', maxHeight+'px');
						// Add a delay before change the overflow property
						// the duration of the delay depend of the time of the transition
						// The transition properties are defined in main.css .editor-body
						setTimeout(function() {
							$(divBody).css('overflow', 'visible');
						},500)

						$(this).children('i').text('keyboard_arrow_down')
						$(this).prop('opened', true)
					}
				}
			},
			id: idHeader,
			eventName:'click'
		})
	}

	/* Add the events for the input
	@idInput: id of the input
	*/
	addEventInput(idInput){
		var that = this;
		// event to set the id of the focused element
		this.eventHandler.push({
			function:function(){
				that.idFocusedInput = idInput;
			},
			id:idInput,
			eventName:'focus'
		})
		var attr=this.currentAttr;
		// event to set the new value of the attr
		this.eventHandler.push({
			function:function(){
				var jqIdInput='#'+idInput;
				var oldValue = attr.value;
				attr.setValue($(jqIdInput).val());
				var newValue = attr.value;
				$(jqIdInput).val(newValue);
				if(typeof that.visualizer !== 'undefined' &&
					oldValue !== newValue){
					that.visualizer.notifyAll();
				}
			},
			id: idInput,
			eventName:'change'
		});
		// event to reset the id of the focused element
		this.eventHandler.push({
			function:function(){
				that.idFocusedInput = undefined;
			},
			id:idInput,
			eventName:'focusout'
		})
	}

	/* Display the form
	* call by the tool of visualisation (time line, overlay)
	@stack: Array of JSON Object {tag:String, obj:XMLXSDElment}
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
		this.xmlxsdObj = this.visualizer.getXMLXSDObj();

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

		// set the input focused
		var focusedInput = $('#'+this.divId).find('#'+this.idFocusedInput)
		if(typeof this.idFocusedInput !== 'undefined' &&
			focusedInput.length === 1){
			$(focusedInput).focus();
		}
	}

}
