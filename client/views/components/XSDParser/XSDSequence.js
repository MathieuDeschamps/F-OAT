import {XSDElt} from './XSDElt.js';

/*
Object class for sequence in a xsd file.
*/
export class XSDSequence{
	/*Constructor
	@seqDef : description of the sequence obtained by JQuery parsing
	@attrs : list of XSDAttr objects
	@table : symbol table
	*/
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

		// tmp variable beacuse copy this have some trouble
		//miss some elements in each loop
		var seqElt = []

		$(seqDef).children('xs\\:element').each(function(i,elt){
			seqElt.push(new XSDElt(elt,table));
		});
		this.seqElt = seqElt
	}

	/* Visitor pattern : accept function
	@ visitor : object with a method "visitXSDSequence"
	*/
	accept(visitor){
		visitor.visitXSDSequence(this);
	}
}
