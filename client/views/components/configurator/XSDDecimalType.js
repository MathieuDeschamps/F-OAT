export class XSDDecimalType {
	constructor(){
		this.name='xs:decimal';
		
		this.minEx;
		this.minIn;
		this.maxEx;
		this.minEx;
		
		this.enumerate;
		
		this.facets=['enumeration', 'minInclusive', 'minExclusive', 'maxInclusive', 'maxExclusive'];
		
	}
	
	hasMinEx(){
		return (typeof this.minEx == "undefined")
	}
	
	hasMinIn(){
		return (typeof this.minIn == "undefined")
	}
	
	hasMaxEx(){
		return (typeof this.maxEx == "undefined")
	}
	
	hasMaxIn(){
		return (typeof this.minEx == "undefined")
	}
	
	isEnumerated(){
		return (typeof this.enumerate == "undefined")
	}
	
	// return true if n is of this type, false otherwise
	holds(n){
		result=true;
		if (this.hasMinEx()){
			if (n <= this.minEx){
				result=false;
			}
		}
		if (this.hasMinIn()){
			if (n < this.minIn){
				result=false;
			}
		}
		if (this.hasMaxEx()){
			if (n >= this.maxEx){
				result=false;
			}
		}
		if (this.hasMaxIn()){
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
	
	addValue(type,value){
		if (this.holds(value)){
			type.enumeration.append(value);
		}
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
		
		$(restrict).child('xs:minExclusive').each(function(i,minExDef){
			type.setMinEx($(minExDef).attr('value'));
		});
		$(restrict).child('xs:minInclusive').each(function(i,minInDef){
			type.setMinIn($(minInDef).attr('value'));
		});
		$(restrict).child('xs:maxExclusive').each(function(i,maxExDef){
			type.setMaxEx($(maxExDef).attr('value'));
		});
		$(restrict).child('xs:maxInclusive').each(function(i,maxInDef){
			type.setMaxIn($(maxInDef).attr('value'));
		});
		
		// 3) renvoyer le clone
		return type;
	}
		
	accept(object){
		object.visitXSDDecimalType(this);
	}
}