export class XSDElt{

	constructor(elt,table){
		this.table=table;
		console.log(elt);
		
		
		this.maxOccurs=$(elt).attr('maxOccurs');
		if (this.maxOccurs== undefined){
			this.maxOccurs=1;
		}
		this.minOccurs=$(elt).attr('minOccurs');
		if (this.minOccurs== undefined){
			this.minOccurs=1;
		}
		if (this.minOccurs>this.maxOccurs){
			alert("Inconsistent minOccurs and maxOccurs");
		}
		
		this.name = $(elt).attr('name');
		// Obligatoire étant donné les restrictions
		if (typeof this.name =="undefined"){
			alert('XSD element problem : name is not optional.')
			console.log("XSD Elt pb : ", elt);
		}
		
		
		// this.type is only the name of the elemen's type.
		var typeName=$(elt).attr('type');
		if (typeName !== undefined){
			this.type=typeName;
		}else{
			var simpleType=$(elt).children('xs\\:simpleType');
			var complexType=$(elt).children('xs\\:complexType');
			switch (simpleType.length+complexType.length){
				case 0 : 
					this.type="xs:void";
				case 1 :
					if (simpleType.length==1){
						this.type=table.createSimpleType(simpleType[0]);
					}else{
						this.type=table.createComplexType(complexType[0]);
					}
					break;
				default : 
					alert('XSD Element '+this.name+' : type multi defined.');
			}
		}
		
	}

	accept(visitor){
		visitor.visitXSDElt(this);
	}
}