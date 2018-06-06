import {XSDFloatType} from '../XSDParser/XSDFloatType.js';
import {XSDIntegerType} from '../XSDParser/XSDIntegerType.js';
import {XSDStringType} from '../XSDParser/XSDStringType.js';
import {XSDVoidType} from '../XSDParser/XSDVoidType.js';

/*
Object class for xml attributes linked to its xsd dexcription
*/

export class XMLXSDAttr{
	/* Constructor
	@value : object (value of the attribute)
	@xsdAtt : XSDAttr object
	*/
	constructor(value,xsdAttr){
		this.type=xsdAttr.table.getType(xsdAttr.type);
		this.name=xsdAttr.name;
		if (xsdAttr.default!=undefined){
			this.defaultValue=this.type.convert(xsdAttr.default);
		}

		if (xsdAttr.fixed!=undefined){
			this.fixedValue=this.type.convert(xsdAttr.fixed);
		}
		this.use=xsdAttr.use;
		this.setValue(value);
	}

	/* Setter for the value
	@value : object
	*/
	setValue(value){

		if (value!=undefined){
			var convertValue=this.type.convert(value);
			switch(this.use){
				case 'optional' :
					if (this.type.holds(convertValue)){
						if (this.fixedValue==undefined ||value==this.fixedValue){
							this.value=convertValue;
						}
					}
					break;
				case 'required' :
					if (this.type.holds(convertValue)){
						if (this.fixedValue==undefined ||value==this.fixedValue){
							this.value=convertValue;
						}
					}else if (this.value==undefined && this.defaultValue!=undefined){
						this.value=this.defaultValue;
					}
					break;
				case 'prohibited':
					alert(this.name+' is prohibited here.');
			}
		}else{
			switch(this.use){
				case 'optional' :
					this.value=undefined;
					break;
				case 'required' :
					if (this.fixedValue!=undefined){
						this.value=this.fixedValue;
					}else if (this.defaultValue!=undefined){
						this.value=this.defaultValue;
					}
					if (this.value==undefined){
						console.log(this.name +' should have a value.');
					}
					break;
				case 'prohibited':
					this.value=undefined;
			}
		}
	}

	/* Visitor pattern : accept function
	@ visitor : object with a method "visitXMLXSDAttr"
	*/
	accept(visitor){
		visitor.visitXMLXSDAttr(this);
	}
}
