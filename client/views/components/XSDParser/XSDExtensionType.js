import {XSDAttr} from './XSDAttr.js';


/*
Object class for extension type of an xsd file.
*/
export class XSDExtensionType{
	/* Constructor
	@extens : extensionType description from JQuery parsing
	@table : symbol table
	*/
	constructor(extens,table){
		this.table=table;
		
		this.baseType=$(extens).attr('base');
		
		var attrs={};
		$(extens).children('xs\\:attribute').each(function(i,attr){
			attrObj=new XSDAttr(attr,table);
			if (attrs[attrObj.name] == undefined){
				attrs[attrObj.name]=attrObj;
			}else{
				alert("XSD attribute ",attrObj.name," cannot be defined twice.");
			}
		})
		this.attrs=attrs;
	}
	
	
	/* Visitor pattern : accept function 
	@ visitor : object with a method "visitXSDExtensionType"
	*/
	accept(visitor){
		visitor.visitXSDExtensionType(this);
	}
	
}