export class Form{
  constructor(id, name, XMLObject, XSDObject, idNav, idHiddenForm, idDisplayedForm,){
    this.id = id
    this.name = name
    this.XMLObject = XMLObject
    this.XSDObject = XSDObject
    this.idNav = idNav
    this.idDisplayedForm = idDisplayedForm
    this.idHiddenForm = idHiddenForm
  }

  // assemble the two forms displayedForm and the hiddenForm
  // in the displayedForm
  assembleForms(){
    var child
    var parent
    var idChild
    var idParent
    var numUl
    var ul
    var numChild
    // assemble forms only if the child is not the root element
    if($('#' + this.idHiddenForm).children().length > 0){
      idChild = $('#' + this.idDisplayedForm).find('div').attr('id').substr(6)
      idParent = idChild.substr(0, idChild.length - 2)
      numChild = idChild.substr(idChild.length - 1)
      child = $('#' + this.idDisplayedForm).children()
      parent = $('#' + this.idHiddenForm).find('div[id="body' + idParent + '"]')

      // retrieve the previous ul element
      $(parent).children('ul').each(function(i, e){
        numUl = $(e).find('div').attr('id')
        numUl = numUl.substr(numUl.length - 1)
        if(numChild > numUl){
          ul = e
        }
      })
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
      parent = $('#' + this.idHiddenForm).children()
      $('#' + this.idDisplayedForm).append(parent)
    }
  }

  // browse the XML and add the input to the form with the data from the xml
  // idParent the id of the element which will contains the form
  buildForm(idParent){
    if(idParent == undefined){
      alert("buildForm : Illegal Argument Exception")
    }else{
      var parentRec
      var formExtractor
      $('#' + this.idNav).empty()
      $('#' + this.idHiddenForm).empty()
      $('#' + this.idDisplayedForm).empty()
      formExtractor = '<div id="extractor' + this.id + '" style="display:none">'
      formExtractor += ' <h6 class="blue-text text-darken-3">' + this.name + '</h6>'
      formExtractor +=' <nav id="nav-'+ this.id + '">'
      formExtractor += '<div class="nav-wrapper white-text blue darken-4 row">'
      formExtractor += '<div class="col s12" id="anchor">'
      formExtractor += '<a class="breadcrumb">path ' + this.name +'</a>'
      formExtractor += '</div></div></nav>'
      formExtractor += '<form id="hidden-' + this.id + '" '
      formExtractor += 'style="display:none">'
      formExtractor += '</form>'
      formExtractor +=  '<form id="form-'+ this.id +'">'
      formExtractor += '<ul class="collapsible" data-collapsible="expandable"/>'
      formExtractor += '</form>'
      formExtractor += '</div>'
      $('#' + idParent).append(formExtractor)
      parentRec = $('#' + this.idDisplayedForm).children()

      Form.recBuildForm(this.XMLObject, this.id, parentRec)

      $(document).ready(function(){
        $('.collapsible').collapsible();
      });
    }
  }

