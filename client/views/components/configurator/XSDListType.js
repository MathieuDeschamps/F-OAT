import {XSDSimpleType} from './XSDSimpleType.js';

export class XSDListType {
	constructor(list){
		// TODO manage Id
		//this.id=$(list).attr('id');
		
		this.itemType=$(list).attr('itemType');
		// TODO : check if defined in symbol table 
		if (typeof this.itemType == 'undefined'){
			simpleType=$(list).child('xs:simpleType');
			if (simpleType.length==1){
				this.itemType=new XSDSimpleType(simpleType[0]);
			}else{
				alert('multi typed list');
			}
		}
	}
	
	accept(object){
		object.visitXSDListType(this);
	}
}