import {XSDListType} from './XSDListType.js';
import {XSDUnionType} from './XSDUnionType.js';
import {XSDSequence} from './XSDSequence.js';
import {XSDAttr} from './XSDAttr.js';
import {XSDRestrictionType} from './XSDRestrictionType.js';
import {XSDExtensionType} from './XSDExtensionType.js';

export class XSDSymbolTable{

	constructor(){
		
		this.typeTable=new Object();
		
		this.typeIdNumber=0;
	}
	
	
	addType(type){
		if (typeof this.typeTable[type.name] == "undefined"){
			//type.table=this;
			this.typeTable[type.name]=type;
		}else{
			console.log(this);
			alert('XSD problem : type '+type.name+' is already defined.');
		}
	}
	
	getType(typeName){
		return this.typeTable[typeName];
	}
	
	newTypeName(){
		typeName="__type__"+this.typeIdNumber;
		this.typeIdNumber++;
		return typeName;
	}
	
	createSimpleType(typeDef){
		var typeName=$(typeDef).attr('name');
		var type;
		var typeType;
		
		if (typeName == undefined){
			typeName=this.newTypeName();
		}

		// list ou union ou restriction
		var nbDescription=0;
		if ($(typeDef).children('xs\\:list').length!=0){
			nbDescription++;
			if (this.children('xs\\:list').length!=1){
				alert('XSD problem : multi typed list');
			}
			typeType="list";
		}
		if ($(typeDef).children('xs\\:union').length!=0){
			nbDescription++;
			typeType='union';
		}
		if ($(typeDef).children('xs\\:restriction').length!=0){
			nbDescription++;
			typeType='restriction';
		}
		
		if (nbDescription==0){
			alert('XSD problem : simple type undefined');
		}else if (nbDescription !=1){
			alert('XSD problem : simple type multi defined');
		}else {
			switch(typeType) {
			case 'list' :
				type=new XSDListType($(typeDef).children('xs\\:list')[0],this);
				break;
			case 'union' :
				type=new XSDUnionType($(typeDef).children('xs\\:union')[0],this);
				break;
			case 'restriction' : 
				type=new XSDRestrictionType($(typeDef).children('xs\\:restriction')[0],this);
				break;
			}
			type.name=typeName;
		}
		
		this.addType(type);
		
		return typeName;
	}
	
	createComplexType(typeDef){
		var typeName=$(typeDef).attr("name");
		
		if (typeName == undefined){
			typeName=this.newTypeName();
		}
		
		var type;
		
		switch (this.complexTypeKind(typeDef)){
			case "sequence" : 
				var attrs={};
				var that=this;
				console.log("XSDSymbolTable - sequence : ",typeDef);
				console.log("XSDSymbolTable - sequence : ",$(typeDef).children("xs\\:attribute"));
				$(typeDef).children("xs\\:attribute").each(function(i,attr){
					attrObj=new XSDAttr(attr,that);
					if (attrs[attrObj.name] == undefined){
						attrs[attrObj.name]=attrObj;
					}else{
						alert("XSD attribute ",attrObj.name," cannot be defined twice.");
					}
				});
				
				var seqDef=$(typeDef).children("xs\\:sequence")[0];
				type=new XSDSequence(seqDef,attrs,this);
				break;
			/*case "complexContent" :
				contentDef=$(typeDef).children("xs\\:complexContent")[0]);
				type=new XSDComplexContent(contentDef,this);
				break;*/
			case "simpleContent" :
				var contentDef=$(typeDef).children("xs\\:simpleContent")[0];
				//type=new XSDSimpleContent(contentDef,this);
				var restrict=$(contentDef).children('xs\\:restriction');
				var extens=$(contentDef).children('xs\\:extension');
				switch(restrict.length+extens.length){
					case 0 : 
						alert('XSDSimpleContent undefined');
						break;
					case 1 : 
						if (restrict.length==1){
							type=new XSDRestrictionType(restrict[0],this);
						}
						else {
							type=new XSDExtensionType(extens[0],this);
						}
						break;
					default :
						alert('XSDSimpleContent multi-defined');
				}
				break;
		};
		if (type !== undefined ){
			type.name=typeName;
			this.addType(type);
		}
		
		return typeName;		
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