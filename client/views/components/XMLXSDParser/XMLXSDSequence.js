import {XMLXSDAttr} from './XMLXSDAttr.js';
import {XMLXSDElt} from './XMLXSDElt.js';

export class XMLXSDSequence{
	constructor(xmlElt,xsdSeq){
		// récupérer attributs et éléments...
		//this.xmlElt=xmlElt;
		
		this.attrs={};
		
		
		console.log('XMLXSDSequence - xsdseq : ',xsdSeq);
		console.log('XMLXSDSequence - xsdseq.attrs : ',xsdSeq.attrs);
		console.log('XMLXSDSequence - xmlElt : ',xmlElt);
		
		var that=this;
		Object.keys(xsdSeq.attrs).forEach(function(xsdAttr,i){
			console.log('XMLXSDSequence - xsdAttr.name ',xsdAttr);
			console.log('XMLXSDSequence - $(xmlElt).attr(xsdAttr)',$(xmlElt).attr(xsdAttr));
			console.log('XMLXSDSequence - xsdSeq.attrs[xsdAttr]',xsdSeq.attrs[xsdAttr]);
			that.attrs[xsdAttr]=new XMLXSDAttr($(xmlElt).attr(xsdAttr),xsdSeq.attrs[xsdAttr]);
		});
		
		console.log("Sequence - attributs : ",this.attrs);
		
		this.minO=xsdSeq.minOccurs;
		this.maxO=xsdSeq.maxOccurs;
		
		var xmlEltsListJQ=$(xmlElt).children();
		console.log('Sequence - xmlEltsListJQ',xmlEltsListJQ);
		var xmlEltsList=[];
		xmlEltsListJQ.each(function(i,elt){
			xmlEltsList.push(elt);
		});
		
		console.log('Sequence - xmlEltsList',xmlEltsList)
		
		this.seqList=[]; // list of lists of list of list...
		
		while (this.seqList.length<this.minO || (xmlEltsList.length>0 && this.seqList.length<this.maxO)){
			var seq=[];
			xsdSeq.seqElt.forEach(function(xsdElt){
				console.log('Sequence avant : ', xmlEltsList);
				seq.push(new XMLXSDElt(xmlEltsList,xsdElt));
				console.log("Sequence après : ",xmlEltsList);
			});
			this.seqList.push(seq);
		}
		if (xmlEltsList.lenght>0){
			console.log("Too long sequence");
		}
	}
	

	
	
	accept(visitor){
		visitor.visitXMLXSDSequence(this);
	}
}