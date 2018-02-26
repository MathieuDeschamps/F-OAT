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
        node  = '<ul class="collapsible" data-collapsible="accordion">'
        node += '<li>'
        node += '<div id="header' + iNode + '" class="collapsible-header white-text blue darken-4 row">'
        node += '<div class="col s11">' + nodeName + '</div>'
        node += '<i class="col s1 material-icons">keyboard_arrow_left</i>'
        node += '</div>'
        node += '<div id="body' + iNode + '" class="collapsible-body">'
        node += '</div>'
        node+= '</li></ul>'
        $(parentNode).append(node)

        // add the input for the text
        if($(XMLObject).children().length == 0){
          attr = '<div class="row"><div class="col s12">'
          attr += 'text<div class="input-field inline"><input name="text" type="text" value="' + nodeValue + '"/>'
          attr += '</div></div></div>'
          $('#body'+ iNode).append(attr)
        }

        // add the input for the attributes
        $(e0.attributes).each(function(i,e1){
          attrName = e1.name
          attrValue = e1.value
          //console.log("attrName", attrName)
          //console.log("attrVal", attrValue)
          attr = '<div class="row"><div class="col s12">'
          attr += attrName + '<div class="input-field inline"><input  name="' + attrName + '" type="text" value="' + attrValue + '"/>'
          attr += '</div></div></div>'
          $('#body'+ iNode).append(attr)
        })
      })
      if($(XMLObject).children() != undefined){
        $(XMLObject).children().each(function(j,e){
          Form.browseXML(e, iNode + "-"+ j, '#body' + iNode)
        })
      }

    }
  }

  // parents all the parents element
  // idForm  which are the bound of the parents
  // nav the place to build the parent header
  static buildParentNav(parents, idForm, idNav){
    if(parents == undefined || idForm == undefined || idNav == undefined){
      alert("buildParentHeader : Illegal Argument Exception")
    }else{
      var parentsArray = []
      var isSelectedParent = true
      var parentHeader
      var parentName
      var parentId
      var navElement


      // filter the parent element
      $(parents).each(function(i,parent){
        if($(parent).attr('id') == idForm){
          isSelectedParent = false
        }
        if(isSelectedParent && $(parent).attr('class') == 'collapsible'){
          parentHeader = $(parent).find('div[class~="collapsible-header"]').get(0)
          parentsArray.push($(parentHeader).clone())
        }
      })

      // remove the last element of the array
      parentsArray.reverse()
      parentsArray.pop()
      $('#' + idNav).empty()

      // default value of nav
      if(parentsArray.length == 0){
        $('#' +  idNav).append('<a class="breadcrumb">Current path</a>')
      }

      // fill the nav element
      $(parentsArray).each(function(i,parent){
        parentId = $(parent).attr('id').substr(6)
        parentName = $(parent).find('div').text()
        navElement = '<a id=nav' + parentId + '  href="#!" class="breadcrumb">' + parentName + '</a>'
        $('#' + idNav).append(navElement)
      })
    }
  }


  //id to the element who become the first child of the form
  //idForm id of the form to update
  //idHidden id where is saved the rest of the form
  static moveInForm(id, idForm, idHidden){
    if(id == undefined || idForm == undefined || idHidden == undefined ){
      alert("zoomInForm : Illegal Argument Exception")
    }else{
      var elm = $('#' + idForm).find('div[id="header'+ id + '"]').parents('ul').get(0)
      var elm = $(elm).clone()
      $('#' + idForm).find('div[id="header'+ id + '"]').parents('ul').get(0).remove()
      var form = $('#' + idForm).children()
      $('#' + idHidden).append(form)
      $('#' + idForm).empty()
      $('#' + idForm).append(elm)
    }
  }

  // formParent form which containts the parent element of the XML
  // formChild form which contains the child element of the XML
  static assembleForms(formParent, formChild){
    if(formParent == undefined || formChild == undefined){
      alert("assembleXML : Illegal Argument Exception")
    }
    var child
    var parent
    var idChild
    var idParent
    var numUl
    var ul
    var numChild
    // assemble forms only if the child is not the root element
    if($('#' + formParent).children().length > 0){
      idChild = $('#' + formChild).find('div').attr('id').substr(6)
      idParent = idChild.substr(0, idChild.length - 2)
      numChild = idChild.substr(idChild.length - 1)
      child = $('#' + formChild).children()
      parent = $('#' + formParent).find('div[id="body' + idParent + '"]')

      // retrieve the previous ul element
      $(parent).children('ul').each(function(i, e){
        numUl = $(e).find('div').attr('id')
        numUl = numUl.substr(numUl.length - 1)
        if(numChild > numUl){
          ul = e
        }
      })
      console.log('parent', parent)
      if($(parent).children().length == 0){
        // online children of the node
          $(parent).append(child)
      }
      else if(ul== undefined && $(parent).children('ul').length > 0){
        //first ul element of the node
        // append to the before the next ul element
        $(parent).children('ul').first().before(child)
      }
      else if (ul== undefined && $(parent).children('div').length > 0) {
        //first ul element of the node
        // append to the after the previous div element which contains the input
          $(parent).children('div').last().after(child)
      }
      else{
        $(ul).after(child)
      }

      // move parent form to child form
      parent = $('#' + formParent).children()
      $('#' + formChild).append(parent)
    }
  }

}
