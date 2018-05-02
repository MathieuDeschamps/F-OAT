export class XSDDecimalType {
	constructor(){
		this.name='xs:decimal';
		
		this.minEx='unbounded';
		this.minIn='unbounded';
		this.maxEx='unbounded';
		this.maxIn='unbounded';
				
		this.facets=['enumeration', 'minInclusive', 'minExclusive', 'maxInclusive', 'maxExclusive'];
	}
	
	isEnumerated(){
		return (this.enumeration == undefined)
	}
	
	// return true if n is of this type, false otherwise
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
	
	// setting functions for restriction only
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
	
		
	accept(object){
		object.visitXSDDecimalType(this);
	}
}