import {XSDElt} from './XSDElt.js';

export class XSDSequence {
	constructor(seqDef,attrs,table){
		this.attrs=attrs;
		this.minOccurs=$(seqDef).attr('minOccurs');
		this.maxOccurs=$(seqDef).attr('maxOccurs');
		
		this.elts=[];
		
		that=this;
		console.log("coucou XSDSequence");
		$(seqDef).children().each(function(i,elt){
			console.log("nodeName ",$(elt).prop('nodeName'));
			switch ($(elt).prop('nodeName')){
			case "xs:element" :
				console.log("coucou XSDSequence element : ", elt);
				newElt=new XSDElt(elt,table);
				console.log("coucou XSDSequence element : ", newElt);
				that.elts[i]=newElt;
				break;
			case "xs:sequence" :
				that.elts[i]=new XSDSequence(elt,{},table);
				break;
			};
		});
		
	}
	
	accept(object){
		object.visitXSDSequence(this);
	}
}