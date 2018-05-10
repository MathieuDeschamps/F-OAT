export class XSDBooleanType {
	constructor(){
		this.name='xs:boolean';
		
		this.facets=[];
		
	}
	
	restriction(restr,name){
		// 1) cloner le type
		type=this.assign();
		type.name=name;
		return type;
	}
	
	
	
	
	holds(b){
		// tester le type de b
		return true;
	}
	
	accept(object){
		object.visitXSDBooleanType(this);
	}
}