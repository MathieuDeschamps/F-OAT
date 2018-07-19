/*
Object class for xsd void type
*/

export class XSDVoidType {
	constructor(){
		this.name='xs:void';

		this.facets=[];
	}


	/*
	restriction(restr,name){
		// 1) cloner le type
		type=this.assign();
		type.name=name;
		return type;
	}*/

	/* conversion to void type
	@x: object
	@returns: undefined
	*/
	convert(x){
		return undefined;
	}

	/* test if x is undefined
	@x: object
	@returns: boolean
	*/
	holds(x){
		return (x === undefined || x === "");
	}

	/* Visitor pattern : accept function
	@visitor: object with a method "visitXSDBooleanType"
	*/
	accept(object){
		object.visitXSDVoidType(this);
	}
}
