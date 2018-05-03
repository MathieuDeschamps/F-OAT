import {XSDElt} from './XSDElt.js';

export class XSDSequence{
	constructor(seqDef,attrs,table){
		this.table=table;
		this.attrs=attrs;
		
		this.maxOccurs=$(seqDef).attr('maxOccurs');
		if (this.maxOccurs== undefined){
			this.maxOccurs=1;
		}
		this.minOccurs=$(seqDef).attr('minOccurs');
		if (this.minOccurs== undefined){
			this.minOccurs=1;
		}
		if (this.minOccurs>this.maxOccurs){
			alert("Inconsistent minOccurs and maxOccurs");
		}
		
		this.seqElt=[];
		that=this;
		$(seqDef).children('xs\\:element').each(function(i,elt){
			console.log(i,elt);
			that.seqElt.push(new XSDElt(elt,table));
		});
	}
	
	accept(visitor){
		visitor.visitXSDSequence(this);
	}
}