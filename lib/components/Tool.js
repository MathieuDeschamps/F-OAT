// class which contains various methods
export class Tool{

  // remove a attr from the document
  static removeAttrAll(document, attr){
    $(document).removeAttr(attr);

      $(document).children().each(function(i,e){
        Tool.removeAttrAll(e, attr)
      })
    return document
  }

  // convert document to String
  static convertDocumentToString(document, depth){
    var result =""
    var nodeName = String(document.nodeName)

    // set the tabulation with the depth
    var tab = ""
    for(i = 0; i < depth; i++ ){
      tab += "\t"
    }
    // add the node and the attributes
    result += tab +"<" + nodeName
    $(document.attributes).each(function(i,attr){
        result += " " + String(attr.name) + "=\"" + String(attr.value) +"\""
    })
    if($(document).text() != "" || $(document).children().length > 0){
      result += ">"
    }else{
      result += "/>"
    }
    // add the children to the result
    if ($(document).children().length > 0){
      result += "\n"
      $(document).children().each(function(i,child){
        result += Tool.convertDocumentToString(child, depth + 1) + "\n"
      })
      result += tab
    }else{
      result += $(document).text()
    }
    if($(document).text() != "" || $(document).children().length > 0){
      result += "</" + nodeName + ">"
    }

    return result
  }

}
