export class XSDRestrictionType {
	constructor(restrict){
		// TODO manage Id
		//this.id=$(restrict).attr('id');
		this.base=$(restrict).attr('base');
		
		this.enumeration=[];
		that=this;
		
		$(restrict).child('xs\\:enumeration').each(function(i,enumer){
			// TODO vérifier la compatibilité avec le type
			this.enumeration.append($(enumer).attr('value'));
		});
		
		minEx=$(restrict).child('xs:minExclusive');
		minIn=$(restrict).child('xs:minInclusive');
		if (minEx.length+minIn.length>1){
			alert('XSD problem : too many lower bound');
		} else {
			if (minEx.length==1){
				this.minExclusive=$(minEx[0]).attr('value');
			}
			if (minIn.length==1){
				this.minInclusive=$(minIn[0]).attr('value');
			}
		}
		
		maxEx=$(restrict).child('xs:maxExclusive');
		maxIn=$(restrict).child('xs:maxInclusive');
		if (maxEx.length+maxIn.length>1){
			alert('XSD problem : too many upper bound');
		} else {
			if (maxEx.length==1){
				this.maxExclusive=$(maxEx[0]).attr('value');
			}
			if (maxIn.length==1){
				this.maxInclusive=$(maxIn[0]).attr('value');
			}
		}
		
		
		length=$(restrict).child('xs\\:length');
		if (length.length==1){
			this.length=$(length[0]).attr('value');
		} else if (length.length>1){
			alert('XSD problem : length multi defined');
		}
		minLength=$(restrict).child('xs\\:minLength');
		if (minLength.length==1){
			this.minLength=$(minLength[0]).attr('value');
		} else if (minLength.length>1){
			alert('XSD problem : minLength multi defined');
		}
		
		maxLength=$(restrict).child('xs\\:maxLength');
		if (maxLength.length==1){
			this.maxLength=$(maxLength[0]).attr('value');
		} else if (maxLength.length>1){
			alert('XSD problem : maxLength multi defined');
		}
		
	}
	
	
	accept(object){
		object.visitXSDRestrictionType(this);
	}
}