import { XMLFilter } from '../XMLFilter/XMLFilter.js'
export class XMLSelector{

  /* Constructor
  @xsdObj: XMLXSDObject
  @nameExtractor: name of the extractor
  @divId: the id of the div which will contain the code of the filter
  */
  constructor(xsdObj, nameExtractor, divId){
    this.xsdObj = xsdObj;
    this.nameExtractor = nameExtractor;
    this.divId = divId;
    this.indexFilter = 0;
    this.currentFilterIndex = undefined;
    this.table = xsdObj.table;
    this.stack = [];
    this.comboBoxList = [];
    this.xmlFilter = new XMLFilter(this);
    this.currentAttr = undefined
    // value to prevent to generate code for attr out of attrManage restriction
    // which occurs when node value type are different of void type.
    this.attrManage = false;
  }

  getXMLFilter(){
    return this.xmlFilter;
  }

  /* Generate the form for the filter part
  */
  generateSelector(){
    var that = this;
    var divParent =  $('#'+this.divId);
    // $('#'+this.divId).append(divParent);

    var divAdd = $('<div/>');
    $(divAdd).addClass('row');
    $(divParent).append(divAdd);

    var idAddFilter = this.divId+'_addFilter';
    var addFilter = $('<a/>');
    $(addFilter).addClass('btn-floating');
    $(addFilter).addClass('waves-effect waves-light');
    $(addFilter).addClass('indigo lighten-2');
    $(addFilter).addClass('bold');
    $(addFilter).attr('id', idAddFilter);
    $(addFilter).attr('title', TAPi18n.__('add_filter'))
    $(addFilter).on('click',function(){ that.eventAddFilter()});
    $(divAdd).append(addFilter);
    var iconAdd =  $('<i/>');
    $(iconAdd).addClass('material-icons left');
    $(iconAdd).text('add');
    $(addFilter).append(iconAdd);

    var labelAddFilter = $('<a/>')
    $(labelAddFilter).addClass('btn-flat disabled');
    $(labelAddFilter).text(TAPi18n.__('add_filter'))
    $(divAdd).append(labelAddFilter);

    var help = $('<a/>')
    $(help).attr('target','_blank');
    $(help).attr('href','/help#filter_help');
    $(help).css('padding-top','20px');
    var iconHelp = $('<i/>');
    $(iconHelp).addClass('material-icons');
    $(iconHelp).text('help');
    $(help).append(iconHelp);
    $(divAdd).append(help);

    var divFilter = $('<div/>');
    $(divFilter).addClass('row');
    $(divFilter).addClass('valign-wrapper');
    $(divParent).append(divFilter);


    var idFilterButton = this.divId+'_filter';
    var filterButton = $('<input/>');
    $(filterButton).attr('type', 'checkbox');
    $(filterButton).attr('class', 'filled-in');
    $(filterButton).attr('id', idFilterButton);
    $(filterButton).on('click',function(){ that.eventFilter(this)});
    $(divFilter).append(filterButton);

    var labelFilter = $('<label/>');
    $(labelFilter).attr('for', idFilterButton);
    $(divFilter).append(labelFilter);

    var labelFilter = $('<a/>');
    $(labelFilter).addClass('btn-flat disabled');
    $(labelFilter).text(TAPi18n.__('filter'))
    $(divFilter).append(labelFilter);

    that.xsdObj.accept(that);
    // console.log('this', this)
  }

  /* Visitor pattern : visit function
  @xmlxsdObj: XMLXSDObj object
  */
  visitXSDObject(xsdObj){
    // console.log('xml filter visit xsdObj', xsdObj)
    this.stack.push(this.nameExtractor);
    xsdObj.root.accept(this);
    this.stack.pop();
  }

  /* Visitor pattern : visit function
	@xmlxsdElt: XMLXSDElt object
	*/
  visitXSDElt(xsdElt){
    // console.log('xml filter visit xsdElt', xsdElt)
    var typeName = xsdElt.type;
    var type = this.table.getType(typeName);
    if(typeof type !== 'undefined'){
      this.stack.push(xsdElt.name)
      type.accept(this);
      this.stack.pop();
    }
    this.eventAddElement(xsdElt);
  }

  /* Visitor pattern : visit function
  @xmlxsdSeq: XMLXSDSequence object
  */
  visitXSDSequence(xsdSeq){
    // console.log('xml filter visit xsdSeq', xsdSeq)
    var that = this;
    xsdSeq.seqElt.forEach(function(xsdElt, k){
      xsdElt.accept(that)
    })
  }

