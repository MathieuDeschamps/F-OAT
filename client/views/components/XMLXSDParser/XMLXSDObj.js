import {XMLXSDElt} from './XMLXSDElt.js';

export class XMLXSDObj{
	constructor(xml,xsdObj){
	/*	génère l'object à partir du xml parsé par jquery et de l'objet xsd
	
	
	
	// xsdObj.root est un élément qui décrit le xsd.
	// sa table de symbole est le nom de son type permette de connaître son type
	
	this.xml=xml;
	
	this.attrs={};
	
	this.nodeList=[];
	
	// récupérr le nom du noeud root
	this.rootName=xsdObj.root.name;
	
	this.type=xsdObj.table[xsdObj.root.type];
	
	
	this.type.accept();
	*/
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
				console.log("Coucou!", xmlNode);
				this.content=new XMLXSDElt(xmlNode,xsdObj.root);
				break;
			default : 
				alert('An XML file has only one root node');
		}
	}else{
		this.content=new XMLXSDElt(undefined,xsdObj.root);
	}
	
	
	}
	
	
	/*visitXSDSequence(xsdSeq){
		// empiler les noeuds en jquery
		var stack=new Stack();
		
		//
		this.nodeList=[];
		// 
		var i=0;
		while (i<=xsdSeq.minOccurs|| i<=xsdSeq.maxOccurs && !stack.empty()){
			
		}
	}*/
	
	
	
	accept(obj){
		obj.visitXMLXSDObject(this);
	}
	
}