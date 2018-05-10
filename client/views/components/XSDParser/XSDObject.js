import {XSDElt} from './XSDElt.js';
import {XSDSymbolTable} from './XSDSymbolTable.js';
import {XSDStringType} from './XSDStringType.js';
import {XSDBooleanType} from './XSDBooleanType.js';
import {XSDDecimalType} from './XSDDecimalType.js';
import {XSDFloatType} from './XSDFloatType.js';
import {XSDIntegerType} from './XSDIntegerType.js';
import {XSDVoidType} from './XSDVoidType.js';


export class XSDObject{
	
	constructor(XSD){
		// XSD : XSD is the result of the parsing of an xsd file made by jquery

		console.log("XSD constrution");
		
		// Getting the schema node
		schema = $(XSD).find('xs\\:schema');
		
		console.log("schema : ",schema);
		
		// Initialisation of the symbol table
		this.table=new XSDSymbolTable();
		// basic types
		this.table.addType(new XSDStringType());
		this.table.addType(new XSDBooleanType());
		this.table.addType(new XSDDecimalType());
		this.table.addType(new XSDFloatType());
		this.table.addType(new XSDIntegerType());
		this.table.addType(new XSDVoidType());
		
		var byteType=new XSDIntegerType();
		console.log('byteType 1 ',byteType);
		byteType.name='xs:byte';
		console.log('byteType 2 ',byteType);
		byteType.setMinIn(-128);
		console.log('byteType 3 ',byteType);
		byteType.setMaxIn(127);
		console.log('byteType 4 ',byteType);
		this.table.addType(byteType);
		
		// Simple types declarations management
		$(schema).children('xs\\:simpleType').each(function(i,typeDef){
			this.table.createSimpleType(typeDef);
		});
		
		// Complex types declarations management
		$(schema).children('xs\\:complexType').each(function(i,typeDef){
			this.table.createComplexType(typeDef);
		});
		
		console.log("Symbol table initialisation : ",this.table);
		
		// root creation
		rootDescription=$(schema).children('xs\\:element')[0]; // Other elements are ignored if present
		this.root=new XSDElt(rootDescription,this.table);
		
	}
	
	
	accept(visitor){
		visitor.visitXSDObject(this);
	};
}