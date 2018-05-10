/*** Desuet  ***/

/*import {XSDListType} from './XSDListType.js';
import {XSDUnionType} from './XSDUnionType.js';
import {XSDRestrictionType} from './XSDRestrictionType.js';

export class XSDSimpleType {
	constructor(type){
		// TODO : manage final
		//this.final=$(type).attr('final');
	
		// TODO : manage id
		// this.id=$(type).attr('id');
		
		this.name=$(type).attr('name');
		
		// list ou union ou restriction
		nbDescription=0;
		if (this.child('xs\\:list').length!=0){
			nbDescription++;
			if (this.child('xs\\:list').length!=1){
				alert('XSD problem : multi typed list');
			}
			type="list";
		}
		if (this.child('xs\\:union').length!=0){
			nbDescription++;
			type='union';
		}
		if (this.child('xs\\:restriction').length!=0){
			nbDescription++;
			type='restriction';
		}
		
		if (nbDescription==0){
			alert('XSD problem : simple type undefined');
		}else if (nbDescription !=1){
			alert('XSD problem : simple type multi defined');
		}else {
			if (type=='list') {
				this.description=new XSDListType(this.child('xs\\:list')[0]);
			}
				
			if (type=='union'){
				this.description==new XSDUnionType(this.child('xs\\:union'));
			}
			if (type=='restriction'){
				this.description==new XSDRestrictionType(this.child('xs\\:restriction'));
			}
		}
	}
	
	
	accept(object){
		object.visitXSDSimpleType(this);
	}
}*/