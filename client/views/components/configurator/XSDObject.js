import {XSDElt} from './XSDElt.js';
import {XSDAttr} from './XSDAttr.js';
import {XSDSymbolTable} from './XSDSymbolTable.js';
import {XSDStringType} from './XSDStringType.js';
import {XSDBooleanType} from './XSDBooleanType.js';
import {XSDDecimalType} from './XSDDecimalType.js';
import {XSDIntegerType} from './XSDIntegerType.js';


export class XSDObject {
	constructor(XSD){
		
		var schema = $(XSD).find('xs\\:schema');
		console.log("schema ",schema);
		// table des symboles : attention à la portée!!!!
		// Initialisation
		// type de base
		symbolTable=new XSDSymbolTable();
		symbolTable.addType(new XSDStringType());
		symbolTable.addType(new XSDBooleanType());
		symbolTable.addType(new XSDDecimalType());
		symbolTable.addType(new XSDIntegerType());
		
		console.log("symbol table :",symbolTable);
		console.log("symbol table type :",(typeof symbolTable));
		
		//type défini à la racine du schema
		console.log('$(schema) : ',$(schema));
		console.log('Simple type : ',$(schema).children('xs\\:simpleType'));
		
		$(schema).children('xs\\:simpleType').each(function(i,typeDef){
			symbolTable.createSimpleType(typeDef);
		});
		
		console.log("symbol table :",symbolTable);
		console.log("symbol table type :",(typeof symbolTable));
		
		
		$(schema).child('xs\\:complexType').each(function(i,typeDef){
			table.createComplexType(typeDef);
		});
		
		// 
		
		
		
		// Determination de la racine
		this.root;
		elt=$(schema).children('xs\\:element');
		if (elt.length==1){
			this.root=new XSDElt(elt[0],symbolTable);
			console.log('root : ',this.root);
		}else{
			alert('XSD non conforme');
		}
		
		// Détermination des attributs
		this.attrList=[];
		that=this;
		console.log("Attributes : ",  $(schema).children('xs\\:attribute'));
		$(schema).children('xs\\:attribute').each(function(i,attr){
			xsdAttr=new XSDAttr(attr,symbolTable);
			console.log('xsdAttr : ',xsdAttr);
			that.attrList.push(xsdAttr);
		});
		console.log('attribute list : ', this.attrList);
	};
	
	accept(visitor,xml){
		visitor.visitXSDObject(this,xml);
	};
}