export class XMLFilter{

  /* Constructor
  @xsdObj: XMLXSDObject
  @nameExtractor: name of the extractor
  */
  constructor(){
    // check type of params
    this.filterList = [];
    this.observers = [];
    this.isActive = false;
    this.toVisit = [];
    this.currentFilter = undefined;
    this.isMatching = true;
  }

  getFilter(key){
    // check type of params
    if(typeof key !== 'number'){
      return
    }
    return this.filterList[key];
  }

  getIsActive(){
    return this.isActive;
  }

  setIsActive(state){
    if(state === true || state === false){
      this.isActive = state
      this.notifyAll();
    }
  }

  setFilterStack(key, stack){
    // check type of params
    if(!(typeof key === 'number' && stack instanceof Array)){
      console.log('setFilterStack: Illegal Argument Exception');
      return
    }
    if(typeof key !== 'undefined' && key !== null){
      var oldLength = this.filterList.length
      if(typeof this.filterList[key] === 'undefined'){
        this.filterList[key] = {}
        if(oldLength === this.filterList.length && key > oldLength){
          this.filterList.length = key + 1;
        }
      }
      if(typeof stack === 'undefined' || stack === null || !Array.isArray(stack)){
        this.filterList[key].filterStack = [];
      }else{
        var parsedStack = []
        for(var i = 0, l = stack.length; i < l; i++){
          if(typeof stack[i] === 'string'){
            parsedStack.push(stack[i])
          }else{
            parsedStack.push(String(stack[i]));
          }
        }
        this.filterList[key].filterStack = parsedStack;
        if(this.isActive){
          this.notifyAll();
        }
      }
    }
  }

  setAttachedStack(key, stack){
    // check type of params
    if(!(typeof key === 'number' && stack instanceof Array)){
      console.log('setAttachedStack: Illegal Argument Exception');
      return
    }
    if(typeof key !== 'undefined' && key !== null){
      var oldLength = this.filterList.length
      if(typeof this.filterList[key] === 'undefined'){
        this.filterList[key] = {}
        if(oldLength === this.filterList.length && key > oldLength){
          this.filterList.length = key + 1;
        }
      }
      if(typeof stack === 'undefined' || stack === null || ! Array.isArray(stack)){
        this.filterList[key].attachedStack = [];
      }else{
        var parsedStack = []
        for(var i = 0, l = stack.length; i < l; i++){
          if(typeof stack[i] === 'string'){
            parsedStack.push(stack[i])
          }else{
            parsedStack.push(String(stack[i]));
          }
        }
        // console.log('stack', parsedStack)
        this.filterList[key].attachedStack = parsedStack;
        if(this.isActive){
          this.notifyAll();
        }
      }
    }
  }

  setAttrOp(key, attrName, op){
    // check type of params
    if(!(typeof key === 'number' &&
        typeof attrName === 'string' &&
        (typeof op === 'string' || op instanceof Array))){
      console.log('setAttrOp: Illegal Argument Exception');
      return
    }
    var filter = this.getFilter(key)

    if(typeof filter === 'undefined'){
      this.setFilterStack(key, []);
      this.setAttachedStack(key, []);
      filter = this.getFilter(key)
    }
    if(typeof filter.attrs === 'undefined'){
      filter.attrs = {};
    }
    if(typeof filter.attrs[attrName] === 'undefined'){
      filter.attrs[attrName] = {};
    }
    if(typeof op === 'undefined' ||
    op === null|| op.length === 0){
    }else if(op instanceof Array){
      filter.attrs[attrName].op = op[0];
    }else{
      filter.attrs[attrName].op = op;
    }
    if(this.isActive){
      this.notifyAll();
    }
  }

  setAttrValue(key, attrName, value){
    // check type of params
    if(!(typeof key === 'number' && typeof attrName === 'string')){
      console.log('setAttrValue: Illegal Argument Exception');
      return
    }
    var filter = this.getFilter(key);
    if(typeof filter === 'undefined'){
      this.setFilterStack(key, []);
      this.setAttachedStack(key, []);
      filter = this.getFilter(key)
    }
    if(typeof filter.attrs === 'undefined'){
      filter.attrs = {};
    }
    if(typeof filter.attrs[attrName] === 'undefined'){
      filter.attrs[attrName] = {};
    }
    if(typeof value === 'undefined' ||
    value === null|| value.length === 0){
      filter.attrs[attrName].value = '';
    }
    else if(value.length === 1){
      filter.attrs[attrName].value = value[0];
    }else{
      filter.attrs[attrName].value = value;
    }
    if(this.isActive){
      this.notifyAll();
    }
  }

