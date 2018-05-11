import {XSDSimpleType} from './XSDSimpleType.js';

export class XSDUnionType {
	constructor(union){
		// TODO manage Id
		//this.id=$(union).attr('id');
		this.memberTypes=$(union).attr('memberTypes').split(' ');
		// TODO : vérifier les types.
		that=this;
		$(union).child('xs:simpleType').each(function(i,type){
			that.memberTypes.append(new XSDSimpeType(type));
		});
	}
	
	accept(object){
		object.visitXSDUnionType(this);
	}
}