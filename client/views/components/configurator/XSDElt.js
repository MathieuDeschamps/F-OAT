export class XSDElt {
	constructor(elt,table){
		this.elt="Element";
		console.log('elt : ',elt);
		console.log('elt type : ',$(elt).attributes);
		console.log('elt name : ',$(elt).attr('name'));
		
		// TODO : manage abstract
		//this.abstract=$(elt).attr('abstract');
		
		// TODO : manage block
		// this.block=$(elt).attr('block');
		
		// TODO : manage final
		//this.final=$(elt).attr('final');
		
		//TODO : manage default and fixed
		/*this.default=$(elt).attr('default');
		this.fixed=$(elt).attr('fixed');
		if (typeof this.default !== 'undefined' && typeof this.fixed !== 'undefined'){
			alert('XSD problem : default and fixed attributes cannot both be present.')
		}*/
		
		
		
		//TODO : manage form
		/*this.form=$(elt).attr('form');
		if (typeof this.form == "undefined"){
			// On cherche la valeur par default dans la table des symboles
		}else{
			if (this.form!=="qualified" && this.form!=="unqualified"){
					alert('XSD non conforme : un attribut form est "qualified" ou "unqualified".')
			}
		}*/
		
		//TODO ! manage Id
		//this.id=$(elt).attr('id');
		
		//TODO : manage maxOccurs and minOccurs
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
			alert('XSD problem : name is not optional.')
		}
		if (typeof this.name !="string"){
			alert('XSD problem : name is a string.')
		}
		
		
		
		// TODO : manage ref
		//this.ref=$(elt).attr('ref');
		//TODO : If the ref attribute is present, complexType, simpleType, key, keyref, and unique elements and nillable, default, fixed, form, block, and type attributes cannot be present. 
		
		nomType=$(elt).attr('type');
		console.log("nomType", nomType);
		// si absent : simpleType ou complexType, si présent conforme?
		// Obligatoire étant donné les restrictions
		// 1) tester l'existence du type
		if (typeof nomType != "undefined"){
			this.type=table.getType(nomType);
			console.log('Type ',nomType,' ',this.type);
			if (this.type == undefined){
				alert('Type ',nomType,' undefined.');
			}				
		}else{
			simpleType=$(elt).children('xs\\:simpleType');
			complexType=$(elt).children('xs\\:complexType');
			if (simpleType.length+complexType.length!=1){
				alert('type multi defined or undefined.');
				console.log('type multi defined or undefined.',elt);
			}else{
				if (simpleType.length==1){
					this.type=table.createSimpleType(simpleType[0]);
				}else{
					console.log("coucou XSDElt ",complexType[0], table);
					this.type=table.createComplexType(complexType[0]);
				}
			}
		}
		
		// 2) chercher le type simple ou complexe (+ tester unicité)
		// 3) créer une nouvelle table des symboles
		// 4) créer le nouveau type --> table des symboles
		
		
		if (this.type == undefined){
			alert('XSD problem : element type is not optional.')
		}
		/* 
		else{
			if (type.name !== undefined){
				type.name=this.name;
				table.addType(type);
			}
		}*/
		
		// TODO : manage nillable
		//this.nillable=$(elt).attr('nillable');
		
		// TODO : manage substitutionGroup
		//this.substitutionGroup=$(elt).attr('substitutionGroup');
		
		/*const type=$(elt).attr('type');
		const typeoftype=typeof type;
		console.log('type', typeoftype,typeof typeoftype);
		this.type=null;
		if (typeoftype !== 'undefined'){
			this.type = type;
		}*/
		console.log('XSDElt ok');
	}
	
	accept(visitor,xmlElt){
		console.log("accept XSDElt");
		visitor.visitXSDElt(this,xmlElt);
	}
}