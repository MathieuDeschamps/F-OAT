/* 
Object class for list in a xsd file.
*/

export class XSDListType{
	/* Constructor
	@list : list description obtained by JQuery parsing
	@table : symbol table
	*/
	constructor(list,table){
		this.table=table;

		this.itemType=$(list).attr('itemType');

		if (this.itemType == undefined){
			simpleType=$(list).children('xs\\:simpleType')[0];
			this.itemType=table.createSimpleType(simpleType);
		}
	}

	/* Visitor pattern : accept function 
	@ visitor : object with a method "visitListType"
	*/
	accept(visitor){
		visitor.visitListType(this);
	}
}