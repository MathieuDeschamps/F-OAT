export class XMLXSDNodeValue{
	constructor(value,type){
		this.value=value;
		this.type=type;
	}

	setValue(value){
		if (this.type.holds(value)){
			this.value=value;
		}
	}
	
	accept(visitor){
		visitor.visitXMLXSDNodeValue(this);
	}
}