  /* Visitor pattern : visit function
	@xmlxsdExt: XMLXSDExtensionType object
	*/
  visitXSDExtensionType(xsdExt){

  }

  /* Visitor pattern : visit function
	@xmlxsdAttr: XMLXSDAttr objects
	*/
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

  /* Visitor pattern : visit function
	@xsdRestriction: XSDRestrictionType object
	*/
  visitXSDRestrictionType(xsdRestriction){
    // console.log('xml filter visit xsdRestriction', xsdRestriction)
    var type = xsdRestriction.baseType;
    type.accept(this)
  }

  /* Visitor pattern : visit function
	@xsdBool: XSDBooleanType object
	*/
  visitXSDBooleanType(xsdBool){
    // console.log('xml filter visit xsdBool', xsdBool)
    var optionsOp = ['=', '!='];
    var options = [true, false];
    this.generateSelectSelector(optionsOp,  options, 'bool');
  }

  /* Visitor pattern : visit function
	@xsdDeci: XSDDecimalType object
	*/
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
        this.generateSelectSelector(optionsOp, xsdDeci.enumeration, 'number');
      }else{
        optionsOp = [ '=', '!=', '>', '>=', '<', '<='];
        this.generateInputSelector(optionsOp, 'number', 0.01, value);
      }
    }
  }

  /* Visitor pattern : visit function
	@xsdFloat: XSDFloatType object
	*/
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
        this.generateSelectSelector(optionsOp, xsdFloat.enumeration,'number');
      }else{
        optionsOp = [ '=', '!=', '>', '>=', '<', '<='];
        this.generateInputSelector(optionsOp, 'number', 0.01, value);
      }
    }
  }

  /* Visitor pattern : visit function
	@xsdInt: XSDIntegerType object
	*/
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
        this.generateSelectSelector(optionsOp, xsdInt.enumeration, 'number');
      }else{
        optionsOp = [ '=', '!=', '>', '>=', '<', '<='];
        this.generateInputSelector(optionsOp, 'number', 1, value);
      }
    }
  }

  /* Visitor pattern : visit function
	@xsdString: XSDStringType object
	*/
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
        this.generateSelectSelector(optionsOp, xsdString.enumeration, 'text');
      }else{
        console.log('value', value);
        this.generateInputSelector(optionsOp, 'text', undefined, value);
      }
    }
  }

  /* Visitor pattern : visit function
	@xsdVoid: XSDVoidType object
	*/
  visitXSDVoidType(xsdVoid){
    // console.log('xml filter visit xsdVoid', xsdVoid)

  }

  /* Generate the code for the basic attribut
  @optionsOp: values of the select for the op
  @type: of the input element
  @step: of the input element only for the number
  @defaultValue: of the input by default
  */
  generateInputSelector(optionsOp, type, step, defaultValue){
    var that = this;
    var currentAttr = this.currentAttr;
    var currentFilterIndex = this.currentFilterIndex;
    var divAttrId = this.divId + '_' + this.currentFilterIndex + '_attr';
    var divParent = $('<div/>');
    $(divParent).addClass('col s12')
    $('#'+divAttrId).append(divParent);

    if(this.currentAttr !== undefined){
      var label = $('<p/>');
      $(label).text(this.currentAttr.name + ':');
      $(label).addClass('col s4')
      $(divParent).append(label);
    }
    var divOp = $('<div>');
    $(divOp).addClass('inline-field inline');
    $(divOp).addClass('col s2')
    $(divParent).append(divOp);

    var selectOp = $('<select/>');
    $(selectOp).addClass('style-input-duration')
    $(selectOp).addClass('white')
    $(selectOp).change(function(){
      that.eventAttrOp(currentFilterIndex, currentAttr.name, this);
    })
    var optionOp;
    optionsOp.forEach(function(option){
      optionOp = $('<option/>');
      $(optionOp).text(option);
      $(optionOp).val(option);
      $(selectOp).append(optionOp);
    })
    $(divOp).append(selectOp);
    $(selectOp).material_select();
    // default value
    that.eventAttrOp(currentFilterIndex, currentAttr.name, selectOp);

    var divInput = $('<div>');
    $(divInput).addClass('inline-field inline');
    $(divInput).addClass('col s6');
    $(divParent).append(divInput);

    var inputValue = $('<input/>');
    $(inputValue).attr('type', type);
    $(inputValue).addClass('style-input-xmlform')
    $(inputValue).addClass('white')
    if(type === 'number' && typeof step !== 'undefined'){
      $(inputValue).attr('step', step);
    }
    if(typeof defaultValue !== 'undefined'){
      $(inputValue).attr('value', defaultValue)
    }
    $(inputValue).change(function(){
      that.eventAttrValue(currentFilterIndex, currentAttr.name, this, type);
    })
    $(divInput).append(inputValue)
    // default value
    that.eventAttrValue(currentFilterIndex, currentAttr.name, inputValue, type);
  }

  /* Generate the code for the restriction attribut
  @optionsOp: values of the select for the op
  @options: values of the attribut
  @type: of the input element
  */
  generateSelectSelector(optionsOp, options, type){
    var that = this;
    var currentAttr = this.currentAttr;
    var currentFilterIndex = this.currentFilterIndex;
    var divAttrId = this.divId+'_'+this.currentFilterIndex+'_attr';
    var divParent = $('<div/>');
    $(divParent).addClass('col s12')
    $('#'+divAttrId).append(divParent);

    if(this.currentAttr !== undefined){
      var label = $('<p/>');
      $(label).text(this.currentAttr.name + ':');
      $(label).addClass('col s4')
      $(divParent).append(label);
    }

    var divOp = $('<div>');
    $(divOp).addClass('inline-field inline');
    $(divOp).addClass('col s1 m2')
    $(divParent).append(divOp);


    var selectOp = $('<select/>');
    $(selectOp).addClass('style-input-xmlform')
    $(selectOp).addClass('default-browser white')

    $(selectOp).change(function(){
      that.eventAttrOp(currentFilterIndex, currentAttr.name, this);
    })
    var optionOp;
    optionsOp.forEach(function(option){
      optionOp = $('<option/>');
      $(optionOp).text(option);
      $(optionOp).val(option);
      $(selectOp).append(optionOp);
    })
    $(divOp).append(selectOp);
    $(selectOp).material_select();
    // default value
    that.eventAttrOp(currentFilterIndex, currentAttr.name, selectOp);

    var divSelect = $('<div/>');
    $(divSelect).addClass('inline-field inline');
    $(divSelect).addClass('col s6');
    $(divParent).append(divSelect);

    var selectValue = $('<select/>');
    $(selectValue).addClass('style-input-xmlform')
    $(selectValue).addClass('default-browser white')
    $(selectValue).prop('multiple', true);

    var defaultValue = $('<option/>');
    $(defaultValue).prop('disabled', true);
    $(defaultValue).prop('selected', true);
    $(selectValue).append(defaultValue);

    options.forEach(function(option){
      optionValue = $('<option/>');
      $(optionValue).text(option);
      $(optionValue).val(option);
      $(selectValue).append(optionValue);
    })
    $(selectValue).change(function(){
      that.eventAttrValue(currentFilterIndex, currentAttr.name, this, type);
    })

    $(divSelect).append(selectValue)
    $(selectValue).material_select();
    // default value
    that.eventAttrValue(currentFilterIndex, currentAttr.name, selectValue, type);
  }

  /* Event handler for the adding of an element
  @element: add to the comboxList
  */
  eventAddElement(element){
    var stackCopy = this.stack.slice(0)
    stackCopy.push(element.name);
    this.comboBoxList.push({
      name : element.name,
      type : element.type,
      stack: stackCopy
    })
  }

  /* Event handler for the adding of a filter
  */
  eventAddFilter(){
    var that = this;
    var indexFilter = this.indexFilter
    var divSelect = $('<div/>');
    $(divSelect).addClass('valign-wrapper');
    // add the filter just before filter div
    $('#'+this.divId).children().last().before(divSelect);
    var iconClear = $('<i/>');
    var idClear = this.divId+'_'+indexFilter+'_clear'
    $(iconClear).addClass('material-icons small')
    $(iconClear).addClass('indigo-text text-lighten-2');
    $(iconClear).addClass('col s1');
    $(iconClear).attr('id',idClear);
    $(iconClear).attr('title', TAPi18n.__('remove_filter'))
    $(iconClear).text('remove_circle')
    $(iconClear).click(function(){
      that.eventDeleteFilter(indexFilter, this)
    })
    $(divSelect).append(iconClear);

    var idSelect = this.divId+'_'+indexFilter+'_select'
    var idAttr = this.divId+'_'+indexFilter+'_attr'

    var select = $('<select/>');
    $(select).attr('id', idSelect);
    $(select).addClass('style-input-xmlform')
    $(select).addClass('default-browser white ')
    $(select).addClass('input-field inline');
    $(select).change(function(){
      that.eventSelectElement(idAttr, indexFilter, this);
    })
    $(divSelect).append(select);

    var option = $('<option/>');
    $(option).text(TAPi18n.__('set_filter'));
    $(option).prop('disabled', true);
    $(option).prop('selected', true);
    $(select).append(option);

    this.comboBoxList.forEach(function(element, i){
      option = $('<option/>');
      $(option).text(element.name);
      $(option).val(i);
      $(option).mouseover(function(e){console.log('là', e)})
      $(select).append(option);
    })
    $(select).material_select();

    var divAttr = $('<div/>');
    $(divAttr).addClass('col s9');
    $(divAttr).attr('id', idAttr)
    // $(divAttr).addClass('divborder')
    // $(divAttr).css('background', 'white')
    $(divSelect).append(divAttr);

    this.indexFilter++;
  }

  /* Event handler for the deleting of a filterAttr
  @index: of the filter
  @target: the delete button
  */
  eventDeleteFilter(index, target){
    $(target).parents('div').first().remove();
    this.xmlFilter.deleteFilter(index);
  }

  /* Event handler for filtering
  @target: the checkbox element
  */
  eventFilter(target){
    this.xmlFilter.setIsActive($(target).prop('checked'))
  }

  eventOption(target){
    console.log('ici')
  }

  /* Event handler for selecting and element
  @idAttr: of the div to display the code for the attributs
  @index: of the filter
  @target: the select element
  */
  eventSelectElement(idAttr, index, target){
    var that = this;
    var oldFilterIndex = this.currentFilterIndex;
    this.currentFilterIndex = index;
    var selected = $(target).find(':selected')
    var selectedValue = $(selected).val()
    var selectedType = this.comboBoxList[selectedValue].type;
    var selectedStack = this.comboBoxList[selectedValue].stack;
    var selectedName = $(selected).text()
    if(typeof selectedType !== 'undefined'){
      var type = this.table.getType(selectedType);
      var divAttr = $('#'+this.divId).find('#'+idAttr);
      $(divAttr).empty();
      if(typeof type !== 'undefined' &&
        typeof type.attrs !== 'undefined'){
        var i = 0;
        this.xmlFilter.deleteFilter(index);
        this.xmlFilter.setStack(index, selectedStack);
        $.each(type.attrs, function(key, attr){
          // if(i % 2 == 0){
          //   var div = $('<div/>')
          //   $(div).addClass('col s12')
          //   $(divAttr).append(div)
          // }
          attr.accept(that);
          i++;
        })
      }
    }
    this.currentFilterIndex = oldFilterIndex;
  }

  /* Event handler for change the value of the attr
  @index: the index of the filter
  @nameAttr: the name of the attr
  @target: the element which contains the value(s) of the element
  @type: of the attr (bool, text, number,...)
  */
  eventAttrValue(index, nameAttr, target, type){
    var value = $(target).val();
    var parsedValue
    // case select multiple
    if(Array.isArray(value)){
      parsedValue = []
      for(var i = 0, l = value.length; i < l; i++){
        parsedValue[i] = XMLSelector.parseInput(value[i], type)
      }
    }else{
      // case input
      parsedValue = XMLSelector.parseInput(value, type)
    }
    this.xmlFilter.setAttrValue(index, nameAttr, parsedValue)
  }

  /* Parse the value of the input for the XMLFIlter object
  @value: the stirng which parse
  @type: of the input (text, number, bool)
  @returns: the parsedValue, default NaN for number and '' otherwise
  */
  static parseInput(value, type){
    var parsedValue = '';
    if(typeof value === 'string'){
      switch(type){
        case 'bool':
        if(value === 'true'){
          parsedValue = true;
        }else if(value === 'false'){
          parsedValue = false
        }
        break;
        case 'number':
          // Number('') return 0
          if(value !== ''){
            parsedValue = Number(value);
          }
          if(isNaN(parsedValue) && parsedValue !== 0){
            parsedValue = '';
          }
          break;
        case 'text':
          if(value === null ||
            value === undefined){
            parsedValue = '';
          }else{
            parsedValue = String(value);
          }
          break;
        default:
          if(value === null ||
            value === undefined){
              parsedValue = '';
            }else{
              parsedValue = String(value);
            }
        }
    }
    return parsedValue;
  }

  /* Event handler for change the value of the attr
  @index: the index of the filter
  @nameAttr: the name of the attr
  @target: the input element
  */
  eventAttrOp(index, nameAttr, target){
    var op = $(target).val();
    this.xmlFilter.setAttrOp(index, nameAttr, op)
  }

}
