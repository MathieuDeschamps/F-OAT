import {XSDListType} from './XSDListType.js';
import {XSDUnionType} from './XSDUnionType.js';
import {XSDSequence} from './XSDSequence.js';
import {XSDAttr} from './XSDAttr.js';
import {XSDRestrictionType} from './XSDRestrictionType.js';
import {XSDExtensionType} from './XSDExtensionType.js';
import {XSDFloatType} from './XSDFloatType.js';
import {XSDIntegerType} from './XSDIntegerType.js';
import {XSDStringType} from './XSDStringType.js';
import {XSDVoidType} from './XSDVoidType.js';

/*
Object class for symbol table of a xsd file
*/
export class XSDSymbolTable{
	/* Constructor
	*/
	constructor(){

		this.typeTable=new Object();

		this.typeIdNumber=0;
	}

	/* adding a new type in the table
	@type : xsd type object
	*/
	addType(type){
		if (typeof this.typeTable[type.name] == "undefined"){
			//type.table=this;
			this.typeTable[type.name]=type;
		}else{
			alert('XSD problem : type '+type.name+' is already defined.');
		}
	}

	/* getting a type by its name
	@typeName : string
	@returns : XSD type object
	*/
	getType(typeName){
		return this.typeTable[typeName];
	}

	/* getting an anonymous type name
	@returns : string
	*/
	newTypeName(){
		typeName="__type__"+this.typeIdNumber;
		this.typeIdNumber++;
		return typeName;
	}

	/* Create a simple type
	@typeDef : type description obtained by JQuery parsing
	@returns : XSD type object
	*/
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

	/* Create a complex type
	@typeDef : type description obtained by JQuery parsing
	@returns : XSD type object
	*/
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
			/*TODO : complexContent
			  case "complexContent" :
				contentDef=$(typeDef).children("xs\\:complexContent")[0]);
				type=new XSDComplexContent(contentDef,this);
				break;*/
			case "simpleContent" :
				var contentDef=$(typeDef).children("xs\\:simpleContent")[0];
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

	/* Create a restriction type
	@typeDef : type description obtained by JQuery parsing
	@returns : XSD type object
	*/
	createRestrictionType(typeDef){
		var typeName;
		var type;
		var typeType = $(typeDef).attr('base').substr(3);

		if(typeName == undefined){
			typeName=this.newTypeName();
		}

		//string or float or integer default void
		switch(typeType){
			case 'float':
				type=new XSDFloatType();
				break;
			case 'integer':
				type=new XSDIntegerType();
				break;
			case 'string':
				type=new XSDStringType();
				break;
			default:
				type = new XSDVoidType();
		}
		type.name=typeName;
		this.addType(type);
 		return type
	}
	/* Determine the kind of a complex type
	@typeDef : type description obtained by JQuery parsing
	@returns : string
	*/
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