  // recursive funtion which build the form
  static recBuildForm(XMLObject, iNode, parentNode){
    // console.log('xml',this.XMLObject )
      var node
      var nodeName
      var nodeValue
      var attr
      var attrName
      var attrValue
      var ul
      $(XMLObject).each(function(i,e0){
        nodeName = e0.nodeName
        nodeValue = $(e0).clone().children().remove().end().text()
        // console.log('nodeName', nodeName)
        // console.log("nodeValue", nodeValue)
        node = '<li>'
        node += '<div id="header' + iNode + '" class="collapsible-header white-text blue darken-4 row">'
        node += '<div class="col s11">' + nodeName + '</div>'
        node += '<i class="col s1 material-icons">keyboard_arrow_left</i>'
        node += '</div>'
        node += '<div id="body' + iNode + '" class="collapsible-body">'
        node += '</div>'
        node+= '</li>'

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
        ul = '<ul class="collapsible" data-collapsible="expandable"/>'
        $('#body'+ iNode).append(ul)
        $(XMLObject).children().each(function(j,e){
          Form.recBuildForm(e, iNode + "-"+ j, $('#body'+ iNode).children('ul'))
        })
      }
  }

  // build the nav element of the form which contains the parents tag
  // parents all the parents element
  buildNav(parents){
      var parentsArray = []
      var isSelectedParent = true
      var parentHeader
      var parentName
      var parentId
      var navElement
      // save the this attributs because this did not work in each loop
      var idDisplayedFrom = this.idDisplayedForm
      var idNav = this.idNav
      // filter the parent element
      $(parents).each(function(i,parent){
        if($(parent).attr('id') == idDisplayedFrom ){
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
      $('#' + this.idNav).find('div[id="anchor"]').empty()
      // default value of nav
      if(parentsArray.length == 0){
        $('#' +  this.idNav).find('div[id="anchor"]').append('<a class="breadcrumb">path ' + this.name + '</a>')
      }

      // fill the nav element
      $(parentsArray).each(function(i,parent){
        parentId = $(parent).attr('id').substr(6)
        parentName = $(parent).find('div').text()
        navElement = '<a id=nav' + parentId + '  href="#!" class="breadcrumb">' + parentName + '</a>'
        $('#' + idNav).find('div[id="anchor"]').append(navElement)
      })
  }

  // collapse all the element and their children
  // id
  collapseAll(id){
    // TODO find a way to collapse element without trigger the event
    // may be test close and open method of materialize
  }

  // display the information of the frames in the forms
  // numFrame is the number or the timeId(XML) of the frame to display
  displayFrame(numFrame){
    if(numFrame == undefined){
      alert("displayFrame : Illegal Argument Exception")
    }else{
      this.assembleForms()
      var input = $('#' + this.idDisplayedForm).find('input[name="timeId"][value="'+ numFrame +'"]')
      var body = $(input).parents('[class="collapsible-body"]')[0]
      if(body != undefined){
        var id = $(body).attr('id').substr(4)
        console.log('id', id)
        this.buildNav($(body).parents())
        this.moveInForm(id)
        // open the frame element if isn't already open
        if($('#header' + id).children('i').text() == 'keyboard_arrow_left'){
          $('#header' + id).trigger('click')
        }
      }
    }
  }


  // move in the displayedForm
  // id to the element who become the first child of the form
  moveInForm(id){
    if(id == undefined){
      alert("moveInForm : Illegal Argument Exception")
    }else{
      var elm = $('#' + this.idDisplayedForm).find('div[id="header'+ id + '"]').parents('ul').get(0)
      elm = $(elm).clone()
      $('#' + this.idDisplayedForm).find('div[id="header'+ id + '"]').parents('ul').get(0).remove()
      var form = $('#' + this.idDisplayedForm).children()
      $('#' + this.idHiddenForm).append(form)
      $('#' + this.idDisplayedForm).empty()
      $('#' + this.idDisplayedForm).append(elm)
    }

    $('#' + this.idHiddenForm).find("[class~=collapsible-header]").each(function(i,e){
      $(e).collapsible('close',0)
    })
    $(document).ready(function(){
      $('.collapsible').collapsible();
    });
  }

  // retrieve the xml of the form
  getXML(){
    // save the state of the form
    var saveDisplayedForm = $('#' + this.idDisplayedForm).children()
    var saveHiddenForm = $('#' + this.idHiddenForm).children()
    this.assembleForms()

    var result = Form.recGetXML('#' + this.idDisplayedForm)

    //TODO call verif function

    //restore the previous state of forms
    $('#' + this.idDisplayedForm).empty()
    $('#' + this.idHiddenForm).empty()
    $('#' + this.idDisplayedForm).append(saveDisplayedForm)
    $('#' + this.idHiddenForm).append(saveHiddenForm)

    return result
  }

  // recursive funtion which retrieve the XML of the form
  // parentNode a node tof the form
  static recGetXML(parentNode){
    var result
    var nodeName
    var nextsNodes
    var attributes
    var attrName
    var attrValue

    // name of the current node
    nodeName = $(parentNode).find('div[class~="collapsible-header"]')[0]
    nodeName = $(nodeName).children('div').text()
    result = $('<' + nodeName + '/>')

    nextsNodes = $(parentNode).find('div[class~="collapsible-body"]')[0]
    attributes = $(nextsNodes).children('div').find('input')

    // add attributes to the current node of the XML
    $(attributes).each(function(i,attribut){
      attrName = $(attribut).attr('name')
      attrValue = $(attribut).val()
      $(result).attr(attrName, attrValue)
    })

    // recursive call on the children of the current node
    nextsNodes = $(nextsNodes).children('ul[class="collapsible"]')
    $(nextsNodes).each(function(i,nextNode){
      $(result).append(Form.recGetXML(nextNode))
    })

    return result[0]
  }


}
