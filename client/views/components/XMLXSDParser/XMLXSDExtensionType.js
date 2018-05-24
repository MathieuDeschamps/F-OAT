import {XMLXSDAttr} from './XMLXSDAttr.js';

/*
Object class for extension type (ie element with basic node value and attributes) linked to its xsd dexcription
*/
export class XMLXSDExtensionType{
	/*Constructor
	@xml : description of the element by JQuery parsing
	@extType : XSDExtensionType object
	*/
	constructor(xml,extType){
		
		this.type=extType;
		
		this.baseType=extType.table.getType(extType.baseType);
		
		this.attrs={};
		
		this.name="extension";
		
		var that=this;
		if (xml!=undefined){
			Object.keys(extType.attrs).forEach(function(xsdAttr,i){
				that.attrs[xsdAttr]=new XMLXSDAttr($(xml).attr(xsdAttr),extType.attrs[xsdAttr]);
			});
			var value=this.baseType.convert(xml.textContent);
			this.setValue(value);
		}else{
			Object.keys(extType.attrs).forEach(function(xsdAttr,i){
				that.attrs[xsdAttr]=new XMLXSDAttr(undefined,extType.attrs[xsdAttr]);
			});
		}
	}

	/* Setter for the node value
	@value : object
	*/
	setValue(value){
		if (this.baseType.holds(value)){
			this.value=value;
		}
	}

	/* Visitor pattern : accept function 
	@ visitor : object with a method "visitXMLXSDExtensionType"
	*/
	accept(visitor){
		visitor.visitXMLXSDExtensionType(this)
	}	
}