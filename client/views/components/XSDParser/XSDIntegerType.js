/*
Object class for integer Type
*/

export class XSDIntegerType {
	/* constructor
	*/
	constructor(){
		this.name='xs:integer';

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

	/* test if the value of the string is an integer
	@string : string checked
	@returns : boolean
	*/
	static isInteger(string){
		var result = true;
		var parsedString = parseInt(string, 10)
		if(isNaN(parsedString)){
			result = false;
		}
		if(typeof(parsedString) !== "number"){
			result = false;
		}
		return result
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
	holds(n){
		var result=true;
		if (typeof n == "number"){
			if (!XSDIntegerType.isInteger(n)){
				result=false;
			}
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
		}else{
			result=false;
		}
		return result;
	}

	/* test if minEx has no more is defaultValue
	@returns boolean
	*/
	hasMinEx(){
		return (this.minEx!="unbounded");
	}

	/* test if minIn has no more is defaultValue
	@returns boolean
	*/
	hasMinIn(){
		return (this.minIn!="unbounded");
	}

	/* test if maxEx has no more is defaultValue
	@returns boolean
	*/
	hasMaxEx(){
		return (this.maxEx!="unbounded");
	}

	/* test if maxIn has no more is defaultValue
	@returns boolean
	*/
	hasMaxIn(){
		return (this.maxIn!="unbounded");
	}

	/* Setters for various restrictions
	enumeration is filtered if necessary
	@newMin : number
	@newMax : number
	*/
	setMinEx(newMin){
		if (this.hasMinEx()){
			this.minEx=Math.max(this.minEx,parseInt(newMin));
		}else{
			if(XSDIntegerType.isInteger(newMin)){
				this.minEx=parseInt(newMin, 10);
			}
		}
		if (this.isEnumerated()){
			this.enumeration=this.enumeration.filter(e => e > this.minEx);
		}
	}

	setMinIn(newMin){
		if (this.hasMinIn()){
			this.minIn=Math.max(this.minIn,parseInt(newMin));
		}else{
			if(XSDIntegerType.isInteger(newMin)){
				this.minIn=parseInt(newMin, 10);
			}
		}
		if (this.isEnumerated()){
			this.enumeration=this.enumeration.filter(e => e >= this.minIn);
		}
	}
	setMaxEx(newMax){
		if (this.hasMaxEx()){
			this.maxEx=Math.min(this.maxEx,parseInt(newMax));
		}else{
			if(XSDIntegerType.isInteger(newMax)){
				this.maxEx=newMax;
			}
		}
		if (this.isEnumerated()){
			this.enumeration=this.enumeration.filter(e => e < this.maxEx);
		}
	}
	setMaxIn(newMax){
		if (this.hasMaxIn()){
			this.maxIn=Math.min(this.maxIn,parseInt(newMax));
		}else{
			if(XSDIntegerType.isInteger(newMax)){
				this.maxIn=parseInt(newMax, 10);
			}
		}
		if (this.isEnumerated()){
			this.enumeration=this.enumeration.filter(e => e <= this.maxIn);
		}
	}

	/* Visitor pattern : accept function
	@ visitor : object with a method "visitXSDDecimalType"
	*/
	accept(object){
		object.visitXSDIntegerType(this);
	}
}
