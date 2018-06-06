/*
Object class for restriction type in a xsd file.
*/

export class XSDRestrictionType{
	/* Constructor
	@restr : restriction description obtained by JQuery parsing
	@table : symbol table
	*/
	constructor(restr,table){
		var that = this;
		this.table=table;

		var restrictionType=$(restr)
		if(restrictionType.length > 0){
			this.baseType=this.table.createRestrictionType(restrictionType[0]);
		}

		$(restr).children('xs\\:minExclusive').each(function(i,min){
			if(that.baseType.facets.includes('minExclusive')){
				that.minEx = $(min).attr('value');
				that.baseType.setMinEx($(min).attr('value'));
			}
		})

		$(restr).children('xs\\:minInclusive').each(function(i,min){
			if(that.baseType.facets.includes('minInclusive')){
				that.minIn = $(min).attr('value');
				that.baseType.setMinIn($(min).attr('value'));
			}
		})

		$(restr).children('xs\\:maxExclusive').each(function(i,max){
			if(that.baseType.facets.includes('maxExclusive')){
				that.maxEx = $(max).attr('value');
				that.baseType.setMaxEx($(max).attr('value'));
			}
		})

		$(restr).children('xs\\:maxInclusive').each(function(i,max){
			if(that.baseType.facets.includes('maxInclusive')){
				that.maxIn = $(max).attr('value');
				that.baseType.setMaxIn($(max).attr('value'));
			}
		})

		$(restr).children('xs\\:minLength').each(function(i,min){
			if(that.baseType.facets.includes('minLength')){
				that.minLength = $(min).attr('value');
				that.baseType.setMinLength($(min).attr('value'));
			}
		})
		$(restr).children('xs\\:maxLength').each(function(i,max){
			if(that.baseType.facets.includes('maxLength')){
				that.maxLength = $(max).attr('value');
				that.baseType.setMaxLength($(max).attr('value'));
			}
		})
		$(restr).children('xs\\:length').each(function(i,length){
			if(that.baseType.facets.includes('length')){
				that.minLength = $(length).attr('value');
				that.maxLength = $(length).attr('value');
				that.baseType.setLength($(length).attr('value'));
			}
		})

		var enumList=$(restr).children('xs\\:enumeration');
		if (enumList.length>0){
			this.enumeratedValues=[];
			$(enumList).each(function(i,enumTag){
				value=$(enumTag).attr('value');
				var convertValue = that.convert(value)
				if(that.holds(convertValue)){
					that.enumeratedValues.push(value);
				}
			});
		}

		if(this.enumeratedValues !== undefined  && this.baseType.facets.includes('enumeration')){
			this.baseType.enumeration = this.enumeratedValues;
		}

	}

	/* Convert a string to the base type of the restriction
	@str : string
	@return : restriction type
	*/
	convert(str){
		return this.table.getType(this.baseType.name).convert(str);
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
		var that = this;
		this.enumeratedValues.forEach(function(val,i){
			val=that.table.getType(that.baseType.name).convert(val);
			if (that.table.getType(that.baseType.name).holds(val)){
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
		var result=true;
		if (this.table.getType(this.baseType.name).holds(x)){
			if (this.minEx!=undefined && x<=this.minEx){
				result=false;
			}
			if (this.minIn!=undefined && x<this.minIn){
				result=false;
			}
			if (this.maxEx!=undefined && x>=this.maxEx){
				result=false;
			}
			if (this.maxIn!=undefined && x>this.maxIn){
				result=false;
			}
			if (this.minLength!=undefined && x.length<this.minLength){
				result=false;
			}
			if (this.maxLength!=undefined && x.length>this.maxLength){
				result=false;
			}
			if((this.isEnumerated()) && (this.getEnumetaredValues().includes(x))){
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
		visitor.visitXSDRestrictionType(this);
	}
}
