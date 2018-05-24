/* 
Object class for integer Type
*/
export class XSDStringType {
	/*Constructor
	*/
	constructor(){
		this.name='xs:string';
		
		this.minLength=0;
		this.maxLength="unbounded";
				
		this.facets=['length', 'maxLength', 'minLength', 'enumeration'];
		
	}
	
	/* test if the type is enumerated (when restrictions have been applied)
	@returns : boolean
	*/
	isEnumerated(){
		return (this.enumeration != undefined)
	}
	
	/* Convert an object to number
	@str : object
	@return : number
	*/
	convert(str){
		return str.toString();
	}
	
	/* tests if s is of the type taking into account the restrictions applied
	@s : object
	@returns : boolean
	*/
	// TODO : check if s is a string
	holds(s){
		result=true;
		if (s.length < this.minLength){
				result=false;
		}
		if (this.maxLength!="unbounded"){
			if (s.length > this.maxLength){
				result=false;
			}
		}
		if (this.isEnumerated()){
			if (this.enumeration.indexOf(s)==-1){
				result=false;
			}
		}
		console.log('XSDString - holds 2', s);
		return result;
	}
	
	/* Setters for various restrictions
	enumeration is filtered if necessary
	@newMin : number
	@newMax : number
	@newLength : number
	*/
	setMinLength(newMin){
		this.minLength=max(this.minLength,newMin);
		if (this.isEnumerated()){
			this.enumeration=this.enumeration.filter(this.holds);
		}
	}
	setMaxLength(newMax){
		if (this.maxLength!="unbounded"){
			this.maxLength=max(this.maxLength,newMax);
		}else{
			this.minLength=newMax;
		}
		if (this.isEnumerated()){
			this.enumeration=this.enumeration.filter(this.holds);
		}
	}
	setLength(newLength){
		this.setMinLength(newLength);
		this.setMaxLength(newLength);
	}	
	
	/* Visitor pattern : accept function 
	@ visitor : object with a method "visitXSDStringType"
	*/
	accept(object){
		object.visitXSDStringType(this);
	}
}