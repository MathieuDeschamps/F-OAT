export class Writer{


  /* Replace the annotation of the extractor by the new annotation
  @xmlObject the XMLDocument of the project
  @extractor the extractor which will be replace
  @newAnnotation the xml which contains the annotation
  @returns the xmlObject
  */
  static replaceAnnotation(xmlObject, extractor, newAnnotation){
    if(typeof xmlObject === 'undefined' &&
      typeof extractor === 'undefined' &&
      typeof annotation === 'undefined'){
        console.log('replaceAnnotation : Illegal Argument Exception')
    }else{
      var selector = $(extractor).prop('tagName')
      selector += '[name="' + $(extractor).attr('name') + '"]'
      selector += '[version="' + $(extractor).attr('version') + '"]'
      var oldAnnotation = $(xmlObject).find('extractors').first().children(selector)
      if(oldAnnotation.length === 1){
        $(oldAnnotation).empty()
        $(oldAnnotation).append(newAnnotation)
      }
      return xmlObject
    }
  }

  /* convert a XMLDocument into a String
  @xmlDocument the XMLDocumet to convert
  @depth is the number of tabulation at the beginning
  */
  static convertDocumentToString(xmlDocument, depth){
    var result =""
    var nodeName = String(xmlDocument.nodeName)

    // set the tabulation with the depth
    var tab = ""

    if(depth!=0){
      for(i = 1; i < depth; i++ ){
        tab += "\t"
      }
      // add the node and the attributes
      result += tab +"<" + nodeName
      $(xmlDocument.attributes).each(function(i,attr){
          result += " " + String(attr.name) + "=\"" + String(attr.value) +"\""
      })
      if($(xmlDocument).text() != "" || $(xmlDocument).children().length > 0){
        result += ">"
      }else{
        result += "/>"
      }
    }
    // add the children to the result
    if ($(xmlDocument).children().length > 0){
      result += "\n"
      $(xmlDocument).children().each(function(i,child){
        result += Writer.convertDocumentToString(child, depth + 1) + "\n"
      })
      result += tab
    }else{
      result += $(xmlDocument).text()
    }

    if(depth!=0){
      if($(xmlDocument).text() != "" || $(xmlDocument).children().length > 0){
        result += "</" + nodeName + ">"
      }
    }
    return result;
  }
}
