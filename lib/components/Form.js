import { Tool } from '../components/Tool.js'

export class Form{
  // browse the Xml and add the input to the form with the data from the xml
  static browseXML(xml, iNode, tabNode, formNode){
    if(xml == undefined){
      alert("No XML to display.")
    }else{
        var nodeName
        var nodeValue
        var nodeParent
        var attrName
        var attrValue
        var attrInput

        $(xml).each(function(i,e0){
          nodeName = e0.nodeName
          nodeValue = $(e0).clone().children().remove().end().text()
          //console.log('nodeName', nodeName)
          //console.log("nodeValue", nodeValue)

          if(iNode == 1){
            $(tabNode).append('<li class="tab"><a href="#" id="' + iNode + '" >' +  nodeName + '</a></li>')
          }
          else{
            nodeParent = iNode.substring(0, iNode.length - 2)
              $(tabNode).append('<li class="tab"><a href="#" id="' + iNode + '" parent="' + nodeParent +'" >' +  nodeName + '</a></li>')
          }
          // add attributes of the current Node
          $(e0.attributes).each(function(i,e1){
            //console.log("idNode",idNode)
            attrName = e1.name
            attrValue = e1.value
            //console.log("attrName", attrName)
            //console.log("attrVal", attrValue)
            if(iNode == "1"){
              attrInput = '<div  id="div'+ iNode + '" style="display:block"><div class="row"><div class="col s12">'
              attrInput += attrName + '<div class="input-field inline"><input  name="' + attrName + '" parent="' + iNode + '" type="text" value="' + attrValue + '"></div></div></div>'
            }else{
              attrInput = '<div  id="div'+ iNode + '" style="display:none"><div class="row"><div class="col s12">'
              attrInput += attrName + '<div class="input-field inline"><input  name="' + attrName + '" parent="' + iNode + '" type="text" value="' + attrValue + '"></div></div></div>'
            }
            $(formNode).append(attrInput)
          })


          // add text input for the leaves of the current Node
          if($(xml).children().length == 0){
            if(iNode == "1"){
              attrInput = '<div  id="div'+ iNode + '" style="display:block"><div class="row"><div class="col s12">'
              attrInput += 'text<div class="input-field inline"><input  name="text" parent="' + iNode + '" type="text" value="' + nodeValue + '"></div></div></div>'
            }else{
              attrInput = '<div  id="div'+ iNode + '" style="display:none"><div class="row"><div class="col s12">'
              attrInput += 'text<div class="input-field inline"><input  name="text" parent="' + iNode + '" type="text" value="' + nodeValue + '"></div></div></div>'
            }
            $(formNode).append(attrInput)
          }
          // var addAttr = '<li><a href="#" class="addAttr">Add attributes to ' + nodeName + '<i class="small material-icons">add_circle</i></a></li>'
          // $('#' + iNode).append(addAttr)
        })
        if($(xml).children() != undefined){
          $(xml).children().each(function(j,e){
            Form.browseXML(e, iNode + "-" + j , tabNode, formNode )
        })
      }
        //$('#' + iNode).append('<li><a href="#" class="addNode">Add child to ' + nodeName + '<i class="small material-icons">add_circle</i></a></li>')
    }
  }

  // return a string of the XML from the form
  static buildXML(tab, form){
    // init
    var rootName = $(tab).find('a[id=1]').text()
    var root = '<' + rootName + ' id ="1" ></' + rootName + '>'
    var result = $.parseXML(root)
    var nodeId
    var nodeName
    var parentNode
    var newNode
    var attrName
    var attrValue
    var attrParent
    var newAttr

    // build the nodes of the XML
    $(tab).find('a').each(function(i,node){
      nodeId = $(node).attr('id')
      if(nodeId != 1){
        nodeName = $(node).text()
        parentNode = $(node).attr('parent')
        newNode = '<' + nodeName + ' id="' + nodeId + '"></' + nodeName + '>'
        $(result).find('[id="' + parentNode + '"]').append(newNode)
      }
    })

    // add the attributes to the nodes
    $(form).find('input').each(function(i,attribut){
      attrValue = $(attribut).val()
      attrName = $(attribut).attr('name')
      attrParent = $(attribut).attr('parent')
      if(attrName == "text"){
        $(result).find('[id="' + attrParent + '"]').text(attrValue)
      }else{
        $(result).find('[id="' + attrParent + '"]').attr( attrName,attrValue)
      }
    })
    
    //cleaning the xml by removing the id attributes
    result = Tool.removeAttrAll(result, 'id')

    console.log('result', result)
    return result
  }

}
