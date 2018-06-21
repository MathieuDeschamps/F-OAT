export class XMLGenerator{
	constructor(xmlxsdObj){
		console.log('xmlxsdObj', xmlxsdObj)
		this.xmlxsdObj=xmlxsdObj;

		this.xml=undefined;

		this.errorDone=true;
		this.errorMessage="";
	}

	/* Generate the XML
	@return: the xml generate of the XMLXSDObject
	*/
	generateXML(){
		this.errorMessage="";
		this.xml="";
		this.xmlxsdObj.content.accept(this);
		if (this.xml==undefined){
			this.errorMessage
			return undefined;
		}
		return this.xml;
	}


	getErrorMessage(){
			return this.errorMessage;
	}

	/* Visitor pattern : visit function
	@xmlxsdElt : XMLXSDElt object
	*/
	visitXMLXSDElt(xmlxsdElt){
		if (xmlxsdElt.eltsList.length<xmlxsdElt.minOccurs){
			this.errorMessage+="Too few elements "+xmlxsdElt.name+'.\n';

			this.xml=undefined;
		} else {
			if (xmlxsdElt.eltsList.length>xmlxsdElt.maxOccurs){
				this.errorMessage+="Too much elements "+xmlxsdElt.name+'.\n';
				this.errorDone=true;
				this.xml=undefined;
			} else {
				var that=this;
				xmlxsdElt.eltsList.forEach(function(elt){
					if (that.xml!=undefined){
						that.xml+="<"+xmlxsdElt.name+">";
						elt.accept(that);
						if (that.xml!=undefined){
							that.xml+="</"+xmlxsdElt.name+">";
						} else {
							if (!that.errorDone){
								that.errorMessage+=xmlxsdElt.name+" is incorrect.\n";
								that.errorDone=true;
							}
						}
					}
				});
			}
		}
	}

	/* Visitor pattern : visit function
	@xmlxsdSeq : XMLXSDSequence object
	*/
	visitXMLXSDSequence(xmlxsdSeq){
		// On enlève le ">" du tag
		if (this.xml!=undefined){
			this.xml=this.xml.substr(0,this.xml.length-1);
			var that=this;
			$.each(xmlxsdSeq.attrs,function(key,xmlxsdAttr){
				if (that.xml!=undefined){
					// console.log(xmlxsdAttr);
					xmlxsdAttr.accept(that);
				};
			});

			if (xmlxsdSeq.seqList.length<xmlxsdSeq.minO){
				this.errorDone=false;
				this.errorMessage+='Sequence incomplete.\n';
				this.xml=undefined;
			} else if (xmlxsdSeq.seqList.length>xmlxsdSeq.maxO){
				this.errorDone=false;
				this.errorMessage+='Sequence too long.\n';
				this.xml=undefined;
			}
			if (this.xml!=undefined){
				// On remet le ">" enlevé.
				this.xml+='>';
				xmlxsdSeq.seqList.forEach(function(seq){
					seq.forEach(function(elt){
						if (that.xml!=undefined){
							elt.accept(that);
						}
					});
				});
			}
		}
	}

	/* Visitor pattern : visit function
	@xmlxsdAttr: XMLXSDAttr objects
	*/
	visitXMLXSDAttr(xmlxsdAttr){
		// console.log('XMLGenerator Attr :',xmlxsdAttr.name,xmlxsdAttr.use,xmlxsdAttr.value);
		if (this.xml!=undefined){
			if (xmlxsdAttr.value!=undefined && (xmlxsdAttr.type.holds(xmlxsdAttr.value)) && xmlxsdAttr.use!="prohibited"){
				this.xml+=' '+xmlxsdAttr.name+'="'+xmlxsdAttr.value+'"';
			} else {
				// console.log('XMLGenerator Attr 1');
				if (xmlxsdAttr.value!=undefined){
					if (xmlxsdAttr.use=="prohibited"){
						this.errorMessage+=xmlxsdAttr.name + " is prohibited.\n";
						this.xml=undefined;
					} else {
						if (!xmlxsdAttr.type.holds(xmlxsdAttr.value)){
							this.errorMessage+=xmlxsdAttr.value+ "does not follow the type of "+xmlxsdAttr.name+".\n";
							this.xml=undefined;
						}
					}
				} else {
					if (xmlxsdAttr.use=="required"){
						this.errorMessage+=xmlxsdAttr.name + " is required.\n";
						this.errorDone=false;
						this.xml=undefined;
					}
				}
			}
		}
		// console.log('XMLGenerator Attr 2');
	}

	/* Visitor pattern : visit function
	@xmlxsdNodeValue: XMLXSDNodeValue object
	*/
	visitXMLXSDNodeValue(xmlxsdNodeValue){
		if (this.xml!=undefined){
			if (xmlxsdNodeValue.type.holds(xmlxsdNodeValue.value)){
				this.xml+=xmlxsdNodeValue.value
			} else {
				this.errorMessage+=xmlxsdNodeValue.value + 'does not fit node type.\n';
				this.errorDone=false;
				this.xml=undefined;
			}
		}
	}

	/* Visitor pattern : visit function
	@xmlxsdExt : XMLXSDExtensionType object
	*/
	visitXMLXSDExtensionType(xmlxsdElt){
		if (this.xml!=undefined){
			this.xml=this.xml.substr(0,this.xml.length-1);
			var that=this;
			$.each(xmlxsdElt.attrs,function(key,xmlxsdAttr){
				if (that.xml!=undefined){
					xmlxsdAttr.accept(that);
				};
			});
			if (this.xml!=undefined){
				this.xml+='>';
				if (xmlxsdElt.baseType.holds(xmlxsdElt.value)){
					if(typeof xmlxsdElt.value !== 'undefined'){
						this.xml+=xmlxsdElt.value;
					}
				} else {
					this.errorMessage+=xmlxsdElt.value + 'does not fit base type.\n';
					this.errorDone=false;
					this.xml=undefined;
				}
			}
		}
	}
}
