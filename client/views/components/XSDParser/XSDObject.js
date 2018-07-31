import {XSDElt} from './XSDElt.js';
import {XSDSymbolTable} from './XSDSymbolTable.js';
import {XSDStringType} from './XSDStringType.js';
import {XSDBooleanType} from './XSDBooleanType.js';
import {XSDDecimalType} from './XSDDecimalType.js';
import {XSDFloatType} from './XSDFloatType.js';
import {XSDIntegerType} from './XSDIntegerType.js';
import {XSDVoidType} from './XSDVoidType.js';


/*
Object class for an xsd file.
*/
export class XSDObject{
	/* Constructor
	@XSD: XSD is the result of the parsing of an xsd file made by jquery
	*/
	constructor(XSD){
		// Getting the schema node
		var schema = $(XSD).find('xs\\:schema')[0];
		// Initialisation of the symbol table
		this.table=new XSDSymbolTable();

		// basic types
		this.table.addType(new XSDStringType());
		this.table.addType(new XSDBooleanType());
		this.table.addType(new XSDDecimalType());
		this.table.addType(new XSDFloatType());
		this.table.addType(new XSDIntegerType());
		this.table.addType(new XSDVoidType());
		// byte type
		var byteType=new XSDIntegerType();
		byteType.name='xs:byte';
		byteType.setMinIn(-128);
		byteType.setMaxIn(127);
		this.table.addType(byteType);
		var that = this;

		// Simple types declarations management
		$(schema).children('xs\\:simpleType').each(function(i,typeDef){
			that.table.createSimpleType(typeDef);
		});

		// Complex types declarations management
		$(schema).children('xs\\:complexType').each(function(i,typeDef){
			that.table.createComplexType(typeDef);
		});

		// root creation
		var rootDescription=$(schema).children('xs\\:element')[0]; // Other elements are ignored if present
		this.root=new XSDElt(rootDescription,this.table);
	}

	/* Visitor pattern : accept function
	@visitor: object with a method "visitXSDObject"
	*/
	accept(visitor){
		visitor.visitXSDObject(this);
	};
}
