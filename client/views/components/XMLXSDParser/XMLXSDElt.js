import {XMLXSDSequence} from './XMLXSDSequence.js';
import {XMLXSDNodeValue} from './XMLXSDNodeValue.js';
import {XMLXSDExtensionType} from './XMLXSDExtensionType.js';

/*
Object class for elements linked to a xsd dexcription
*/
export class XMLXSDElt{
	/*Constructor
	@xmlEltsList : list of elements obtained by JQuery parsing
	@xsdElt : XSDElt object
	*/
	constructor(xmlEltsList,xsdElt){
		this.name=xsdElt.name;

		this.maxOccurs=xsdElt.maxOccurs;
		this.minOccurs=xsdElt.minOccurs;

		this.type=xsdElt.table.getType(xsdElt.type);

		this.eltsList=[];
		if (xsdElt.fixed!=undefined){
			this.fixed=xsdElt.fixed;
		}

		if (xmlEltsList!=undefined){
			this.xmlEltsList=xmlEltsList;
		}else{
			this.xmlEltsList=[];
		}

		while(this.eltsList.length<this.minOccurs
		    || ((this.maxOccurs=="unbounded"|| this.eltsList.length<this.maxOccurs)
			&& this.xmlEltsList.length>0
			&& this.xmlEltsList[0].localName==this.name)){

				this.type.accept(this);
		}
	}

	/* Add an object to EltsList (case of sequenced element)
	@xsdSeq : XSDSequence object
	*/
	visitXSDSequence(xsdSeq){
		if (this.xmlEltsList.length!=0 && this.xmlEltsList[0].localName==this.name){
			var temp=new XMLXSDSequence(this.xmlEltsList[0],xsdSeq);
			this.eltsList.push(temp);
			this.xmlEltsList.shift();
		}else{
			var temp=new XMLXSDSequence(undefined,xsdSeq);
			this.eltsList.push(temp);
		}
	}

	/* Add an object to EltsList (case of extension Type object)
	@type : xsd restriction type object
	*/
	visitXSDExtensionType(type){
		if (this.xmlEltsList.length!=0 && this.xmlEltsList[0].localName==this.name){
			var temp=new XMLXSDExtensionType(this.xmlEltsList[0],type);
			this.eltsList.push(temp);
			this.xmlEltsList.shift();
		}else{
			var temp=new XMLXSDExtensionType(undefined,type);
			this.eltsList.push(temp);
		}

	}

	/* Add an object to EltsList (case of string element)
	@type : string type xsd object
	*/
	visitXSDStringType(type){
		if (this.xmlEltsList.length!=0 && this.xmlEltsList[0].localName==this.name){
			if (this.fixed==undefined){
				this.eltsList.push(new XMLXSDNodeValue(type.convert(this.xmlEltsList[0].textContent),type));
			}else{
				this.eltsList.push(new XMLXSDNodeValue(this.fixed,type));
			}
			this.xmlEltsList.shift();
		}else{
			if (this.fixed!=undefined){
				this.eltsList.push(new XMLXSDNodeValue(this.fixed,type));
			}else{
				this.eltsList.push(new XMLXSDNodeValue(this.default,type));
			}
		}
	}

	/* Add an object to EltsList (case of decimal element)
	@type : xsd decimal type object
	*/
	visitXSDDecimalType(type){
		if (this.xmlEltsList.length!=0 && this.xmlEltsList[0].localName==this.name){
			if (this.fixed==undefined){
				this.eltsList.push(new XMLXSDNodeValue(type.convert(this.xmlEltsList[0].textContent),type));
			}else{
				this.eltsList.push(new XMLXSDNodeValue(this.fixed,type));
			}
			this.xmlEltsList.shift();
		}else{
			if (this.fixed!=undefined){
				this.eltsList.push(new XMLXSDNodeValue(this.fixed,type));
			}else{
				this.eltsList.push(new XMLXSDNodeValue(this.default,type));
			}
		}
	}

	/* Add an object to EltsList (case of float element)
	@type : xsd float type object
	*/
	visitXSDFloatType(type){
		if (this.xmlEltsList.length!=0 && this.xmlEltsList[0].localName==this.name){
			if (this.fixed==undefined){
				this.eltsList.push(new XMLXSDNodeValue(type.convert(this.xmlEltsList[0].textContent),type));
			}else{
				this.eltsList.push(new XMLXSDNodeValue(this.fixed,type));
			}
			this.xmlEltsList.shift();
		}else{
			if (this.fixed!=undefined){
				this.eltsList.push(new XMLXSDNodeValue(this.fixed,type));
			}else{
				this.eltsList.push(new XMLXSDNodeValue(this.default,type));
			}
		}
	}

	/* Add an object to EltsList (case of integer element)
	@type : xsd integer type object
	*/
	visitXSDIntegerType(type){
		if (this.xmlEltsList.length!=0 && this.xmlEltsList[0].localName==this.name){
			if (this.fixed==undefined){
				this.eltsList.push(new XMLXSDNodeValue(type.convert(this.xmlEltsList[0].textContent),type));
			}else{
				this.eltsList.push(new XMLXSDNodeValue(this.fixed,type));
			}
			this.xmlEltsList.shift();
		}else{
			if (this.fixed!=undefined){
				this.eltsList.push(new XMLXSDNodeValue(this.fixed,type));
			}else{
				this.eltsList.push(new XMLXSDNodeValue(this.default,type));
			}
		}
	}

	/* Add an object to EltsList (case of boolean element)
	@type : xsd boolean type object
	*/
	visitXSDBooleanType(type){
		if (this.xmlEltsList.length!=0 && this.xmlEltsList[0].localName==this.name){
			if (this.fixed==undefined){
				this.eltsList.push(new XMLXSDNodeValue(type.convert(this.xmlEltsList[0].textContent),type));
			}else{
				this.eltsList.push(new XMLXSDNodeValue(this.fixed,type));
			}
			this.xmlEltsList.shift();
		}else{
			if (this.fixed!=undefined){
				this.eltsList.push(new XMLXSDNodeValue(this.fixed,type));
			}else{
				this.eltsList.push(new XMLXSDNodeValue(this.default,type));
			}
		}
	}

	/* Add an object to EltsList (case of void element)
	@type : xsd void type object
	*/
	visitXSDVoidType(type){
		if (this.xmlEltsList.length!=0 && this.xmlEltsList[0].localName==this.name){
			if (this.fixed==undefined){
				this.eltsList.push(new XMLXSDNodeValue(type.convert(this.xmlEltsList[0].textContent),type));
			}else{
				this.eltsList.push(new XMLXSDNodeValue(this.fixed,type));
			}
			this.xmlEltsList.shift();
		}else{
			if (this.fixed!=undefined){
				this.eltsList.push(new XMLXSDNodeValue(this.fixed,type));
			}else{
				this.eltsList.push(new XMLXSDNodeValue(this.default,type));
			}
		}
	}
	/* Visitor pattern : accept function
	@ visitor : object with a method "visitXMLXSDElt"
	*/
	accept(visitor){
		visitor.visitXMLXSDElt(this);
	}
}