  /* delete a filter
  @key: is the index of the filter to delete in the filterList
  @returns true if deleted
           false otherwise
  */
  deleteFilter(key){
    // check type of params
    if(!typeof key === 'number'){
      return false;
    }
    var result = false;
    var filter = this.getFilter(key)
    if(typeof filter !== 'undefined'){
      delete this.filterList[key];
      if(this.isActive){
        this.notifyAll();
        result = true;
      }
    }
    return result;
  }

  /* Empty the filterList
  */
  emptyFilter(){
    this.filterList.length = 0;
    this.filterList= [];
    if(this.isActive){
      this.notifyAll();
    }
  }

  /* Obsever pattern : attach function
  @observer: Object
  */
  attach(observer){
    if(!this.alreadyAttached(observer)){
      this.observers.push(observer);
    }
  }

  /* Check if an observer is already attached
  @returns: true if newOserver is include in this.observers
  *         false otherwise
  */
  alreadyAttached(newObserver){
    var result = false;
    this.observers.forEach(function(observer){
      if(observer.equals(newObserver)){
        result = true;
      }
    })
    return result;
  }

  /* Obsever pattern : detach function
  @observer: Object
  */
  detach(observer){
    var index = this.observers.indexOf(observer);
    this.observers.splice(index);
  }

  /* Obsever pattern : notifyAll function
  */
  notifyAll(){
    this.observers.forEach(function(observer){
      observer.updateXMLFilter();
    });
  }

  /* Visitor pattern : visit function
  @xmlxsdObj: XMLXSDObj object
  */
  visitXMLXSDObject(xmlxsdObj){
    // console.log('visitXMLXSDObject ', xmlxsdObj);
    xmlxsdObj.content.accept(this);
  }
  /* Visitor pattern : visit function
  @xmlxsdElt: XMLXSDElt object
  */
  visitXMLXSDElt(xmlxsdElt){
    // console.log('visitXMLXSDElt ', xmlxsdElt);
    var that = this;
    var result = false
    if(xmlxsdElt.eltsList.length === 0){
      // no element in the list but the filter want to filtering on this element
      this.isMatching = false;
    }
    $(xmlxsdElt.eltsList).each(function(i, elt){
      if(that.toVisit.length === 0){
          if(XMLFilter.matchElement(elt, that.currentFilter)){
            result = true;
          }
      }else{
        elt.accept(that);
      }
    })
    if(that.toVisit.length === 0){
      this.isMatching = result;
    }
  }

  /* Visitor pattern : visit function
  @xmlxsdSeq: XMLXSDSequence object
  */
  visitXMLXSDSequence(xmlxsdSeq){
    // console.log('visitXMLXSDSeq ', xmlxsdSeq);
    var nameElement = this.toVisit.shift();
    var xmlxsdElt = $(xmlxsdSeq.seqList[0]).filter(function(i, xmlxsdElt){
      return xmlxsdElt.name === nameElement;
    })
    if(xmlxsdElt.length === 1){
      xmlxsdElt[0].accept(this);
    }else{
      console.log('visitXMLXSDSeq: Element Not Found')
      //TODO return something
    }
    // replace the firstElement;
    this.toVisit.unshift(nameElement);
  }

  /* Visitor pattern : visit function
	@xmlxsdExt: XMLXSDExtensionType object
	*/
  visitXMLXSDExtensionType(xmlxsdExt){
    // console.log('visitXMLXSDExtensionType ', xmlxsdExt);

  }

  /* Match XMLXSDElement and filterList
  @xmlxsdElement: the XMLXSDElement to match
  @stack: of the XMLXSDElement
  @returns: true if the XMLXSDElement matchs the filterList
          false otherwise
  */
  matchFilter(xmlxsdElement, stack){
    var that = this;
    that.isMatching = true;
    // check type of params
    if(!stack instanceof Array){
      return false;
    }

    var parsedStack = []
    for(var i = 0, l = stack.length; i < l; i++){
      parsedStack.push(String(stack[i].tag))
    }
    var matchedFilterList = this.getMatchedFilterList(parsedStack);

    matchedFilterList.forEach(function(filter){
      if(XMLFilter.samePlace(filter.filterStack, filter.attachedStack)){
        if(!XMLFilter.matchElement(xmlxsdElement, filter)){
          that.isMatching = false;
          // exit the loop
          return;
        }
      }else if(XMLFilter.childStack(filter.filterStack, filter.attachedStack)){
        that.currentFilter = filter;
        that.toVisit = filter.filterStack.slice(filter.attachedStack.length);
        if(that.toVisit.length > 0){
          xmlxsdElement.accept(that);
          // console.log('that.isMatching', that.isMatching)
          if(!that.isMatching){
            // exit the loop
            return
          }
        }else{
          console.log('matchFilter: Bad Filter')
          //TODO return something
        }

      }

    })
    // console.log('xmlxsdElement', xmlxsdElement);
    // console.log('this.isMatching', this.isMatching);
    return this.isMatching;
  }

