
/*
Object class for restriction type linked to its xsd dexcription
*/
export class XMLXSDRestrictionType{
	/*Constructor
	@xml : description of the element by JQuery parsing
	@extType : XSDExtensionType object
	*/
	constructor(xml,restrType){

		this.type=restrType;

		this.baseType=restrType.table.getType(restrType.baseType);

		this.name="restriction";
	}


	/* Visitor pattern : accept function
	@ visitor : object with a method "visitXMLXSDRestrictionType"
	*/
	accept(visitor){
		visitor.visitXMLXSDRestrictionType(this)
	}
}
