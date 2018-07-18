import {XMLXSDElt} from './XMLXSDElt.js';

/*
Object class for an XML file described by a XSD file.
*/
export class XMLXSDObj{
	/* Constructor
	@xml: parsing of an xml file by JQuery
	@xsdObj: XSDObj object
	*/
	constructor(xml,xsdObj){
		if (xml!=undefined){
			var xmlNode=[];
			$(xml).children().each(function(i,elt){
				xmlNode[i]=elt;
			});

			switch(xmlNode.length){
				case 0 :
					alert('Your xml file is empty');
					break;
				case 1 :
					this.content=new XMLXSDElt(xmlNode,xsdObj.root);
					break;
				default :
					alert('An XML file has only one root node');
			}
		}else{
			this.content=new XMLXSDElt(undefined,xsdObj.root);
		}
	}

	/* Visitor pattern : accept function
	@visitor: object with a method "visitXMLXSDObject"
	*/
	accept(visitor){
		visitor.visitXMLXSDObject(this);
	}
}
