export class XSDStringType {
	constructor(){
		this.name='xs:string';
		
		this.minLength=0;
		this.maxLength="unbounded";
		
		
		this.facets=['length', 'maxLength', 'minLength', 'enumeration'];
		
	}
	
		
	isEnumerated(){
		return (this.enumeration != undefined)
	}
	
	convert(str){
		console.log('XSDString - convert', str);
		return str.toString();
	}
	
	// return true if s is of this type, false otherwise
	holds(s){
		console.log('XSDString - holds', s);
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
	
	accept(object){
		object.visitXSDStringType(this);
	}
}