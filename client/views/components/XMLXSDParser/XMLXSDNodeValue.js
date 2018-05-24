/*
Object class for extension type (ie element with basic node value and attributes) linked to its xsd dexcription
*/
export class XMLXSDNodeValue{
	/* Constructor
	@value : node value
	@type : xsd type
	*/
	constructor(value,type){
		this.value=value;
		this.type=type;
	}

	/*Setter for the node value
	@value : object
	*/
	setValue(value){
		if (this.type.holds(value)){
			this.value=value;
		}
	}
	
	/* Visitor pattern : accept function 
	@ visitor : object with a method "visitXMLXSDNodeValue"
	*/
	accept(visitor){
		visitor.visitXMLXSDNodeValue(this);
	}
}