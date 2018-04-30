import {Stack} from './Stack.js';
import {XMLXSDObj} from './XMLXSDObj.js';

export class XMLXSDGenerator{

	constructor(){
	
	}

	generate(xml,xsdObj){
		//this.stack=new Stack();
		
		//this.stack.push(xml);
		
		//xsdObj.accept(this);
		console.log(new XMLXSDObj(xml,xsdObj));
	}
	
	visitXSDObject(xsdObj){
		
		var xml=this.stack.pop();
		console.log(this.stack);
		console.log("top",xml);
		var temp=[];
		$(xml).children().each(function(i,elt){
			temp[i]=elt;
			console.log(i,elt.localName);
		});
		console.log("children",temp);
		console.log("root name : ",xsdObj.root.name);
		console.log($(xml).children(xsdObj.root.name));
		this.stack.push($(xml).children(xsdObj.root.name)[0]);
		xsdObj.root.accept(this);
	}
	
	visitXSDElt(xsdElt){
		var eltName=xsdElt.name;
		var minO=xsdElt.minOccurs;
		var maxO=xsdElt.maxOccurs;
		var xml;
		var eltType=xsdElt.table.getType(xsdElt.type);
		console.log("coucou!", this.stack.topElt());
		var i=0;
		console.log(this.stack.topElt().localName);
		while (i<minO || i<maxO && this.stack.topElt().localName==eltName){
			xml=this.stack.topElt(); // Le type va décomposer le noeud
			if (xml.localName == eltName){
				//console.log("coucou!");
				console.log(eltType);
				//console.log(this.stack);
				//this.stack.append($(xml).children());
				eltType.accept(this);
			}
			i++;
		}
	}
	
	
	visitXSDSequence(xsdSeq){
		console.log("XSDSequence");
		// récupérer les attributs?? 
		
		
		
		// éclatement du noeud
		var xml=this.stack.pop();
		console.log(xml);
		console.log($(xml).children());
		this.stack.append($(xml).children());
		console.log("xsdSeq",this.stack);
		// 
		
		var minO=xsdSeq.minOccurs;
		var maxO=xsdSeq.maxOccurs;
		var xsdSeqElt=xsdSeq.seqElt;
		
		console.log("coucou!");
		var i=0;
		while (i<minO || i<maxO && this.stack.topElt().localName==xsdSeqElt[0].name){
			console.log("XSDSequence",i,this.stack);
			var that=this;
			xsdSeqElt.forEach(function(xsdElt){
				console.log("XSDSequence",xsdElt,that.stack);
				xml=that.stack.pop()
				if (xml.localName == xsdElt.name){
					//console.log("coucou!");
					//console.log(eltType);
					//console.log(this.stack);
					that.stack.append($(xml).children());
					xsdElt.accept(that);
				}
			});
			i++;
		}
	}
	
	visitXSDString(xsdStr){
		console.log("coucou string");
	}
}