export class XMLGenerator{
	constructor(xmlxsdObj){
		this.xmlxsdObj=xmlxsdObj;

		this.xml=undefined;

		this.alertDone=true;
		this.alertMessage="";
	}

	/* Generate the XML
	@return: the xml generate of the XMLXSDObject
	*/
	generateXML(){
		this.alertMessage="";
		this.xml="";
		this.xmlxsdObj.content.accept(this);
		if (this.xml==undefined){
			alert(this.alertMessage);
		}
		return this.xml;
	}

	/* Visitor pattern : visit function
	@xmlxsdElt : XMLXSDElt object
	*/
	visitXMLXSDElt(xmlxsdElt){
		if (xmlxsdElt.eltsList.length<xmlxsdElt.minOccurs){
			this.alertMessage+="Too few elements "+xmlxsdElt.name+'.\n';

			this.xml=undefined;
		} else {
			if (xmlxsdElt.eltsList.length>xmlxsdElt.maxOccurs){
				this.alertMessage+="Too much elements "+xmlxsdElt.name+'.\n';
				this.alertDone=true;
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
							if (!that.alertDone){
								that.alertMessage+=xmlxsdElt.name+" is incorrect.\n";
								that.alertDone=true;
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
					console.log(xmlxsdAttr);
					xmlxsdAttr.accept(that);
				};
			});

			if (xmlxsdSeq.seqList.length<xmlxsdSeq.minO){
				this.alertDone=false;
				this.alertMessage+='Sequence incomplete.\n';
				this.xml=undefined;
			} else if (xmlxsdSeq.seqList.length>xmlxsdSeq.maxO){
				this.alertDone=false;
				this.alertMessage+='Sequence too long.\n';
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
		console.log('XMLGenerator Attr :',xmlxsdAttr.name,xmlxsdAttr.use,xmlxsdAttr.value);
		if (this.xml!=undefined){
			if (xmlxsdAttr.value!=undefined && (xmlxsdAttr.type.holds(xmlxsdAttr.value)) && xmlxsdAttr.use!="prohibited"){
				this.xml+=' '+xmlxsdAttr.name+'="'+xmlxsdAttr.value+'"';
			} else {
				console.log('XMLGenerator Attr 1');
				if (xmlxsdAttr.value!=undefined){
					if (xmlxsdAttr.use=="prohibited"){
						this.alertMessage+=xmlxsdAttr.name + " is prohibited.\n";
						this.xml=undefined;
					} else {
						if (!xmlxsdAttr.type.holds(xmlxsdAttr.value)){
							this.alertMessage+=xmlxsdAttr.value+ "does not follow the type of "+xmlxsdAttr.name+".\n";
							this.xml=undefined;
						}
					}
				} else {
					if (xmlxsdAttr.use=="required"){
						this.alertMessage+=xmlxsdAttr.name + " is required.\n";
						this.alertDone=false;
						this.xml=undefined;
					}
				}
			}
		}
		console.log('XMLGenerator Attr 2');
	}

	/* Visitor pattern : visit function
	@xmlxsdNodeValue: XMLXSDNodeValue object
	*/
	visitXMLXSDNodeValue(xmlxsdNodeValue){
		if (this.xml!=undefined){
			if (xmlxsdNodeValue.type.holds(xmlxsdNodeValue.value)){
			//TODO if (noxmlxsdNodeValuede.value && nxmlxsdNodeValueode.type.holds(nodxmlxsdNodeValuee.value)){
			if(!xmlxsdNodeValue.value == undefined){
				this.xml+=xmlxsdNodeValue.value
			}
			} else {
				this.alertMessage+=xmlxsdNodeValue.value + 'does not fit node type.\n';
				this.alertDone=false;
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
				if (xmlxsdElt.value!=undefined && xmlxsdElt.baseType.holds(xmlxsdElt.value)){
					this.xml+=xmlxsdElt.value;
				} else {
					this.alertMessage+=xmlxsdElt.value + 'does not fit node type.\n';
					this.alertDone=false;
					this.xml=undefined;
				}
			}
		}
	}
}
