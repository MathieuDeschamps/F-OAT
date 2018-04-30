export class XSDUnionType{

	constructor(union,table){
		
		this.table=table;
		
		this.memberTypes=$(union).attr('memberTypes').split(' ').filter(function(item){return item!==""});
		
		$(union).children('xs\\:simpleType').each(function(type,i){
			var typeName=table.createSimpleType(type);
			this.memberTypes.push(typeName);
		});
		
	}
	
	accept(visitor){
		visitor.visitUnionType(this);
	}
}