export class XSDVoidType {
	constructor(){
		this.name='xs:void';
		
		this.facets=[];
		
	}
	
	
	// 
	restriction(restr,name){
		// 1) cloner le type
		type=this.assign();
		type.name=name;
		return type;
	}
	
	convert(x){
		return undefined;
	}
	
	
	holds(x){
		// tester le type de b
		return false;
	}
	
	accept(object){
		object.visitXSDVoidType(this);
	}
}