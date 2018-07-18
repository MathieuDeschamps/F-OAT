/*
Object class for xsd union Type
*/

export class XSDUnionType{
	/* Constructor
	@union: description of the type union obtained by JQuery parsing
	@table: symbol table
	*/
	constructor(union,table){

		this.table=table;

		this.memberTypes=$(union).attr('memberTypes').split(' ').filter(function(item){return item!==""});

		$(union).children('xs\\:simpleType').each(function(type,i){
			var typeName=table.createSimpleType(type);
			this.memberTypes.push(typeName);
		});

	}

	/* Visitor pattern : accept function
	@visitor: object with a method "visitUnionType"
	*/
	accept(visitor){
		visitor.visitUnionType(this);
	}
}
