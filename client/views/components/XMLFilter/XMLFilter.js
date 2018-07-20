
export class XMLFilter{

  /* Constructor
  @xsdObj: XMLXSDObject
  @nameExtractor: name of the extractor
  */
  constructor(xmlSelector, nameExtractor){
    this.nameExtractor = nameExtractor;
    this.filterList = [];
    this.stack = [];
    this.observers = [];
    this.isActive = false;
  }

  getFilter(key){
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

  setStack(key, stack){
    if(typeof key !== 'undefined' && key !== null){
      var oldLength = this.filterList.length
      if(typeof this.filterList[key] === 'undefined'){
        this.filterList[key] = {}
        if(oldLength === this.filterList.length && key > oldLength){
          this.filterList.length = key + 1;
        }
      }
      if(typeof name === 'undefined' || name === null || !Array.isArray(stack)){
        this.filterList[key].stack = [];
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
        this.filterList[key].stack = parsedStack;
        if(this.isActive){
          this.notifyAll();
        }
      }
    }
  }

  setAttrOp(key, attrName, op){
    var filter = this.getFilter(key)

    if(typeof filter === 'undefined'){
      this.setStack(key, []);
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
    var filter = this.getFilter(key)

    if(typeof filter === 'undefined'){
      this.setStack(key, []);
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
  */
  deleteFilter(key){
    var filter = this.getFilter(key)
    if(typeof filter !== 'undefined'){
      delete this.filterList[key];
      if(this.isActive){
        this.notifyAll();
      }
    }
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
    result = false;
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

  /* Match XMLXSDElement and filterList
  @xmlxsdElment: the XMLXSDElement to match
  @stack: of the XMLXSDElement
  @returns: true if the XMLXSDElement matchs the filterList
          false otherwise
  */
  matchFilter(xmlxsdElement, stack){
    var result = true;
    var parsedStack = []
    for(var i = 0, l = stack.length; i < l; i++){
      parsedStack.push(String(stack[i].tag))
    }
    var matchedFilterList = this.getMatchedFilterList(parsedStack);

    matchedFilterList.forEach(function(filter){
      $.each(filter.attrs, function(key, filterAttr){

        if(typeof xmlxsdElement.attrs[key] !== 'undefined' &&
          xmlxsdElement.attrs[key] !== null &&
          typeof xmlxsdElement.attrs[key].value !== 'undefined' &&
          typeof xmlxsdElement.attrs[key].value !== null &&
          result ){
            var currentAttrValue = xmlxsdElement.attrs[key].value;

            if(filterAttr.value instanceof Array){
              for(var i = 0, l = filterAttr.value; i < l; i++){
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
          }

      })
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
    var result = true;
    if(!(filterAttrOp === '=' && filterAttrValue === '')){
      switch (filterAttrOp) {
        case '=':
          if(value !== filterAttrValue){
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
    var matchedFilterList = []
    this.filterList.forEach(function(filter){
      if(typeof filter.stack !== 'undefined' &&
        filter.stack !== null &&
        XMLFilter.samePlace(stack, filter.stack)){
          // console.log('samePlace', XMLFilter.samePlace(stack, filter.stack))
          // console.log('stack', stack, 'filter.stack', filter.stack);
          matchedFilterList.push(filter)
        }
    })
    return matchedFilterList;
  }

  /* Check if the stacks are the same
  @returns: true if stack1 and stack2 are equals
  */
  static samePlace(stack1, stack2){
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
}
