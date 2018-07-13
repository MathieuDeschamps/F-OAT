export class XMLSelector{

  /* Constructor
  @xsdObj : XMLXSDObject
  @divId : the id of the div which will contain the code of the filter
  */
  constructor(xsdObj, divId){
    this.xsdObj = xsdObj;
    this.divId = divId;
    this.indexFilter = 0;
    this.currentFilterIndex = undefined;
    this.table = xsdObj.table;;
    this.xmlFilter = undefined;
    this.comboBoxList = [];
    this.selector = {};
    this.eventHandler = []
    this.selectedElement = {type:undefined};
    this.currentAttr = undefined
    // value to prevent to generate code for attr out of attrManage restriction
    // which occurs when node value type are different of void type.
    this.attrManage = false;
  }

  generateSelector(){
    var that = this;
    var divParent = $('<div/>');
    $('#'+this.divId).append(divParent);

    var title = $('<h5/>');
    $(title).addClass('blue-text text-darken-3');
    $(title).text('Filter :');
    $(divParent).append(title);

    var divAdd = $('<div/>');
    $(divAdd).addClass('row');
    $(divParent).append(divAdd);

    var idAddFilter = this.divId+'_addFilter';
    var addFilter = $('<a/>');
    $(addFilter).addClass('btn waves-effect waves-light');
    $(addFilter).addClass('col s2');
    $(addFilter).attr('id', idAddFilter);
    $(addFilter).text('Add a filter');
    $(divAdd).append(addFilter);
    var iconAdd =  $('<i/>');
    $(iconAdd).addClass('material-icons left');
    $(iconAdd).text('add');
    $(addFilter).append(iconAdd);

    this.eventAddFilter(idAddFilter);

    that.xsdObj.accept(that);

    that.applyEventHandler();
  }

  visitXSDObject(xsdObj){
    // console.log('xml filter visit xsdObj', xsdObj)
    xsdObj.root.accept(this)
  }

  visitXSDElt(xsdElt){
    // console.log('xml filter visit xsdElt', xsdElt)
    var typeName = xsdElt.type;
    var type = this.table.getType(typeName);
    if(typeof type !== 'undefined'){
      type.accept(this);
    }
    this.eventAddElement(xsdElt);
  }

  visitXSDSequence(xsdSeq){
    // console.log('xml filter visit xsdSeq', xsdSeq)
    var that = this;
    xsdSeq.seqElt.forEach(function(xsdElt, k){
      xsdElt.accept(that)
    })
  }

  visitXSDExtensionType(xsdExt){

  }

  visitXSDAttr(xsdAttr){
    // console.log('xml filter visit xsdAttr', xsdAttr)
    var type = this.table.getType(xsdAttr.type)
    var oldAttr = this.currentAttr;
    var oldAttrManage = this.attrManage;
    this.currentAttr = xsdAttr
    this.attrManage = true;
    type.accept(this);
    this.currentAttr = oldAttr;
    this.attrManage = oldAttrManage;
  }

  visitXSDRestrictionType(xsdRestriction){
    // console.log('xml filter visit xsdRestriction', xsdRestriction)
    var type = xsdRestriction.baseType;
    type.accept(this)
  }

  visitXSDBooleanType(xsdBool){
    // console.log('xml filter visit xsdBool', xsdBool)
    var optionsOp = ['=', '!='];
    var options = [true, false];
    this.generateSelectSelector(optionsOp, options);
  }

  visitXSDDecimalType(xsdDeci){
    // console.log('xml filter visit xsdDeci', xsdDeci)
    if(this.attrManage){
      var optionsOp;
      var attr = this.currentAttr
      var value;
      if(typeof attr.fixedValue !== 'undefined'){
        value = attr.fixedValue;
      }else if(typeof attr.value !== 'undefined'){
        value = attr.value;
      }else if(typeof attr.defaultValue !== 'undefined'){
        value = attr.defaultValue;
      }
      if (xsdDeci.isEnumerated()){
        optionsOp = [ '=', '!='];
        this.generateSelectSelector(optionsOp, xsdDeci.enumeration);
      }else{
        optionsOp = [ '=', '!=', '>', '>=', '<', '<='];
        this.generateInputSelector(optionsOp, 'number', 0.01, value);
      }
    }
  }

  visitXSDFloatType(xsdFloat){
    // console.log('xml filter visit xsdFloat', xsdFloat)
    if(this.attrManage){
      var optionsOp
      if (xsdFloat.isEnumerated()){
        optionsOp = [ '=', '!='];
        var attr = this.currentAttr
        var value;
        if(typeof attr.fixedValue !== 'undefined'){
          value = attr.fixedValue;
        }else if(typeof attr.value !== 'undefined'){
          value = attr.value;
        }else if(typeof attr.defaultValue !== 'undefined'){
          value = attr.defaultValue;
        }
        this.generateSelectSelector(optionsOp, xsdFloat.enumeration);
      }else{
        optionsOp = [ '=', '!=', '>', '>=', '<', '<='];
        this.generateInputSelector(optionsOp, 'number', 0.01, value);
      }
    }
  }

  visitXSDIntegerType(xsdInt){
    // console.log('xml filter visit xsdInt', xsdInt);
    if(this.attrManage){
      var optionsOp;
      var attr = this.currentAttr
      var value;
      if(typeof attr.fixedValue !== 'undefined'){
        value = attr.fixedValue;
      }else if(typeof attr.value !== 'undefined'){
        value = attr.value;
      }else if(typeof attr.defaultValue !== 'undefined'){
        value = attr.defaultValue;
      }
      if (xsdInt.isEnumerated()){
        optionsOp = [ '=', '!='];
        this.generateSelectSelector(optionsOp, xsdInt.enumeration);
      }else{
        optionsOp = [ '=', '!=', '>', '>=', '<', '<='];
        this.generateInputSelector(optionsOp, 'number', 0.01, value);
      }
    }
  }

  visitXSDStringType(xsdString){
    // console.log('xml filter visit xsdString', xsdString)
    if(this.attrManage){
      var optionsOp = [ '=', '!='];
      var attr = this.currentAttr
      var value;
      if(typeof attr.fixedValue !== 'undefined'){
        value = attr.fixedValue;
      }else if(typeof attr.value !== 'undefined'){
        value = attr.value;
      }else if(typeof attr.defaultValue !== 'undefined'){
        value = attr.defaultValue;
      }
      if(xsdString.isEnumerated()){
        this.generateSelectSelector(optionsOp, xsdString.enumeration);
      }else{
        this.generateInputSelector(optionsOp, 'text', undefined, value);
      }
    }
  }

  visitXSDVoidType(xsdVoid){
    // console.log('xml filter visit xsdVoid', xsdVoid)

  }

  generateInputSelector(optionsOp, type, step, defaultValue){
    divAttrId = this.divId + '_' + this.currentFilterIndex + '_attr';
    var divParent =  $('#'+divAttrId).children().last();
    console.log('divParent', divParent);
    if(this.currentAttr !== undefined){
      var label = $('<p/>');
      $(label).text(this.currentAttr.name + ':');
      $(label).addClass('col s4')
      $(divParent).append(label);
    }

    var selectOp = $('<select/>');
    $(selectOp).addClass('col s2')
    var optionOp;
    optionsOp.forEach(function(option){
      optionOp = $('<option/>');
      $(optionOp).text(option);
      $(optionOp).val(option);
      $(selectOp).append(optionOp);
    })
    $(divParent).append(selectOp);

    var inputValue = $('<input/>');
    $(inputValue).attr('type', type);
    $(inputValue).addClass('col s6')
    if(type === 'number' && typeof step !== 'undefined'){
      $(inputValue).attr('step', step);
    }
    if(typeof defaultValue !== 'undefined'){
      $(inputValue).attr('value', defaultValue)
    }
    $(divParent).append(inputValue)
  }

  generateSelectSelector(optionsOp, options){
    var idAttr = this.divId+'_'+this.currentFilterIndex+'_attr';
    var divParent =  $('#'+idAttr).children().last();
    console.log('divParent', divParent, idAttr);
    if(this.currentAttr !== undefined){
      var label = $('<p/>');
      $(label).text(this.currentAttr.name + ':');
      $(label).addClass('col s4')
      $(divParent).append(label);
    }

    var selectOp = $('<select/>');
    $(selectOp).addClass('col s2')
    var optionOp;
    optionsOp.forEach(function(option){
      optionOp = $('<option/>');
      $(optionOp).text(option);
      $(optionOp).val(option);
      $(selectOp).append(optionOp);
    })
    $(divParent).append(selectOp);

    var selectValue = $('<select/>');
    $(selectValue).prop('multiple', true);
    options.forEach(function(option){
      optionValue = $('<option/>');
      $(optionValue).text(option);
      $(optionValue).val(option);
      $(selectValue).append(optionValue);
    })
    $(selectValue).addClass('col s6')
    $(divParent).append(selectValue)
  }

  applyEventHandler(){
    console.log('this.eventHandler', this.eventHandler);

    this.eventHandler.forEach(function(handler){
			var jqElt
			if(typeof handler.id !== 'undefined' &&
				 typeof handler.eventName !== 'undefined' &&
			   typeof handler.function !== 'undefined'){
				jqElt ='#'+handler.id;
				$(jqElt).on(handler.eventName,handler.function);
			}else{
				alert('applyEventHandler : Event Handler Error'  )
			}
		});
    this.eventHandler = [];
  	$('#'+this.divId).find('select').material_select()
  }

  eventAddFilter(idAddFilter){
    var that = this;
    this.eventHandler.push({
      function:function(){
        var divSelect = $('<div/>');
        $(divSelect).addClass('valign-wrapper');
        $('#'+that.divId).append(divSelect);

        var indexFilter = that.indexFilter
        var iconClear = $('<i/>');
        var idClear = that.divId+'_'+indexFilter+'_clear'
        $(iconClear).addClass('material-icons small')
        $(iconClear).addClass('red-text')
        $(iconClear).addClass('col s1');
        $(iconClear).attr('id',idClear);
        $(iconClear).text('clear')
        $(divSelect).append(iconClear);
        that.eventRemoveFilter(idClear);

        var select = $('<select/>');
        var idSelect = that.divId+'_'+indexFilter+'_select'
        $(select).attr('id', idSelect);
        $(divSelect).append(select);

        var option = $('<option/>');
        $(option).text('Set a filter...');
        $(option).prop('disabled', true);
        $(option).prop('selected', true);
        $(select).append(option);

        that.comboBoxList.forEach(function(element){
          option = $('<option/>');
          $(option).text(element.name);
          $(option).val(element.type);
          $(select).append(option);
        })

        var divAttr = $('<div/>');
        var idAttr = that.divId+'_'+indexFilter+'_attr'
        $(divAttr).addClass('col s8');
        $(divAttr).attr('id', idAttr)
        $(divSelect).append(divAttr);

        that.eventHandler.push({
          function:function(){
            that.currentFilterIndex = indexFilter;
            var selected = $(this).find(':selected')
            var selectedType = $(selected).val()
            var selectedName = $(selected).text()
            if(typeof selectedType !== 'undefined' &&
            selectedType !== that.selectedElement.type){
              that.selectedElement = {name: selectedName, type: selectedType}
              var type = that.table.getType(selectedType);
              $(divAttr).empty();
              if(typeof type !== 'undefined' &&
                typeof type.attrs !== 'undefined'){
                var i = 0;
                $.each(type.attrs, function(key, attr){
                  if(i % 2 == 0){
                    var div = $('<div/>')
                    $(div).addClass('valign-wrapper col s12')
                    $(divAttr).append(div)
                  }
                  attr.accept(that);
                  i++;
                })
                that.applyEventHandler();
              }
            }
          },
          id: idSelect,
          eventName:'change'
        })

        that.applyEventHandler();
        this.indexFilter++;
      },
      id: idAddFilter,
      eventName: 'click'
    })
  }

  eventRemoveFilter(idClear){
    var that = this;
    this.eventHandler.push({
      function:function(){
        $(this).parents('div').first().remove();
      },
      id:idClear,
      eventName: 'click'
    })
  }

  eventRemoveElement(element){

  }

  eventAddElement(element){
    this.comboBoxList.push({
      name : element.name,
      type : element.type
    })
  }

  eventAttrSelector(attr){

  }


}
