import {XSDSymbolTable} from './XSDSymbolTable.js';

export class XSDAttr {
	constructor(attr,table){
		console.log('attr : ',attr);
		console.log('attr type : ',$(attr).attr('type'));
		console.log('attr name : ',$(attr).attr('name'));
		
		//Tout est optionnel  
		
		this.default=$(attr).attr('default');
		this.fixed=$(attr).attr('fixed');
		
		if (typeof this.default !== 'undefined' && typeof this.fixed !== 'undefined'){
			alert('XSD problem : default and fixed attributes cannot both be present.')
		}
		
		// TODO : manage form 
		/*this.form=$(attr).attr('form');
		if (typeof this.form == "undefined"){
			// On cherche la valeur par default dans la table des symboles
		}else{
			if (this.form!=="qualified" && this.form!=="unqualified"){
					alert('XSD non conforme : un attribut form est "qualified" ou "unqualified".')
			}
		}*/
		
		// this.id=$(attr).attr('id');
		
		
		this.name = $(attr).attr('name');
		if (typeof this.name =="undefined"){
			alert('XSD problem : name is not optional.')
		}
		if (typeof this.name !="string"){
			alert('XSD problem : name is a string.')
		}
		
		// TODO : manage ref
		// this.ref=$(attr).attr('ref');
		/*if (typeof this.name !== 'undefined' && typeof this.ref !== 'undefined'){
			alert('XSD problem : Name and ref attributes cannot both be present.')
		}*/
		
		 
		// Type determination 
		nomType=$(attr).attr('type');
		console.log("Nom type : ",nomType);
		console.log('Type : ', table.getType(nomType));
		if (typeof nomType != "undefined"){
			this.type=table.getType(nomType);
			
		}else{
			simpleType=$(attr).children('xs\\:simpleType');
			if (simpleType.length==1){
				newTable=new XSDSymbolTable(table);
				this.type=newTable.createSimpleType(simpleType[0]);
			}else if (simpleType.length>1){
				alert('XSD problem : attribute type is unique.')
			} else {
				alert('XSD problem : attribute type is not optional.')
			}
		}
		
		
		this.use=$(attr).attr('use');
		if (typeof this.use !== "undefined"){
			if (this.use!=="optional" && this.use!=="prohibited" && this.use!=="required"){
				alert('XSD non conforme : use est soit "optional" soit "prohibited" soit "required").')
			}
		}	
		
		console.log('XSDElt ok');
	}
	
	accept(object){
		object.visitXSDAttr(this);
	}
	
	
	/* TODO or NOT??
	hasDefaultValue(){
		return !(defaultValue==null);
	}
	
	hasFixedValue(){
		return !(fixedValue==null);
	}*/
}