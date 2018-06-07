/*
Object class for xsd boolean Type
*/

export class XSDBooleanType {
	/*Constructor :
	*/
	constructor(){
		this.name='xs:boolean';

		this.facets=[];

	}


	/*

	restriction(restr,name){
		// 1) cloner le type
		type=this.assign();
		type.name=name;
		return type;
	}

	*/

	/* conversion of a string to boolean
	@str : string
	@returns : boolean
	*/
	convert(str){
		if (str.toLowerCase()=="true"){
			return true;
		}
		if (str.toLowerCase()=="false"){
			return false;
		}

	}

	/* test if b is a boolean
	@b : object
	@returns : boolean
	*/
	holds(b){
		// tester le type de b
		return ((b==true)||(b==false));
	}

	/* Visitor pattern : accept function
	@ visitor : object with a method "visitXSDBooleanType"
	*/
	accept(visitor){
		visitor.visitXSDBooleanType(this);
	}
}
