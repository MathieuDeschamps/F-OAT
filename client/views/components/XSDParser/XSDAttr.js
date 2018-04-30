export class XSDAttr {
	constructor(attr,table){
		this.table=table;
		
		
		this.default=$(attr).attr('default');
		this.fixed=$(attr).attr('fixed');
		
		if (this.default !== undefined && this.fixed !== undefined){
			alert('XSD problem : default and fixed attributes cannot both be present.')
		}		
		
		this.name = $(attr).attr('name');
		if (this.name ==undefined){
			alert('XSD problem : name is not optional.')
		}

		var typeName=$(attr).attr('type');
		
		if (typeName != undefined){
			this.type=typeName;			
		}else{
			simpleType=$(attr).children('xs\\:simpleType');
			if (simpleType.length==1){
				this.type=table.createSimpleType(simpleType[0]);
			}else if (simpleType.length>1){
				alert('XSD problem : attribute type is unique.')
			} else {
				alert('XSD problem : attribute type is not optional.')
			}
		}
		
		this.use=$(attr).attr('use');
		if (this.use !== undefined){
			if (this.use="optional" && this.use!=="prohibited" && this.use!=="required"){
				alert('XSD problem : use is "optional" or "prohibited" or "required").')
			}
		}else{
			this.use="optional";
		}
	}

	accept(object){
		object.visitXSDAttr(this);
	}

}