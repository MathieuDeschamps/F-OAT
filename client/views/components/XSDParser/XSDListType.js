export class XSDListType{
	constructor(list,table){
		this.table=table;

		this.itemType=$(list).attr('idemType');

		if (this.itemType == undefined){
			simpleType=$(list).children('xs\\:simpleType')[0];
			this.itemType=table.createSimpleType(simpleType);
		}
	}

	
	accept(visitor){
		visitor.visitListType(this);
	}
}