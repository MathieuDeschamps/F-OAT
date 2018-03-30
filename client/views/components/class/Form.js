export class Form{
  constructor(id, name, XMLObject, XSDObject, idNav, idHiddenForm, idDisplayedForm,){
    this.id = id
    this.name = name
    this.XMLObject = XMLObject
    this.XSDObject = XSDObject
    this.idNav = idNav
    this.idDisplayedForm = idDisplayedForm
    this.idHiddenForm = idHiddenForm
    // TODO call to VerifXMLByXSD
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
      // delete the previous version
      $('#extractor-' + this.id).remove()
      formExtractor = '<div id="extractor' + this.id + '" style="display:none">'
      formExtractor += '<h6 class="blue-text text-darken-3">' + this.name + '</h6>'
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

      parentRec = $('#' + this.idDisplayedForm).children('ul[class~=collapsible]')
      var XSD = $(this.XSDObject).find('xs\\:schema').children('xs\\:element')
      Form.recBuildForm(this.XMLObject, XSD, this.id, parentRec)

      // init the collapsible element
      $(document).ready(function(){
        $('.collapsible').collapsible();
      });

    }
  }

  // recursive funtion which build the form
  // XMLObjectData
  // XMLObjectXSD the first node should be a xs:element
  // iNode the id of the element
  // parentNode the element where the form is built
  static recBuildForm(XMLObjectData, XMLObjectXSD, iNode, parentNode){
    if(XMLObjectXSD == undefined || iNode == undefined ||
       parentNode == undefined){
      alert("recBuildForm : Illegal Argument Exception")
    }

    // console.log('xml',this.XMLObjectData )
    // console.log('xsd',XMLObjectXSD)

    var nodeName
    var attrsXSD
    var attrName
    var childrenXSD
    var childrenXML
    var childName
    var nbChildren = 0
    var j = 0
    var maxOccurs = 1
    var minOccurs = 1
    var ul

    nodeName = $(XMLObjectXSD).attr('name')
    // console.log('nodeName', nodeName)

    // add the current node to the parentNode (form)
    node = '<li>'
    node += '<div id="header' + iNode + '" class="collapsible-header white-text blue darken-4 row">'
    node += '<div class="col s11">' + nodeName + '</div>'
    node += '<i class="col s1 material-icons">keyboard_arrow_left</i>'
    node += '</div>'
    node += '<div id="body' + iNode + '" class="collapsible-body">'
    node += '</div>'
    node += '</li>'
    $(parentNode).append(node)

    if($(XMLObjectXSD).children().children('xs\\:attribute').length > 0){
         attrsXSD = $(XMLObjectXSD).children().children('xs\\:attribute')
     }else{
       attrsXSD = $(XMLObjectXSD).children().children('xs\\:simpleContent')
       attrsXSD = $(attrsXSD).children('xs\\:extension')
       attrsXSD = $(attrsXSD).children('xs\\:attribute')
     }

     $(attrsXSD).each(function(i,attrXSD){
       attrName = $(attrXSD).attr('name')
       attrValue = $(XMLObjectData).attr(attrName)

       if($(attrXSD).children().length > 0){
         Form.addEnum(attrValue, attrXSD , 'body' + iNode)
       }else{
         Form.addField(attrValue, attrXSD , 'body' + iNode)
       }
     })
      nbChildren = 0
      childrenXSD = $(XMLObjectXSD).children().children()
      childrenXSD = $(childrenXSD).children('xs\\:element')
      if(childrenXSD.length > 0){
        // add the element which will contains the children
        ul = '<ul class="collapsible" data-collapsible="expandable"/>'
        $('#body'+ iNode).append(ul)
        $(childrenXSD).each(function(i, childXSD){
          j = 0
          maxOccurs = 1
          minOccurs = 1
          maxOccurs = $(childXSD).attr('maxOccurs')
          minOccurs = $(childXSD).attr('minOccurs')
          childName = $(childXSD).attr('name')
          childrenXML = $(XMLObjectData).children(childName)

          // set the value of the number of children to display
          if(maxOccurs == 'unbounded' || childrenXML.length < minOccurs){
              if(childrenXML.length < minOccurs){
                maxOccurs = minOccurs
              }else{
                maxOccurs = childrenXML.length
              }
          }

          while(j < maxOccurs){
            childXML = $(childrenXML).get(j)
            Form.recBuildForm(childXML, childXSD, iNode + "-" + nbChildren
              , $('#body'+ iNode).children('ul'))
              j++
              nbChildren++
          }
        })
        $(childrenXML).each(function(j,childXML){
          childName = childXML.nodeName
          // console.log('childName', childName)
          // retrieve the xsd of the child XML
          childXSD = $(XMLObjectXSD).children().children()
          childXSD = $(childXSD).children('xs\\:element[name="' + childName + '"]')

        })
    }
  }

  // function which add an input marker of type string
  // attrValue the current value of the attribut
  // XMLObjectXSD the first node should be a xs:attribute
  // idParentNode the id element where the field is added
  static addField(attrValue, XMLObjectXSD, idParentNode){
    if(XMLObjectXSD == undefined || idParentNode == undefined){
      alert('addEnum : Illegal Argument Exception')
    }else{
      var attr
      var attrName
      var attrType

      attrName = $(XMLObjectXSD).attr('name')
      attrType = $(XMLObjectXSD).attr('type')

      if(attrValue == undefined){
        attrValue = ''
      }
      // set the type of the input mark
      switch (attrType) {
        case 'xs:string':
          attrType = 'text'
          break;
        case 'xs:int':
          attrType = 'number'
          break;
        case 'xs:dateTime':
          attrType = 'date'
          break;
        default:
          attrType = 'text'

      }

      attr = '<div class="row"><div class="col s12">'
      attr += attrName
      if($(XMLObjectXSD).attr('fixed') != undefined){
        attr += ' ' + $(XMLObjectXSD).attr('fixed')
      }else{
        attr += '<div class="input-field inline"><input name="' + attrName
        attr += '" type="' + attrType +'" value="' + attrValue + '"/></div>'
      }

      attr += '</div></div>'
      $('#' + idParentNode).append(attr)
      // init the select element
      $(document).ready(function(){
        $('select').material_select();
      });
    }
  }

  // function which add an select marker with the value of the enum
  // attrValue the current value of the attribut
  // XMLObjectXSD the first node should be a xs:attribute
  // idParentNode the element where the field is added
  static addEnum(attrValue, XMLObjectXSD, idParentNode){
    if(XMLObjectXSD == undefined || idParentNode == undefined){
      alert('addEnum : Illegal Argument Exception')
    }else{
      var attr
      var attrName
      attrName = $(XMLObjectXSD).attr('name')
      attr = '<div class="input-field col s12">'
      attr =   attrName
      attr += '<select class="browser-default">'

      $(XMLObjectXSD).find('xs\\:enumeration').each(function(i,e){
        if($(e).attr('value') == attrValue){
            attr += '<option value="' + $(e).attr('value') + '" selected>'
            attr += $(e).attr('value') + "</option>"
        }else{
            attr += '<option value="' + $(e).attr('value') + '">'
            attr += $(e).attr('value') + "</option>"
        }
      })
      attr += '</select></div>'
      //console.log('idParentNode', idParentNode)
      $('#' + idParentNode).append(attr)
    }


  }

  // build the nav element of the form which contains the parents tag
  // parents all the parents element
  buildNav(parents){
    if(parents == undefined){
        alert('buildNav : Illegal Argument Exception')
    }else{
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
      alert('moveInForm : Illegal Argument Exception')
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

    result = Form.recGetXML('#' + this.idDisplayedForm)
    //TODO call verif function

    //restore the previous state of forms
    $('#' + this.idDisplayedForm).empty()
    $('#' + this.idHiddenForm).empty()
    $('#' + this.idDisplayedForm).append(saveDisplayedForm)
    $('#' + this.idHiddenForm).append(saveHiddenForm)
    return result
  }

  // recursive funtion which retrieve the XML of the form
  // parentNode a node of the form
  // TODO generate the XML with the XSD like buildForm
  //TODO if attributes XSD fixed set the value to fixed
  // TODO solve the problem about the uppercase
  static recGetXML(parentNode){
    if(parentNode == undefined){
      alert('recGetXML : Illegal Argument Exception')
    }else{
      var result
      var nodeName
      var body
      var nextNodes
      var attributes
      var attrName
      var attrValue
      //console.log('parentNode', parentNode)
      // name of the current node
      nodeName = $(parentNode).find('div[class~="collapsible-header"]')[0]
      nodeName = $(nodeName).children('div').text()


      body = $(parentNode).find('div[class~="collapsible-body"]')[0]
      //console.log('parentNode', parentNode)
      //console.log('nextNodes', nextNodes)
      nextNodes = $(body).children('ul[class="collapsible"]').children('li')
      attributes = $(body).children('div').find('input')

      result = $('<' + nodeName + '/>')
      // add attributes to the current node of the XML
      $(attributes).each(function(i,attribut){
        attrName = $(attribut).attr('name')

        attrValue = $(attribut).val()
        result.attr(attrName, attrValue)
      })

      // recursive call on the children of the current node
      $(nextNodes).each(function(i,nextNode){
        result.append(Form.recGetXML(nextNode))
      })
      return result
    }
  }

  // update the form with the new XML
  // which is previous set with form.XMLObject = newXML
  // TODO keep the place where the user was previously in the form
  update(){
    $('#nav-' + this.id).children('anchor').empty()
    $('#nav-').append('<a class="breadcrumb">path ' + this.name +'</a>')
    $('#hidden-' + this.id).empty()
    $('#form-' + this.id).children('ul').empty()
    parentRec = $('#' + this.idDisplayedForm).children('ul[class~=collapsible]')
    var XSD = $(this.XSDObject).find('xs\\:schema').children('xs\\:element')
    Form.recBuildForm(this.XMLObject, XSD, this.id, parentRec)

    // init the collapsible element
    $(document).ready(function(){
      $('.collapsible').collapsible();
    });
  }
}
