/*
Object class for elements in an xsd file.
*/

export class XSDElt{
	/* Constructor :
	@elt : element description given by JQuery parsing of the xsd file
	@table : type table
	*/
	constructor(elt,table){
		this.table=table;

		if ($(elt).attr('fixed')!=undefined){
			this.fixed=$(elt).attr('fixed');
		}

		if ($(elt).attr('default')!=undefined){
			this.fixed=$(elt).attr('default');
		}

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

		// Name obligatoire étant donné les restrictions
		this.name = $(elt).attr('name');
		if (typeof this.name =="undefined"){
			alert('XSD element problem : name is not optional.')
		}

		// this.type is only the name of the elemen's type.
		var typeName=$(elt).attr('type');
		if (typeName !== undefined && typeName.substr(0,3) === 'xs:'){
			this.type=typeName;
		}else{
			var simpleType=$(elt).children('xs\\:simpleType');
			var complexType=$(elt).children('xs\\:complexType');
			switch (simpleType.length+complexType.length){
				case 0 :
					this.type="xs:void";
					break;
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

	/* Visitor pattern : accept function
	@ visitor : object with a method "visitXSDElt"
	*/
	accept(visitor){
		visitor.visitXSDElt(this);
	}
}
