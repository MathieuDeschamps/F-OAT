import {XMLXSDSequence} from './XMLXSDSequence.js';

export class XMLXSDElt{
	constructor(xmlEltsList,xsdElt){
		console.log('XMLXSDElt donnée : ',xmlEltsList,xsdElt); 
		this.name=xsdElt.name;
		console.log(this.name, xsdElt);
		this.maxOccurs=xsdElt.maxOccurs;
		this.minOccurs=xsdElt.minOccurs;
		console.log('XMLXSDElt name ', this.name);
		this.type=xsdElt.table.getType(xsdElt.type);
		console.log('XMLXSDElt type ', this.type);
		this.eltsList=[];
		
		this.xmlEltsList=xmlEltsList;
		
		
		//console.log('minOccurs',this.minOccurs);
		//console.log('maxOccurs',this.maxOccurs);
		
		console.log('XMLXSDElt eltsList avant ',this.name," : ", this.eltsList);
		
		while(this.eltsList.length<this.minOccurs 
		     || ((this.maxOccurs=="unbounded"|| this.eltsList.length<this.maxOccurs) 
				&& this.xmlEltsList.length>0 
				&& this.xmlEltsList[0].localName==this.name)){
				
			this.type.accept(this);
			
			console.log('XMLXSDElt eltsList pendant ',this.name," : ", this.eltsList);
		}
		console.log('XMLXSDElt eltsList après ',this.name," : ", this.eltsList);
	}
	
	visitXSDSequence(xsdSeq){
		// Amodifier si cela ne colle pas : vide ou incomplet
		console.log("Coucou! XMLXSDElt visits XSDSequence ");
		//if (this.xmlEltsList[0].localName==this.name){
		if (this.xmlEltsList[0].localName==this.name){
			var temp=new XMLXSDSequence(this.xmlEltsList[0],xsdSeq);	
			console.log('XMLXSDElt - XMLXSDSequence',temp);
			this.eltsList.push(temp);
			this.xmlEltsList.shift(); 
		}else{
			var temp=new XMLXSDSequence(undefined,xsdSeq);	
			console.log('XMLXSDElt - XMLXSDSequence',temp);
			this.eltsList.push(temp);
		}		
		
	}
	
	visitXSDStringType(type){
		
		if (this.xmlEltsList[0].localName==this.name){
			console.log("Coucou! XMLXSDElt visits XSDStringType : ",this.xmlEltsList[0].textContent);
			this.eltsList.push(this.xmlEltsList[0].textContent);	
			this.xmlEltsList.shift(); 
		}else{
			this.eltsList.push(undefined);
		}

	}
	
	visitXSDDecimalType(type){
		if (this.xmlEltsList[0].localName==this.name){
			console.log("Coucou! XMLXSDElt visits XSDDecimalType : ",this.xmlEltsList[0].textContent);
			this.eltsList.push(type.convert(this.xmlEltsList[0].textContent));	
			this.xmlEltsList.shift(); 
		}else{
			this.eltsList.push(undefined);
		}
	}
	
	visitXSDFloatType(type){
		if (this.xmlEltsList[0].localName==this.name){
			console.log("Coucou! XMLXSDElt visits XSDFloatType : ",this.xmlEltsList[0].textContent);
			this.eltsList.push(type.convert(this.xmlEltsList[0].textContent));	
			this.xmlEltsList.shift(); 
		}else{
			this.eltsList.push(undefined);
		}
	}
	
	visitXSDIntegerType(type){
		if (this.xmlEltsList[0].localName==this.name){
			console.log("Coucou! XMLXSDElt visits XSDIntegerType : ",this.xmlEltsList[0].textContent);
			this.eltsList.push(type.convert(this.xmlEltsList[0].textContent));	
			this.xmlEltsList.shift(); 
		}else{
			this.eltsList.push(undefined);
		}
	}
	
	visitXSDBooleanType(type){
		if (this.xmlEltsList[0].localName==this.name){
			console.log("Coucou! XMLXSDElt visits XSDBooleanType : ",this.xmlEltsList[0].textContent);
			this.eltsList.push(type.convert(this.xmlEltsList[0].textContent));	
			this.xmlEltsList.shift(); 
		}else{
			this.eltsList.push(undefined);
		}
	}
	
	
	
	accept(visitor){
		visitor.XMLXSDElt(this);
	}
}