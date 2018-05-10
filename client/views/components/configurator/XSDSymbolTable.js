import {XSDListType} from './XSDListType.js';
import {XSDUnionType} from './XSDUnionType.js';
import {XSDSequence} from './XSDSequence.js';
import {XSDAttr} from './XSDAttr.js';


export class XSDSymbolTable {
	constructor(baseTypes,XSDDeclaredSimpleTypes,XSDDeclaredComplexTypes){
		// baseTypes : list of basic types
		// XSDDeclaredTypes : liste of declared types descriptions
		
		this.typeTable=new Object();
		
		this.undefTypeObj=[];
		
		baseTypes.forEach(function(type){
			this.addType(type);
		});
		
		XSDDeclaredSimpleTypes.forEach(function(typeDef){
			name=$(typeDef).attr('name');
			type=this.createSimpleType(typeDef);
			this.typeTable[name]=type;
		})
			
		XSDDeclaredComplesTypes.forEach(function(typeDef){
			name=$(typeDef).attr('name');
			type=this.createComplexType(typeDef);
			this.typeTable[name]=type;
		});
		
		this.undefTypeObj.forEach(function(obj){
			typeName=obj.getType();
			type=this.typeTable[typeName];
			if (type == undefined){
				alert("type ",typeName," undefined for : ",obj);
			}else{
				obj.setType(type);
			}
		});
	}
	
	
	initType(obj,typeName){
		type=this.typeTable[typeName];
		if (type == undefined){
			obj.setType(typeName);
			this.undefTypeObj.push(obj);
		}else{
			obj.setType(type);
		}
	}
	
	addType(type){
		if (typeof this.typeTable[type.name] == "undefined"){
			this.typeTable[type.name]=type;
		}else{
			alert('XSD problem : type '+type.name+' is already defined.');
		}
	}
	
	getType(typeName){
		/* Renvoi le type s'il est défini.
		Renvoi le nom du type sinon.
		*/
		type=this.typeTable[typeName];
		console.log('type ', typeName, " : ", type);
		if (typeof type == "undefined"){
			if (this.parent !== undefined && this.parent !== null ){
				type=this.parent.getType(typeName);
			}else{
				alert('XSD problem : type '+type.name+'is unknown.');
			}
		}
		return type;
	}
	
	createSimpleType(typeDef){
		
		//name=$(typeDef).attr('name');
		
		// list ou union ou restriction
		nbDescription=0;
		if (typeDef.children('xs\\:list').length!=0){
			nbDescription++;
			if (this.children('xs\\:list').length!=1){
				alert('XSD problem : multi typed list');
			}
			typeType="list";
		}
		if (typeDef.children('xs\\:union').length!=0){
			nbDescription++;
			typeType='union';
		}
		if (typeDef.children('xs\\:restriction').length!=0){
			nbDescription++;
			typeType='restriction';
		}
		
		if (nbDescription==0){
			alert('XSD problem : simple type undefined');
		}else if (nbDescription !=1){
			alert('XSD problem : simple type multi defined');
		}else {
			if (typeType=='list') {
				type=new XSDListType(this.children('xs\\:list')[0]);
			}
				
			if (typeType=='union'){
				type=new XSDUnionType(this.children('xs\\:union'));
			}
			if (typeType=='restriction'){
				restrict=typeDef.children('xs\\:restriction');
				baseTypeName=restrict.attr('base');
				baseType=this.getType(baseTypeName);
				type=baseType.restriction(restrict,name);
			}
		}
		
		//if (typeof name !=="undefined"){
		//	this.addType(type);
		//}
		
		return type;
	}
	
	
	createComplexType(typeDef){
		name=$(typeDef).attr("name");
		switch (this.complexTypeKind(typeDef)){
			case "sequence" : 
				attrs={};
				$(typeDef).children("xs\\:attribute").each(function(i,attr){
					attrObj=new XSDAttr(attr,that);
					if (attrs[attrObj.name] == undefined){
						attrs[attrObj.name]=attrObj;
					}else{
						alert("XSD attribute ",attrObj.name," cannot be defined twice.");
					}
				});
				seqDef=$(typeDef).children("xs\\:sequence")[0];				
				type=new XSDSequence(seqDef,attrs,this);
				break;
			/*case "complexContent" :
				contentDef=$(typeDef).children("xs\\:complexContent")[0]);
				type=new XSDComplexContent(contentDef,this);
				break;
			case "simpleContent" :
				contentDef=$(typeDef).children("xs\\:simpleContent")[0]);
				type=new XSDSimpleContent(contentDef,this);
				break;*/
		};
		if (type !==undefined && name!== undefined){
			type.name=name;
			this.addType(type);
		}
		return type
	}
	
	complexTypeKind(typeDef){
		// undefined si mal défini
		N=0;
		switch ($(typeDef).children("xs\\:sequence").length){
			case 0 : break;
			case 1 : kind="sequence";
			         N++;
					 break;
			default: N=2;
		}
		
		switch ($(typeDef).children("xs\\:complexContent").length){
			case 0 : break;
			case 1 : if ($(typeDef).children("xs\\:attribute").length==0){
						kind="complexContent";
						N++;
					}else{
						N=2;
					}
					break;
			default: N=2;
		}
		
		switch ($(typeDef).children("xs\\:simpleContent").length){
			case 0 : break;
			case 1 : if ($(typeDef).children("xs\\:attribute").length==0){
						kind="simpleContent";
						N++;
					}else{
						N=2;
					}
					break;
			default: N=2;
		}
		if (N==1){
			return kind;
		}
	}
	
}
