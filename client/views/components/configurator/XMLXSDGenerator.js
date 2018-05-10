export class XMLXSDGenerator{
	constructor(){
	
	}

	visitXSDObject(objXSD,xml){
		console.log("visitXSDObj");
		rootName=objXSD.root.name;
		xmlRoot=$(xml).find(rootName);
		
		objXSD.attrList.forEach(function(attr){
			console.log("visitXSDObj attr : ",attr);
			name=attr.name;
			value=$(xmlRoot).attr(name);
			console.log(name, value);
		});
		
	}
	
	visitXSDElt(eltXSD,eltXML){
		console.log("visitXSDElt");
		
	}
}