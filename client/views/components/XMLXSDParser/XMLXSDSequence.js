import {XMLXSDAttr} from './XMLXSDAttr.js';
import {XMLXSDElt} from './XMLXSDElt.js';

/*
Object class for XML element in a sequence described by a XSDSequence².
*/
export class XMLXSDSequence{
	/* Constructor
	@xmlElt : list of XML obtained by JQuery parsing
	@xsdSeq : XSDSequence object
	*/
	constructor(xmlElt,xsdSeq){
		this.attrs={};

		this.name="sequence";

		var that=this;
		Object.keys(xsdSeq.attrs).forEach(function(xsdAttr,i){
			that.attrs[xsdAttr]=new XMLXSDAttr($(xmlElt).attr(xsdAttr),xsdSeq.attrs[xsdAttr]);
		});

		this.minOccurs=xsdSeq.minOccurs;
		this.maxOccurs=xsdSeq.maxOccurs;

		var xmlEltsListJQ=$(xmlElt).children();
		var xmlEltsList=[];
		xmlEltsListJQ.each(function(i,elt){
			xmlEltsList.push(elt);
		});

		this.seqList=[]; // list of lists of list of list...

		/* The following greedy algorithm doesn't work in every cases.
		TODO : Handling all cases...
		*/
		while (this.seqList.length<this.minOccurs || (xmlEltsList.length>0 && this.seqList.length<this.maxOccurs)){
			var seq=[];
			xsdSeq.seqElt.forEach(function(xsdElt){
				seq.push(new XMLXSDElt(xmlEltsList,xsdElt));
			});
			this.seqList.push(seq);
		}
		if (xmlEltsList.lenght>0){
			console.log("Too long sequence");
		}
	}

	/* Visitor pattern : accept function
	@ visitor : object with a method "visitXMLXSDSequence"
	*/
	accept(visitor){
		visitor.visitXMLXSDSequence(this);
	}
}
