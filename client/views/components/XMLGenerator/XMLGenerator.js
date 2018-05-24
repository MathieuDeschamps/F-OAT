export class XMLGenerator{
	constructor(xmlxsd){
		this.xmlxsd=xmlxsd;
		
		this.xml=undefined;
		
		this.alertDone=true;
		this.alertMessage="";
	}

	generateXML(){
		this.alertMessage="";
		this.xml="";
		this.xmlxsd.content.accept(this);
		if (this.xml==undefined){
			alert(this.alertMessage);
		}
		return this.xml;
	}
	
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
	
	visitXMLXSDSequence(xmlxsdSeq){
		// On enlève le ">" du tag
		if (this.xml!=undefined){
			this.xml=this.xml.substr(0,this.xml.length-1);
			var that=this;
			$.each(xmlxsdSeq.attrs,function(key,attr){
				if (that.xml!=undefined){
					console.log(attr);
					attr.accept(that);
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
	
	visitXMLXSDAttr(attr){
		console.log('XMLGenerator Attr :',attr.name,attr.use,attr.value);
		if (this.xml!=undefined){
			if (attr.value!=undefined && (attr.type.holds(attr.value)) && attr.use!="prohibited"){
				this.xml+=' '+attr.name+'="'+attr.value+'"';
			} else {
				console.log('XMLGenerator Attr 1');
				if (attr.value!=undefined){
					if (attr.use=="prohibited"){
						this.alertMessage+=attr.name + " is prohibited.\n";
						this.xml=undefined;
					} else {
						if (!attr.type.holds(attr.value)){
							this.alertMessage+=attr.value+ "does not follow the type of "+attr.name+".\n";
							this.xml=undefined;
						}
					}
				} else {
					if (attr.use=="required"){
						this.alertMessage+=attr.name + " is required.\n";
						this.alertDone=false;
						this.xml=undefined;
					}
				}
			}
		}
		console.log('XMLGenerator Attr 2');
	}

	visitXMLXSDNodeValue(node){
		if (this.xml!=undefined){
			if (node.value!=undefined && node.type.holds(node.value)){
				this.xml+=node.value;
			} else {
				this.alertMessage+=node.value + 'does not fit node type.\n';
				this.alertDone=false;
				this.xml=undefined;
			}
		}
	}
	
	visitXMLXSDExtensionType(extType){
		if (this.xml!=undefined){
			this.xml=this.xml.substr(0,this.xml.length-1);
			var that=this;
			$.each(extType.attrs,function(key,attr){
				if (that.xml!=undefined){
					attr.accept(that);
				};
			});
			if (this.xml!=undefined){
				this.xml+='>';
				if (extType.value!=undefined && extType.baseType.holds(extType.value)){
					this.xml+=extType.value;
				} else {
					this.alertMessage+=extType.value + 'does not fit node type.\n';
					this.alertDone=false;
					this.xml=undefined;
				}
			}
		}
	}
}