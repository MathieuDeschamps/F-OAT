export class XSDBooleanType {
	constructor(){
		this.name='xs:boolean';
		
		this.facets=[];
		
	}
	
	
	// 
	restriction(restr,name){
		// 1) cloner le type
		type=this.assign();
		type.name=name;
		return type;
	}
	
	convert(str){
		if (str.toLowerCase()=="true"){
			return true;
		}
		if (str.toLowerCase()=="false"){
			return false;
		}
	}
	
	
	holds(b){
		// tester le type de b
		return ((b==true)||(b==false));
	}
	
	accept(object){
		object.visitXSDBooleanType(this);
	}
}