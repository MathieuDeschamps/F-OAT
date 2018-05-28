/*
Object class for restriction type in a xsd file.
*/

export class XSDRestrictionType{
	/* Constructor
	@restr : restriction description obtained by JQuery parsing
	@table : symbol table
	*/
	constructor(restr,table){
		var that = this
		this.table=table;

		$(restr).children('xs\\:minExclusive').each(function(i,min){
			that.minEx=$(min).attr('value');
		})
		$(restr).children('xs\\:minInclusive').each(function(i,min){
			that.minIn=$(min).attr('value');
		})
		$(restr).children('xs\\:maxExclusive').each(function(i,max){
			that.maxEx=$(max).attr('value');
		})
		$(restr).children('xs\\:maxInclusive').each(function(i,max){
			that.maxIn=$(max).attr('value');
		})

		$(restr).children('xs\\:minLength').each(function(i,min){
			that.minLength=$(min).attr('value');
		})
		$(restr).children('xs\\:maxLength').each(function(i,max){
			that.maxLength=$(max).attr('value');
		})
		$(restr).children('xs\\:length').each(function(i,length){
			console.log('set with length', this.minLength)
			that.length=$(length).attr('value');
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
		var restrictionType=$(restr)
		if(restrictionType.length > 0){
			this.base=this.table.createRestrictionType(restrictionType[0])
		}

		if(this.enumeratedValues !== undefined  && this.base.facets.includes('enumeration')){
			this.base.enumeration = this.enumeratedValues
		}

		if(this.minEx !== undefined && this.base.facets.includes('minExclusive')){
				this.base.setMinEx(this.minEx);
		}
		if(this.minIn !== undefined && this.base.facets.includes('minInclusive')){
				this.base.setMinIn(this.minIn);
		}
		if(this.maxEx !== undefined && this.base.facets.includes('maxExclusive')){
				this.base.setMaxEx(this.maxEx);
		}
		if(this.maxIn !== undefined && this.base.facets.includes('maxInclusive')){
				this.base.setMaxIn(this.maxIn);
		}

		if(this.minLength !== undefined && this.base.facets.includes('minLength')){
				this.base.setMinLength(this.minLength);
		}
		if(this.maxLength !== undefined  && this.base.facets.includes('maxLength')){
				this.base.setMaxLength(this.maxLength);
		}
		if(this.length !== undefined  && this.base.facets.includes('length')){
				this.base.setLength(this.length);
		}

		console.log('this.base ', this.base)
	}

	/* Convert a string to the base type of the restriction
	@str : string
	@return : restriction type
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
			val=this.table[this.base.name].convert(val);
			if (this.table[this.base.name].holds(val)){
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
		if (this.table[this.base.name].holds(x)){
			if (this.minEx!=undefined && x<=this.minEx){
				result=false;
			}
			if (this.minIn!=undefined && x<this.minIn){
				result=false;
			}
			if (this.maxEx!=undefined && x>=this.maxEx){
				result=false;
			}
			if (this.minIn!=undefined && x>this.minIn){
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
		visitor.visitXSDRestrictionType(this);
	}
}
