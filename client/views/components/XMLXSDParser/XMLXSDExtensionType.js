import {XMLXSDAttr} from './XMLXSDAttr.js';

export class XMLXSDExtensionType{
	constructor(xml,extType){
		
		console.log('XMLXSDExtensionType',xml,extType);
		
		this.type=extType;
		
		this.baseType=extType.table.getType(extType.baseType);
		
		console.log('XMLXSDExtensionType',this.type,extType.table);
		
		this.attrs={};
		
		this.name="extension";
		
		/*console.log('XMLXSDSequence - xsdseq : ',xsdSeq);
		console.log('XMLXSDSequence - xsdseq.attrs : ',xsdSeq.attrs);
		console.log('XMLXSDSequence - xmlElt : ',xmlElt);*/
		
		var that=this;
		if (xml!=undefined){
			Object.keys(extType.attrs).forEach(function(xsdAttr,i){
				/*console.log('XMLXSDSequence - xsdAttr.name ',xsdAttr);
				console.log('XMLXSDSequence - $(xmlElt).attr(xsdAttr)',$(xmlElt).attr(xsdAttr));
				console.log('XMLXSDSequence - xsdSeq.attrs[xsdAttr]',xsdSeq.attrs[xsdAttr]);*/
				that.attrs[xsdAttr]=new XMLXSDAttr($(xml).attr(xsdAttr),extType.attrs[xsdAttr]);
			});
			var value=this.baseType.convert(xml.textContent);
			this.setValue(value);
		}else{
			Object.keys(extType.attrs).forEach(function(xsdAttr,i){
				/*console.log('XMLXSDSequence - xsdAttr.name ',xsdAttr);
				console.log('XMLXSDSequence - $(xmlElt).attr(xsdAttr)',$(xmlElt).attr(xsdAttr));
				console.log('XMLXSDSequence - xsdSeq.attrs[xsdAttr]',xsdSeq.attrs[xsdAttr]);*/
				that.attrs[xsdAttr]=new XMLXSDAttr(undefined,extType.attrs[xsdAttr]);
			});
			
		}
		
		
		
		
		
	}

	
	setValue(value){
		if (this.baseType.holds(value)){
			this.value=value;
		}
	}

	accept(visitor){
		visitor.visitXMLXSDExtensionType(this)
	}
	
}