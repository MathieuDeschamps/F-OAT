export class XSDRestrictionType{

	constructor(restr,table){
		
		this.table=table;
		
		this.base=$(restr).attr('base');
		if (this.base==undefined){
			alert('Restriction base type name is required');
		}
		console.log("Restriction type test");
		
		$(restr).children('xs\\:minExclusive').each(function(i,min){
			this.minExclusive=min.attr('value');
		})
		$(restr).children('xs\\:minInclusive').each(function(i,min){
			this.minInclusive=min.attr('value');
		})
		$(restr).children('xs\\:maxExclusive').each(function(i,max){
			this.maxExclusive=max.attr('value');
		})
		$(restr).children('xs\\:maxInclusive').each(function(i,max){
			this.maxInclusive=max.attr('value');
		})
		
		$(restr).children('xs\\:minLength').each(function(i,min){
			this.minLength=min.attr('value');
		})
		$(restr).children('xs\\:maxLength').each(function(i,max){
			this.maxLength=max.attr('value');
		})
		$(restr).children('xs\\:length').each(function(i,length){
			this.minLength=length.attr('value');
			this.maxLength=length.attr('value');
		})
		
		//console.log("Restriction type test");
		
		var enumList=$(restr).children('xs\\:enumeration');
		if (enumList.length>0){
			this.enumeratedValues=[];
			that=this;
			$(enumList).each(function(i,enumTag){
				value=$(enumTag).attr('value');
				that.enumeratedValues.push(value);
			});
		}
	}
	
	convert(str){
		this.table[this.base].convert(str);
	}
	
	isEnumerated(){
		return (this.enumeratedValues!=undefined);
	}
	
	getEnumetaredValues(){
		var list=[];
		this.enumeratedValues.forEach(function(i,val){
			val=this.table[this.base].convert(val);
			if (this.table[this.base].holds(val)){
				list.push(val);
			}
		});
		return list;
	}
	
	holds(x){
		result=true;
		if (this.table[this.base].holds(x)){
			if (this.minExclusive!=undefined && x<=this.minExclusive){
				result=false;
			}
			if (this.minInclusive!=undefined && x<this.minInclusive){
				result=false;
			}
			if (this.maxExclusive!=undefined && x>=this.maxExclusive){
				result=false;
			}
			if (this.maxInclusive!=undefined && x>this.maxInclusive){
				result=false;
			}
			if (this.minLength!=undefined && x.length<this.minLength){
				result=false;
			}
			if (this.maxLength!=undefined && x.length>this.maxLength){
				result=false;
			}
			if (this.isEnumerated() && !this.getEnumetaredValues().includes(x)){
				result=false;
			}
		}else{
			result=false;
		}
		return result;
	}
	
	
	accept(visitor){
		visitor.visitRestrictionType(this);
	}
	
	
}