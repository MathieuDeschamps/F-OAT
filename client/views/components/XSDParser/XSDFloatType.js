/* 
Object class for float type
*/
export class XSDFloatType {
	/*Constructor
	*/
	constructor(){
		this.name='xs:float';
		this.minEx='unbounded';
		this.minIn='unbounded';
		this.maxEx='unbounded';
		this.maxIn='unbounded';
				
		this.facets=['enumeration', 'minInclusive', 'minExclusive', 'maxInclusive', 'maxExclusive'];
	}
	
	/* test if the type is enumerated (when restrictions have been applied)
	@returns : boolean
	*/
	isEnumerated(){
		return (this.enumeration != undefined)
	}
	
	/* Convert a string to number
	@str : string
	@return : number
	*/
	convert(str){
		return Number(str);
	}

	/* tests if n is of the type taking into account the restrictions applied
	@n : object
	@returns : boolean
	*/
	// TODO : check if n is a number
	holds(n){
		result=true;
		if (this.minEx!="unbounded"){
			if (n <= this.minEx){
				result=false;
			}
		}
		if (this.minIn!="unbounded"){
			if (n < this.minIn){
				result=false;
			}
		}
		if (this.maxEx!="unbounded"){
			if (n >= this.maxEx){
				result=false;
			}
		}
		if (this.maxIn!="unbounded"){
			if (n > this.maxIn){
				result=false;
			}
		}
		if (this.isEnumerated()){
			if (this.enumeration.indexOf(n)==-1){
				result=false;
			}
		}
		return result;
	}
	
	
	/* Setters for various restrictions
	enumeration is filtered if necessary
	@newMin : number
	@newMax : number
	*/
	setMinEx(newMin){
		if (this.hasMinEx()){
			this.minEx=max(this.minEx,newMin);
		}else{
			this.minEx=newMin;
		}
		if (this.isEnumerated){
			this.enumeration=this.enumeration.filter(this.holds);
		}
	}
	setMinIn(newMin){
		if (this.hasMinIn()){
			this.minIn=max(this.minIn,newMin);
		}else{
			this.minIn=newMin;
		}
		if (this.isEnumerated){
			this.enumeration=this.enumeration.filter(this.holds);
		}
	}
	setMaxEx(newMax){
		if (this.hasMaxEx()){
			this.maxEx=min(this.maxEx,newMax);
		}else{
			this.maxEx=newMax;
		}
		if (this.isEnumerated){
			this.enumeration=this.enumeration.filter(this.holds);
		}
	}
	setMaxIn(newMax){
		if (this.hasMaxIn()){
			this.maxIn=min(this.maxIn,newMax);
		}else{
			this.maxIn=newMax;
		}
		if (this.isEnumerated){
			this.enumeration=this.enumeration.filter(this.holds);
		}
	}
	
	/* Visitor pattern : accept function 
	@ visitor : object with a method "visitXSDDecimalType"
	*/
	accept(visitor){
		visitor.visitXSDFloatType(this);
	}
}