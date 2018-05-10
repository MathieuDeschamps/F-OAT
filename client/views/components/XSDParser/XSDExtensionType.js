import {XSDAttr} from './XSDAttr.js';

export class XSDExtensionType{

	constructor(extens,table){
		
		this.table=table;
		
		this.baseType=$(extens).attr('base');
		
		var attrs={};
		console.log("test : extension");
		$(extens).children('xs\\:attribute').each(function(i,attr){
			console.log("test : extension",i);
			attrObj=new XSDAttr(attr,table);
			if (attrs[attrObj.name] == undefined){
				console.log("test : extension",i);
				attrs[attrObj.name]=attrObj;
			}else{
				alert("XSD attribute ",attrObj.name," cannot be defined twice.");
			}
			console.log("test : extension",i);
		})
		this.attrs=attrs;
		
	}
	
	accept(visitor){
		visitor.visitXSDExtensionType(this);
	}
	
}