export class OmdbApiForm{

	/* Constructor
	@xmlxsdObj : XMLXSDObj object
	@id : id of the form (id of the extractor in MongoDB)
	@name : name of the form (name of the extractor)
	@divId : the id of the div which will contain the code of the form
	*/
	constructor(xmlxsdObj,id,name,divId, visualizer){
		this.xmlxsdObj=xmlxsdObj;
		this.id=id;
		this.name=name;
		this.divId=divId;
		this.visualizer = visualizer
	}

  equals(object){
    var result = false;
    if(typeof this === typeof object){
      result = this.id === object.id &&
        this.name === object.name &&
        this.divId === object.divId
    }
    return result
  }

  /* Generate the code of the form
  */
  generateForm(){
    this.xmlxsdObj.accept(this);
  }

  /* Visitor pattern : visit function
  @xmlxsdObj : XMLXSDObj object
  */
  visitXMLXSDObject(xmlxsdObj){

    xmlxsdObj.content.accept(this);

}

  /* Visitor pattern : visit function
  @xmlxsdElt : XMLXSDElt object
  */
  visitXMLXSDElt(xmlxsdElt){
    var that = this;
    xmlxsdElt.eltsList.forEach(function(elt,i){
      elt.accept(that);
    })
  }

  /* Visitor pattern : visit function
  @xmlxsdSeq : XMLXSDSequence object
  */
  visitXMLXSDSequence(xmlxsdSeq){
    var that = this
    xmlxsdSeq.seqList.forEach(function(seq, k){
      seq.forEach(function (xmlxsdElt, j){
        xmlxsdElt.eltsList.forEach(function(elt, i){
          elt.accept(that);
        })
      })
    })
  }

  /* Visitor pattern : visit function
  @xmlxsdNodeValue: XMLXSDNodeValue object
  */
  visitXMLXSDNodeValue(xmlxsdNodeValue){
  }

  /* Visitor pattern : visit function
  @xmlxsdExt : XMLXSDExtensionType object
  */
  visitXMLXSDExtensionType(xmlxsdExt){
    $("#"+this.divId).html(this.generateAttrsForm(xmlxsdExt));
  }

  generateAttrsForm(obj){
    var that=this;
		var result = '';
		$.each(obj.attrs,function(key,attr){
      switch(attr.name){
        case "title" :
          result += "<p class='flow-text'>"+attr.value+"</p>";
          break;
        default :
          result += "<p><b>"+that.capitalizeFirstLetter(attr.name)+" :</b> "+attr.value+"</p>";
      }
    });
    return result;
  }

  /* Observer pattern : update function
	*/
	updateVisualizer(){
		this.xmlxsdObj = this.visualizer.getXmlXsdObj();
		this.generateForm();
	}

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
