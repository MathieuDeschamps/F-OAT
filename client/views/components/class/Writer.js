import {Projects} from '../../../../lib/collections/projects.js';

export class Writer{


  /* Replace the annotation of the extractor by the new annotation
  @xmlObject: the XMLDocument of the project
  @extractor: the extractor which will be replace
  @newAnnotation: the xml which contains the annotation
  @returns: the xmlObject
  */
  static replaceAnnotation(xmlObject, extractor, newAnnotation){
    if(typeof xmlObject === 'undefined' &&
      typeof extractor === 'undefined' &&
      typeof annotation === 'undefined'){
        console.log('replaceAnnotation : Illegal Argument Exception');
    }else{
      var selector = $(extractor).prop('tagName');
      selector += '[name="' + $(extractor).attr('name') + '"]';
      selector += '[version="' + $(extractor).attr('version') + '"]';
      var oldAnnotation = $(xmlObject).find('extractors').first().children(selector);
      if(oldAnnotation.length === 1){
        $(oldAnnotation).empty();
        $(oldAnnotation).append(newAnnotation);
      }
      return xmlObject
    }
  }

  /* convert a XMLDocument into a String
  @xmlDocument: the XMLDocumet to convert
  @depth: is the number of tabulation at the beginning
  */
  static convertDocumentToString(xmlDocument, depth){
    var result ="";
    var nodeName = String(xmlDocument.nodeName);

    // set the tabulation with the depth
    var tab = "";

    if(depth!=0){
      for(var i = 1; i < depth; i++ ){
        tab += "\t";
      }
      // add the node and the attributes
      result += tab +"<" + nodeName
      $(xmlDocument.attributes).each(function(i,attr){
          result += " " + String(attr.name) + "=\"" + _.escape(String(attr.value)) +"\""
      })
      if($(xmlDocument).text() != "" || $(xmlDocument).children().length > 0){
        result += ">";
      }else{
        result += "/>";
      }
    }
    // add the children to the result
    if ($(xmlDocument).children().length > 0){
      result += "\n";
      $(xmlDocument).children().each(function(i,child){
        result += Writer.convertDocumentToString(child, depth + 1) + "\n";
      })
      result += tab;
    }else{
      result += $(xmlDocument).text();
    }

    if(depth!=0){
      if($(xmlDocument).text() != "" || $(xmlDocument).children().length > 0){
        result += "</" + nodeName + ">";
      }
    }
    return result;
  }


  // function which check if the current user has the right write on the project
  static hasRightToWrite(){
    var idProject = Router.current().params._id
    var project = Projects.findOne(idProject)
    if(!project){
      return false;
    }
    var username = Meteor.user().username
    var participant = $(project.participants).filter(function(i,p){
      return p.username == username && p.right == "Write"
    })
    if(project.owner == username || participant.length > 0){
      return true
    }else{
      return false
    }
  }

}
