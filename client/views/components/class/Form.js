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
      alert('buildForm : Illegal Argument Exception')
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


      $(document).ready(function(){
        $('.collapsible').collapsible(
        {
        // onOpen: function(elm) {
        // $($(elm).find('i')[0]).text('keyboard_arrow_down')
        // }, // Callback for Collapsible open
        // onClose: function(elm) {   $($(elm).find('i')[0]).text('keyboard_arrow_right') } // Callback for Collapsible close
        }
        )
      })
    }
  }

  // recursive funtion which build the form
  // XMLObjectData the data which fill the default value of the form
  // XMLObjectXSD the first node should be a xs:element
  // indexParent the index of the parentNode
  // parentNode the ul element where the form is built
  static recBuildForm(XMLObjectData, XMLObjectXSD, indexParent, parentNode){
    if(XMLObjectXSD == undefined || indexParent == undefined ||
      parentNode == undefined){
      alert('recBuildForm : Illegal Argument Exception')
    }else{
      var nodeName
      var nodesXSD
      var nodesXML
      var nodeXML
      var attrsXSD
      var attrName
      var childrenXSD
      var childrenXML
      var childName
      var currentIdNode
      var nbChildren = 0
      var j
      var maxOccurs
      var minOccurs
      var deleteButton
      var addMenu
      var elementToAdd = []
      var hasDeleteButton
      var ul

      $(XMLObjectXSD).each(function(index,nodeXSD){
        hasDeleteButton = false
        j = 0
        nodeName = $(nodeXSD).attr('name')
        maxOccurs = $(nodeXSD).attr('maxOccurs')
        minOccurs = parseInt($(nodeXSD).attr('minOccurs'))
        if(maxOccurs == undefined){
          maxOccurs = 1
        }
        if(minOccurs == undefined){
          minOccurs = 1
        }

        // get the node with the right name
        nodesXML = $(XMLObjectData).filter(nodeName)

        // set the value of the add button
        if(maxOccurs == 'unbounded' ||
          (nodesXML.length < maxOccurs && nodesXML.length > minOccurs)){
          elementToAdd.push(nodeName)
      }

      // set the value of the delete button
      if(minOccurs < nodesXML.length){
        hasDeleteButton = true
      }

      // set the value of the number of children to display
      if(nodesXML.length < minOccurs){
        maxOccurs = minOccurs
      }else if(maxOccurs == 'unbounded' || nodesXML.length < maxOccurs){
        maxOccurs = nodesXML.length
      }


      childrenXSD = $(nodeXSD).children().children()
      childrenXSD = $(childrenXSD).children('xs\\:element')
      while(j < maxOccurs){
          nodeXML = $(nodesXML).get(j)
          currentIdNode = indexParent + '-' + nbChildren

          // add the current node to the parentNode (form)
          node = '<li>'
          node += '<div id="header' + currentIdNode + '" '
          node += 'name ="' + nodeName + '" '
          node += 'class="collapsible-header white-text blue darken-4 row">'
          node += '<div class="col s1">'
          node += '<i class="material-icons">keyboard_arrow_right</i>'
          node += '</div>'
          node += '<div class="col s9">'
          node += nodeName
          node += '</div>'
          node += '<div class="col s2">'
          if(hasDeleteButton){
            node += Form.addDeleteButton()
          }
          node += '</div>'
          node += '</div>'
          node += '<div id="body' + currentIdNode + '" '
          node += 'name ="' + nodeName + '" '
          node += 'class="collapsible-body">'
          node += '</div>'
          node += '</li>'
          $(parentNode).append(node)


          // retrieve the attributes
          if($(nodeXSD).children().children('xs\\:attribute').length > 0){
            // attributes of the nodes
            attrsXSD = $(nodeXSD).children().children('xs\\:attribute')
          }else{
            // attributes of the leaves
            attrsXSD = $(nodeXSD).children().children('xs\\:simpleContent')
            attrsXSD = $(attrsXSD).children('xs\\:extension')
            attrsXSD = $(attrsXSD).children('xs\\:attribute')
          }

          // add the attributs to the form
          $(attrsXSD).each(function(i,attrXSD){
            attrName = $(attrXSD).attr('name')
            attrValue = $(nodeXML).attr(attrName)
            if($(attrXSD).children().length > 0){
              Form.addEnum(attrValue, attrXSD , 'body' + currentIdNode)
            }else{
              Form.addField(attrValue, attrXSD , 'body' + currentIdNode)
            }
          })

          if(childrenXSD.length > 0){
            // add the element which will contains the children
            ul = '<ul class="collapsible" data-collapsible="expandable"/>'
            $('#body'+ currentIdNode).append(ul)
            childrenXML = $(nodeXML).children()
            Form.recBuildForm(childrenXML, childrenXSD, currentIdNode,
              $('#body'+ currentIdNode).children('ul')[0])
            }
            nbChildren ++
            j++
          }
        })

        // add the addMenu if he does not already exists
        parentName = $(XMLObjectXSD).parents('xs\\:element').attr('name')
        if($(parentNode).children('li').children('#addMenuBody').length == 0){
          addMenu = '<li style="display:none">'
          addMenu += '<div id="addMenuHeader" class="collapsible-header white-text blue darken-4 row">'
          addMenu += '<div class="col s1">'
          addMenu += '<i class="material-icons">keyboard_arrow_right</i>'
          addMenu += '</div>'
          addMenu += '<div class="col s11">'
          addMenu +=  'Add element to ' + parentName
          addMenu += '</div>'
          addMenu += '</div>'
          addMenu += '<div id="addMenuBody" class="collapsible-body">'
          addMenu += '</div>'
          addMenu += '</li>'
          $(parentNode).append(addMenu)
        }
        // add all the elements of the array to the addMenu
        $(elementToAdd).each(function(i,nodeName){
          Form.addToAddMenu(nodeName,
            $(parentNode).children('li').children('#addMenuBody'))
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

  // function which add a element to the addMenu
  // name of the element to remove
  // addMenuBody reference on the addMenuBody
  static addToAddMenu(name, addMenuBody){
    var addButton
    addButton ='<div class="row" name="'+ name +'">'
    addButton += name
    addButton += '<a href="#"'
    addButton += 'class=" btn-floating btn-tiny waves-effect blue darken-4 right addButton">'
    addButton += '<i class="material-icons">add</i></a>'
    addButton += '</div>'
    $(addMenuBody).append(addButton)
    $(addMenuBody).parent().css('display','block')
  }

  // function which remove a element to the addMenu
  // name of the element to remove
  // addMenuBody reference on the addMenuBody
  static deleteToAddMenu(name, addMenuBody){
    if(name == undefined || addMenuBody == undefined){
      alert("deleteToAddMenu : Illegal Argument Exception")
    }else{
      $(addMenuBody).children('div[name="'+ name +'"]').remove()
      if($(addMenuBody).children().length == 0){
        $(addMenuBody).parent().css('display','none')
      }
    }
  }


  // function which add a deleteButton
  // return the a string which is the code of the delete button
  static addDeleteButton(){
    var deleteButton
    deleteButton = '<i class="red darken-4 material-icons tiny deleteButton" >clear</i>'
    return deleteButton
  }

  // function which remove element in the form
  // element the element to add
  addElement(element){
    if(element == undefined){
        alert("addElement : Illegal Argument Exception")
    }else{
      var maxOccurs
      var minOccurs
      var elementName = $(element).attr('name')
      var isSelectedParent = true
      var parentsArray = []
      var idDisplayedFrom = this.idDisplayedForm
      var parentHeader
      var parentName
      var parentNode
      var indexParent
      var nbChildren
      var elementXSD
      var attrXSD
      var childrenXSD
      var nodesXSD
      var nbForm
      var hasDeleteButton = false
      var addMenuBody
      var otherChildren
      var ulMenu

      // filter the parent elem
      $(element).parents().each(function(i,parent){
        if($(parent).attr('id') == idDisplayedFrom ){
          isSelectedParent = false
        }
        if(isSelectedParent && $(parent).attr('class') == 'collapsible-body'){
          // get the header of the parent
          parentHeader = parent.parentNode
          parentHeader = $(parentHeader).children('div[class~="collapsible-header"]')
          parentsArray.push($(parentHeader))
        }
      })
      parentsArray.reverse()
      parentsArray.pop()

      // retrieve the XSD element to the element to add with the parents
      nodesXSD = $(this.XSDObject).find('xs\\:schema')
      $(parentsArray).each(function(i,parent){
        parentName = $(parent).attr('name')
        nodesXSD = $(nodesXSD).children('xs\\:element[name="' + parentName + '"]')
        nodesXSD = $(nodesXSD).children().children()
      })

      elementXSD = $(nodesXSD).children('xs\\:element[name="' + elementName + '"]')

      minOccurs = $(elementXSD).attr('minOccurs')
      maxOccurs = $(elementXSD).attr('maxOccurs')
      if(minOccurs == undefined){
        minOccurs = 1
      }
      if(maxOccurs == undefined){
        maxOccurs = 1
      }
      nbForm = $(element).parents('ul[class~="collapsible"]')[0]
      nbForm = $(nbForm).children()
      nbForm = $(nbForm).children('div[name="'+ elementName +'"][class~="collapsible-header"]')
      nbForm = nbForm.length

      // add the element to the form
      if(maxOccurs == 'unbounded' || parseInt(maxOccurs) > nbForm){
        parentNode = $(element).parents('ul[class~="collapsible"]')[0]
        nbChildren = $(element).parents('ul[class~="collapsible"]')[0]
        nbChildren = $(nbChildren).children('li').length - 1
        indexParent = $(element).parents('div[class~="collapsible-body"]')[1]
        indexParent = $(indexParent).attr('id').substr(4)
        indexParent += '-' + nbChildren
        childrenXSD =  $(elementXSD).children().children()
        childrenXSD = $(childrenXSD).children('xs\\:element')

        // add the new element
        // set the value of the delete button
        node = '<li>'
        node += '<div id="header' + indexParent + '" '
        node += 'name ="' + elementName + '" '
        node += 'class="collapsible-header white-text blue darken-4 row">'
        node += '<div class="col s1">'
        node += '<i class="material-icons">keyboard_arrow_right</i>'
        node += '</div>'
        node += '<div class="col s9">'
        node += elementName
        node += '</div>'
        node += '<div class="col s2">'
        // add a delete button for the previous node
        if(minOccurs == nbForm){
          otherChildren = $(parentNode).children('li')
          otherChildren = $(otherChildren).children(
            'div[name="' + elementName +'"][class~="collapsible-header"]'
          )
          $(otherChildren).each(function(i,children){
            $(children).children('div').last().append(Form.addDeleteButton())
          })
        }
        // add the delete button for the current element
        if(minOccurs < nbForm + 1){
          node += Form.addDeleteButton()
        }
        // add the new element
        node += '</div>'
        node += '</div>'
        node += '<div id="body' + indexParent + '" '
        node += 'name ="' + elementName + '" '
        node += 'class="collapsible-body">'
        node += '</div>'
        node += '</li>'
        $(parentNode).children().last().before(node)
        parentNode = $(parentNode).children('li').children('div[id="body'+ indexParent +'"]')
        // retrieve the attributes of the new element
        if($(elementXSD).children().children('xs\\:attribute').length > 0){
          // attributes of the nodes
          attrsXSD = $(elementXSD).children().children('xs\\:attribute')
        }else{
          // attributes of the leaves
          attrsXSD = $(elementXSD).children().children('xs\\:simpleContent')
          attrsXSD = $(attrsXSD).children('xs\\:extension')
          attrsXSD = $(attrsXSD).children('xs\\:attribute')
        }

        // add the attributs to the form
        $(attrsXSD).each(function(i,attrXSD){
          attrName = $(attrXSD).attr('name')
          if($(attrXSD).children().length > 0){

            Form.addEnum(undefined, attrXSD , parentNode)
          }else{
            Form.addField(undefined, attrXSD , 'body' + indexParent)
          }
        })
        // add the ul element which will contains the children elements
        ulMenu = '<ul class="collapsible" data-collapsible="expandable">'
        $('#body' + indexParent).children().last().after(ulMenu)

        // add the children of the new element
        if(childrenXSD.length > 0){
          parentNode = $('#body' + indexParent).children('ul[class~="collapsible"]')
          Form.recBuildForm(undefined, childrenXSD, indexParent, parentNode)
        }
        // remove the button to the addMenuBody
      	if(maxOccurs !='undounded' && nbForm + 1 == maxOccurs){
          addMenuBody = $(element).parents('div[class~="collapsible-body"]')[0]
          Form.deleteToAddMenu(elementName, addMenuBody)
        }
        // init the collapsible element
        // $(document).ready(function(){
        //   $('.collapsible').collapsible()
        // })
      }
    }
  }

  // function which remove element in the form
  // element the element to delete
  deleteElement(element){
    if(element == undefined){
      alert('deleteElement : Illegal Argument Exception')
    }else{
      var idDisplayedFrom = this.idDisplayedForm
      var isSelectedParent = true
      var parentName
      var parentHeader
      var parentsArray = []
      var nodesXSD
      var elementXSD
      var minOccurs
      var maxOccurs
      var nbForm
      var elementXSD
      var otherChildren

      element = $(element).children('div[class~="collapsible-header"]')
      var elementName = $(element).attr('name')
      var addMenuBody

      // filter the parent elem
      $(element).parents().each(function(i,parent){
        if($(parent).attr('id') == idDisplayedFrom ){
          isSelectedParent = false
        }
        if(isSelectedParent && $(parent).attr('class') == 'collapsible-body'){
          // get the header of the parent
          parentHeader = parent.parentNode
          parentHeader = $(parentHeader).children('div[class~="collapsible-header"]')
          parentsArray.push($(parentHeader))
        }
      })
      parentsArray.reverse()
      // retrieve the XSD element to the element to add with the parents
      nodesXSD = $(this.XSDObject).find('xs\\:schema')

      $(parentsArray).each(function(i,parent){
        parentName = $(parent).attr('name')
        nodesXSD = $(nodesXSD).children('xs\\:element[name="' + parentName + '"]')
        nodesXSD = $(nodesXSD).children().children()
      })

      elementXSD = $(nodesXSD).children('xs\\:element[name="' + elementName + '"]')

      minOccurs = $(elementXSD).attr('minOccurs')
      maxOccurs = $(elementXSD).attr('maxOccurs')
      if(minOccurs == undefined){
        minOccurs = 1
      }
      if(maxOccurs == undefined){
        maxOccurs = 1
      }
      nbForm = $(element).parents('ul[class~="collapsible"]')[0]
      nbForm = $(nbForm).children()
      nbForm = $(nbForm).children('div[name="'+ elementName +'"][class~="collapsible-header"]')
      nbForm = nbForm.length
      if(nbForm > minOccurs){
        // remove the delete button
        if(nbForm - 1 == minOccurs){
          otherChildren =  $(element).parents('div[class~="collapsible-body"]')[0]
          otherChildren = $(otherChildren).children('ul').children('li')
          otherChildren = $(otherChildren).children(
            'div[name="' + elementName + '"][class~="collapsible-header"]'
          )
          otherChildren = $(otherChildren).each(function(i,child){
            $(child).children().last().empty()
          })
        }
        // add the element to the addMenu
        if(maxOccurs!= 'unbounded' && nbForm == maxOccurs){
          addMenuBody = $(element).parents('div[class~="collapsible-body"]')[0]
          addMenuBody = $(addMenuBody).children('ul').children('li')
          addMenuBody = $(addMenuBody).children('[id="addMenuBody"]')
          Form.addToAddMenu(elementName, addMenuBody)
        }
        //delete the element with the li parent tag
        $(element).parent().remove()

      }
      // init the collapsible element
      // $(document).ready(function(){
      //   $('.collapsible').collapsible()
      // })
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
        if(isSelectedParent && $(parent).attr('class') == 'collapsible-body'){
          // get the header of the parent
          parentHeader = parent.parentNode
          parentHeader = $(parentHeader).children('div[class~="collapsible-header"]')
          parentsArray.push($(parentHeader).clone())
        }
      })
      // remove the last element of the array
      parentsArray.reverse()

      $('#' + this.idNav).find('div[id="anchor"]').empty()
      // default value of nav
      if(parentsArray.length == 0){
        $('#' +  this.idNav).find('div[id="anchor"]').append('<a class="breadcrumb">path ' + this.name + '</a>')
      }

      // fill the nav element
      $(parentsArray).each(function(i,parent){
        parentId = $(parent).attr('id').substr(6)
        parentName = $(parent).attr('name')
        navElement = '<a id=nav' + parentId + '  href="#!" class="breadcrumb">' + parentName + '</a>'
        $('#' + idNav).find('div[id="anchor"]').append(navElement)
      })
    }
  }

  // collapse all the element and their children
  // id the identifiant of the element to collapse
  collapseAll(id){
    var arrow
    var toCollapse = $('#' + id).find('[class~="collapsible"]')
    // console.log('toCollapse', toCollapse)
    $(toCollapse).each(function(i,e){
      $(e).children('li').each(function(i, li){
            $(e).collapsible('close',i)
            // update the state of the arrow of the header
            arrow = $(li).children('div[class~="collapsible-header"]')
            arrow = $(arrow).find('i')[0]
            $(arrow).text('keyboard_arrow_right')
      })
    })
  }

  // TODO fix problem with timeLine
  // display the information of the frames in the forms
  // name the tag of the element
  // startFrame the value of the attribut startFrame of the element to display
  // endFrame the value of the attribut endFrame of the element to display
  displayFrame(name,startFrame, endFrame){
    if(name ==undefined || startFrame == undefined || endFrame == undefined){
      alert("displayFrame : Illegal Argument Exception")
    }else{
      this.assembleForms()
      var input = $('#' + this.idDisplayedForm)
      var body
      // case for timeId
      if(startFrame == endFrame){
        input = $(input).find('input[name="timeId"][value="' + startFrame + '"]')
      }else {
        // case for startFrame and endFrame
        input = $(input).find('input[name="startFrame"][value="' + startFrame + '"]')
        input = $(input).parents('[class~="collapsible-body"]')
        // console.log('input', input)
        input = $(input).find('input[name="endFrame"][value="' + endFrame + '"]')
      }

      body = $(input).closest('[class="collapsible-body"]')
      body = $(body).filter('[name="'+ name +'"]')
      // console.log('body', body)
      if(body != undefined && body.length == 1){
        var id = $(body).attr('id').substr(4)
        // open the body of the element
        var ul = $(body).parents('ul[class="collapsible"]')[0]
        var lastIndexOf = id.lastIndexOf('-')
        var index = id.substr(lastIndexOf  + 1)
        $(ul).collapsible('open', index)
        // console.log('id', id)
        $($('#header' + id).find('i')[0]).text('keyboard_arrow_down')
        this.buildNav($(body).parents())
        this.moveInForm(id)
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

    var XSD = $(this.XSDObject).find('xs\\:schema').children('xs\\:element')
    var form = $('#' + this.idDisplayedForm).children('ul').children('li').children()
    result = Form.recGetXML(form, XSD)
    //TODO call verif function

    //restore the previous state of forms
    $('#' + this.idDisplayedForm).empty()
    $('#' + this.idHiddenForm).empty()
    $('#' + this.idDisplayedForm).append(saveDisplayedForm)
    $('#' + this.idHiddenForm).append(saveHiddenForm)
    // console.log('getXML : result', result)
    return result
  }

  // recursive funtion which retrieve the XML of the form
  // parentNode a node of the form
  static recGetXML(parentNode, XMLObjectXSD){

    if(parentNode == undefined || XMLObjectXSD == undefined){
      alert('recGetXML : Illegal Argument Exception')
    }else{
      var currentNode
      var result = []
      var nodeName
      var nodesForm
      var nodeForm
      var attrsXSD
      var attrName
      var attrType
      var attrsForm
      var attrValue
      var childrenXSD
      var childrenForm
      var nbChildren = 0
      var maxOccurs
      var minOccurs
      var j

      // browse the XSD element
      $(XMLObjectXSD).each(function(i,nodeXSD){

        nodeName = $(nodeXSD).attr('name')
        maxOccurs = $(nodeXSD).attr('maxOccurs')
        minOccurs = parseInt($(nodeXSD).attr('minOccurs'))
        j = 0

        nodesForm = $(parentNode).filter('[class~="collapsible-body"][name="'+ nodeName +'"]')
        // console.log('nodesForm', nodesForm)
        if(maxOccurs == undefined){
          maxOccurs = 1
        }
        if(minOccurs == undefined){
          minOccurs = 1
        }

        // set the value of the number of children to display
        if(maxOccurs == 'unbounded' || nodesForm.length < maxOccurs){
          maxOccurs = nodesForm.length
        }

        if(minOccurs > nodesForm.length){
          alert('recGetXML : Invalid data input')
        }else{
          childrenXSD = $(nodeXSD).children().children()
          childrenXSD = $(childrenXSD).children('xs\\:element')
          while(j < maxOccurs){
            currentNode = $('<' + nodeName + '/>')
            nodeForm = $(nodesForm).get(j)

            // retrieve the attributes

            if($(nodeXSD).children().children('xs\\:attribute').length > 0){
              // attributes of the nodes
              attrsXSD = $(nodeXSD).children().children('xs\\:attribute')
            }else{
              // attributes of the leaves
              attrsXSD = $(nodeXSD).children().children('xs\\:simpleContent')
              attrsXSD = $(attrsXSD).children('xs\\:extension')
              attrsXSD = $(attrsXSD).children('xs\\:attribute')
            }
            $(attrsXSD).each(function(i,attrXSD){
              // TODO verif more precisly the value
              attrName = $(attrXSD).attr('name')
              attrType = $(attrXSD).attr('type')
              attrsForm = $(nodeForm).children('div').find('input')
              $(attrsForm).each(function(i,attrForm){
                if($(attrForm).attr('name') == attrName){
                  attrValue = $(attrForm).val()
                }
              })
              if($(attrXSD).attr('fixed') != undefined){
                attrValue = $(attrXSD).attr('fixed')
              }
              if($(attrXSD).attr('default') != undefined &&
                (attrValue == undefined || $(attrValue).is(':empty'))){
                  attrValue = $(attrXSD).attr('default')
              }
              // console.log(attrName,' ', attrValue)
              // using setAttributeNS() to keep the uppercase rather than attr()
              $(currentNode)[0].setAttributeNS('' ,attrName, attrValue)
            })


            if(childrenXSD.length > 0){
              childrenForm = $(nodeForm).children('ul[class="collapsible"]')
              childrenForm = $(childrenForm).children('li').children()
              $(currentNode).append(Form.recGetXML(childrenForm, childrenXSD))
            }
            result[nbChildren] = currentNode
            nbChildren ++
            j++
          }
        }
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
    // $(document).ready(function(){
    //   $('.collapsible').collapsible();
    // });
  }
}