  static matchElement(xmlxsdElement,filter){
    var result = true;
    this.isMatching = true;
    $.each(filter.attrs, function(key, filterAttr){

      if(typeof xmlxsdElement.attrs[key] !== 'undefined' &&
        xmlxsdElement.attrs[key] !== null &&
        result ){
          var currentAttrValue = xmlxsdElement.attrs[key].value;
          if(filterAttr.value instanceof Array){
            for(var i = 0, l = filterAttr.value.length; i < l; i++){
              if(!XMLFilter.match(currentAttrValue, filterAttr.op, filterAttr.value[i])){
                result =  false;
                i = l;
              }
            }
          }
          else{
            if(!XMLFilter.match( currentAttrValue, filterAttr.op, filterAttr.value)){
              result = false;
            }
          }
        }else{
          // when the xmlxsdElement didn't have the attributs which filtering
          result = false;
        }
    })
    return result;
  }


  /* Macth a value with the filter's op and a filter's value
  @value: to match
  @filterAttrOp: the op of the attr
  @filterAttrValue: a value of the attr
  @returns: true if the value match the filterAttrOp with the filterAttrValue
           false otherwise
  */
  static match(value, filterAttrOp, filterAttrValue){
    // check type of params
    if(typeof filterAttrOp !=='string'){
      return false;
    }
    var result = true;
    if(!(filterAttrOp === '=' && filterAttrValue === '')){
      switch (filterAttrOp) {
        case '=':
        if(typeof value !== typeof filterAttrValue){
          result = false;
        }else  if(typeof value === 'string' &&
          typeof filterAttrValue === 'string' &&
          value.indexOf(filterAttrValue) === -1){
            // when the value contains the filterAttr
            result = false;
          }else if(typeof value !== 'string' &&
            typeof filterAttrValue !== 'string' &&
            value !== filterAttrValue){
            result = false;
          }
          break;
        case '!=':
          if(value === filterAttrValue){
            result = false;
          }
          break;
        case '>':
          if(typeof value !== "number" ||
          typeof filterAttrValue !== "number" ||
          isNaN(value) ||
          isNaN(filterAttrValue)){
            result = false
          }else if(value <= filterAttrValue){
            result = false;
          }
          break;
        case '>=':
          if(typeof value !== "number" ||
          typeof filterAttrValue !== "number" ||
          isNaN(value) ||
          isNaN(filterAttrValue)){
            result = false
          }else if(value < filterAttrValue){
            result = false;
          }
          break;
        case '<':
          if(typeof value !== "number" ||
          typeof filterAttrValue !== "number" ||
          isNaN(value) ||
          isNaN(filterAttrValue)){
            result = false
          }else if(value >= filterAttrValue){
            result = false;
          }
          break;
        case '<=':
          if(typeof value !== "number" ||
          typeof filterAttrValue !== "number" ||
          isNaN(value) ||
          isNaN(filterAttrValue)){
            result = false
          }else if(value > filterAttrValue ){
            result = false;
          }
          break;
        default:
        result = true;
        }
    }
    return result;
  }

  /* Retrieve the filter which match with the stack
  @stack: the stack use to filter the filterList
  @returns: the list of the filter which macth with stack (which have the stack)
  */
  getMatchedFilterList(stack){
    // check type of params
    if(!stack instanceof Array){
      return [];
    }
    var matchedFilterList = []
    this.filterList.forEach(function(filter){
      if(typeof filter.attachedStack !== 'undefined' &&
        filter.attachedStack !== null &&
        XMLFilter.samePlace(stack, filter.attachedStack)){
          // console.log('samePlace', XMLFilter.samePlace(stack, filter.stack))
          // console.log('stack', stack, 'filter.stack', filter.stack);
          matchedFilterList.push(filter)
        }
    })
    return matchedFilterList;
  }

  /* Check if the stacks are the same
  @returns: true if stack1 and stack2 are equals
            false otherwise
  */
  static samePlace(stack1, stack2){
    // check type of params
    if(!(stack1 instanceof Array && stack2 instanceof Array)){
      return false;
    }
    if(stack1.length !== stack2.length){
      return false
    }
    for(var i = 0, l = stack1.length; i < l; i++){
      // check if we have nested arrays
      if(stack1[i] instanceof Array && stack2[i] instanceof Array){
        if(! XMLFilter.samePlace(stack1[i], stack2[i])){
          return false
        }
      }else if(stack1[i] !== stack2[i]){
        return false
      }
    }
    return true;
  }

  /* Check if stack 1 is a children stack of stack2
  @returns: true if stack1 are a child stack of stack2
            false otherwise
  */
  static childStack(stack1, stack2){
    if(stack1.length <= stack2.length){
      return false;
    }
    var subStack1 = stack1.slice(0, stack2.length)
    if(!XMLFilter.samePlace(subStack1, stack2)){
      return false
    }
    return true
  }
}
