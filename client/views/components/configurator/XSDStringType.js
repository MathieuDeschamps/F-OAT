export class XSDStringType {
	constructor(){
		this.name='xs:string';
		
		this.minLength;
		this.maxLength;
		this.enumeration;
		
		
		this.facets=['length', 'maxLength', 'minLength', 'enumeration'];
		
	}
	
	
	hasMinLength(){
		return (typeof this.maxEx == "undefined")
	}
	
	hasMaxLength(){
		return (typeof this.minEx == "undefined")
	}
	
	isEnumerated(){
		return (typeof this.enumerate == "undefined")
	}
	
	
	// return true if s is of this type, false otherwise
	holds(s){
		result=true;
		if (this.hasMinLength()){
			if (s.length <= this.minLength){
				result=false;
			}
		}
		if (this.hasMaxLength()){
			if (s.length <= this.minLength){
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
	
	setMinLength(newMin){
		if (this.hasMinLength()){
			this.minLength=max(this.minLength,newMin);
		}else{
			this.minLength=newMin;
		}
		if (this.isEnumerated){
			this.enumeration=this.enumeration.filter(this.holds);
		}
	}
	
	setMaxLength(newMax){
		if (this.hasMaxLength()){
			this.maxLength=max(this.maxLength,newMax);
		}else{
			this.minLength=newMax;
		}
		if (this.isEnumerated){
			this.enumeration=this.enumeration.filter(this.holds);
		}
	}
	
	setLength(newLength){
		this.setMinLength(newLength);
		this.setMaxLength(newLength);
	}
	
	restriction(restr,name){
		// 1) cloner le type
		type=this.assign();
		type.name=name;
		type.enumeration=this.enumeration.slice();
		
		
		// 2) Appliquer les restrictions au clone
		// Attention, on crée l'énumération d'abord puis on applique les bornes
		if ($(restrict).child('xs\\:enumeration').length>1){
			type.enumeration=[];
			$(restrict).child('xs\\:enumeration').each(function(i,enumer){
				type.addValue($(enumer).attr('value'));
			});
		}
		
		$(restrict).child('xs:minLength').each(function(i,minLength){
			type.setMinLength($(minLength).attr('value'));
		});
		$(restrict).child('xs:maxLength').each(function(i,maxLength){
			type.setMaxLength($(maxLength).attr('value'));
		});
		$(restrict).child('xs:length').each(function(i,length){
			type.setLength($(length).attr('value'));
		});
		
		// 3) renvoyer le clone
		return type;
	}
	
	
	
	accept(object){
		object.visitXSDStringType(this);
	}
}