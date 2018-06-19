import { Parser } from '../class/Parser.js'

export class Writer{


  /* add remove an extrator to the XMLObject
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


  // add remove an extrator to the XMLObject
  static removeExtractor(xmlObject, extractor){
    var selector = $(extrator).prop('tagName')
    selector += '[name="' + $(extractor).attr('name') + '"]'
    selector += '[version="' + $(extractor).attr('version') + '"]'
    $(xmlObject).find('extractors').children(selector)

  }

  // add an extractor to the XMLObject
  static addExtractor(xmlObject, extractor, annotation){
    $(xmlObject).find('extractors').append(extractor)
    return xmlObject
  }

  static convertDocumentToString(document, depth){
    var result =""
    var nodeName = String(document.nodeName)

    // set the tabulation with the depth
    var tab = ""

    if(depth!=0){
      for(i = 1; i < depth; i++ ){
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
    }
    // add the children to the result
    if ($(document).children().length > 0){
      result += "\n"
      $(document).children().each(function(i,child){
        result += Writer.convertDocumentToString(child, depth + 1) + "\n"
      })
      result += tab
    }else{
      result += $(document).text()
    }

    if(depth!=0){
      if($(document).text() != "" || $(document).children().length > 0){
        result += "</" + nodeName + ">"
      }
    }
    return result;
  }
}
