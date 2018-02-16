export class Form{
  // browse the Xml and add the input to the form with the data from the xml
  static browseXML(XMLObject, iNode, parentNode){
    if(XMLObject == undefined){
      alert("No xml to display.")
    }else{
      var node
      var nodeName
      var nodeValue
      var attr
      var attrName
      var attrValue
      $(XMLObject).each(function(i,e0){
        nodeName = e0.nodeName
        nodeValue = $(e0).clone().children().remove().end().text()
        // console.log('nodeName', nodeName)
        // console.log("nodeValue", nodeValue)
        if(iNode == 0){
          node = '<fieldset class="border"><a class="XMLButton" href="#" id="' + iNode  + '" >'
          node += '<div class="blue-text text-darken-2 row"><div class="col s2">' + nodeName + '</div>'
          node += '<i class="col s1 offset-s9 material-icons">keyboard_arrow_down</i></div></a>'
          node += '<ul  class="col s11 offset-s1" id="ul' + iNode  + '" link="' + iNode + '" style="display:block">'
          node += '</ul></fieldset>'
        }
        else{
          node = '<fieldset class="border"><a class="XMLButton" href="#" id="' + iNode  + '" >'
          node += '<div class="blue-text text-darken-2 row"><div class="col s2">' + nodeName + '</div>'
          node += '<i class="col s1 offset-s9 material-icons">keyboard_arrow_left</i></div></a>'
          node += '<ul class="col s11 offset-s1" id="ul' + iNode  + '" link="' + iNode + '" style="display:none">'
          node += '</ul></fieldset>'
        }
        $(parentNode).append(node)

        // add the input for the text
        if($(XMLObject).children().length == 0){
          attr = '<li class="row"><div class="col s12">'
          attr += 'text<div class="input-field inline"><input name="text" type="text" value="' + nodeValue + '"/>'
          attr += '</div></div></li>'
          $('#ul'+ iNode).append(attr)
        }

        // add the input for the attributes
        $(e0.attributes).each(function(i,e1){
          attrName = e1.name
          attrValue = e1.value
          //console.log("attrName", attrName)
          //console.log("attrVal", attrValue)
          attr = '<li class="row"><div class="col s12">'
          attr += attrName + '<div class="input-field inline"><input  name="' + attrName + '" type="text" value="' + attrValue + '"/>'
          attr += '</div></div></li>'
          $('#ul'+ iNode).append(attr)
        })
      })
      if($(XMLObject).children() != undefined){
        $(XMLObject).children().each(function(j,e){
          Form.browseXML(e, iNode + "-"+ j, '#ul' + iNode)
        })
      }
    }
  }
}
