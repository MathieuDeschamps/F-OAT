/* 
Object class for restriction type in a xsd file.
*/

export class XSDRestrictionType{
	/* Constructor
	@restr : restriction description obtained by JQuery parsing
	@table : symbol table
	*/
	constructor(restr,table){
		
		this.table=table;
		
		this.base=$(restr).attr('base');
		if (this.base==undefined){
			alert('Restriction base type name is required');
		}
		
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
		
		
		var enumList=$(restr).children('xs\\:enumeration');
		if (enumList.length>0){
			this.enumeratedValues=[];
			var that=this;
			$(enumList).each(function(i,enumTag){
				value=$(enumTag).attr('value');
				that.enumeratedValues.push(value);
			});
		}
	}
	
	/* Convert a string to the base type of the restriction
	@str : string
	@return : number
	*/
	convert(str){
		this.table[this.base].convert(str);
	}
	
	/* test if the type is enumerated (when restrictions have been applied)
	@returns : boolean
	*/
	isEnumerated(){
		return (this.enumeratedValues!=undefined);
	}
	
	/* Getting the value of the enumeration (if present)
	*/
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
	
	/* tests if x is an element of the base type
	@x : object
	@returns : boolean
	*/
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
	
	/* Visitor pattern : accept function 
	@ visitor : object with a method "visitRestrictionType"
	*/
	accept(visitor){
		visitor.visitRestrictionType(this);
	}
}