export class TimeLineDlib{

  /* Constructor
  */
  constructor(xmlxsdObj, name){
    this.xmlxsdObj = xmlxsdObj;
    this.name = name
    this.stack = [];
    this.timeLineData = [];
    this.xmlFilter = undefined;
    this.id = 0;
    this.actorsNameMap = [];
  }

  initialize(){
    this.stack = [];
    this.timeLineData = [];
    this.actorsNameMap = [];
    this.id = 0;
  }

  setXMLXSDObj(xmlxsdObj){
    this.xmlxsdObj = xmlxsdObj;
  }

  setXMLFilter(xmlFilter){
    this.xmlFilter = xmlFilter;
  }
  /*
  @returns: timeLineData
  */
  getTimeLineData(){
    this.initialize();
    this.xmlxsdObj.accept(this)
    return this.timeLineData;
  }
  /* Visitor pattern : visit function
  @xmlxsdObj: XMLXSDObj object
  */
  visitXMLXSDObject(xmlxsdObj){
    this.stack.push({
      tag:this.name,
      obj:xmlxsdObj.content,
      i:0
    });
    this.xmlxsdObj.content.accept(this);
    this.stack.pop();
  }

  /* Visitor pattern : visit function
  @xmlxsdElt: XMLXSDElt object
  */
  visitXMLXSDElt(xmlxsdElt){
    var that = this;
    xmlxsdElt.eltsList.forEach(function(elt,i){
      that.stack.push({
        tag:xmlxsdElt.name,
        obj:elt,
        i:i
      });
      elt.accept(that);
      that.stack.pop();
    })
  }

  /* Visitor pattern : visit function
  @xmlxsdSeq: XMLXSDSequence object
  */
  visitXMLXSDSequence(xmlxsdSeq){
    var that = this;
    //console.log("visitseq",xmlxsdSeq);
    this.buildAttrs(xmlxsdSeq)
    xmlxsdSeq.seqList.forEach(function(seq, k){
      seq.forEach(function (xmlxsdElt, j){
        xmlxsdElt.eltsList.forEach(function(elt, i){
          that.stack.push({
            tag: xmlxsdElt.name,
            obj: xmlxsdElt.eltsList[i],
            i:i
          })
          elt.accept(that);
          that.stack.pop()
        })
      })
    })
  }

  /* Visitor pattern : visit function
  @xmlxsdExt: XMLXSDExtensionType object
  */
  visitXMLXSDExtensionType(xmlxsdExt){
    this.buildAttrs(xmlxsdExt);
  }

  /* Visitor pattern : visit function
  @xmlxsdNodeValue: XMLXSDNodeValue object
  */
  visitXMLXSDNodeValue(xmlxsdNodeValue){
  }

  /* Visitor pattern : visit function
  @xmlxsdAttr: XMLXSDAttr objects
  */
  visitXMLXSDAttr(xmlxsdAttr){
  }


  /* Retrieve the data at attributs level to visualize
  */
  buildAttrs(obj){
    var that = this
    var added = false;
    //  console.log("buildattrs",obj);
    // code for the attributs firstName lastName
    if(typeof obj.attrs.id !== 'undefined' &&
    typeof obj.attrs.firstName !== 'undefined' &&
    typeof obj.attrs.lastName !== 'undefined'){
      var id = obj.attrs.id.value;
      var firstName = '';
      if(obj.attrs.firstName.value != null){
        firstName = obj.attrs.firstName.value;
      }
      var lastName = '';
      if(obj.attrs.lastName.value != null){
        lastName = obj.attrs.lastName.value;
      }
      that.actorsNameMap.push({id : id, name : firstName+' '+lastName});
    }

    if(typeof obj.attrs.bottom !== 'undefined' &&
    typeof obj.attrs.top !== 'undefined' &&
    typeof obj.attrs.left !== 'undefined' &&
    typeof obj.attrs.right !== 'undefined' &&
    typeof obj.attrs.id !== 'undefined' &&
    (!isNaN(parseInt(this.stack[this.stack.length-2].obj.attrs.timeId.value)))){

      var timeId = this.stack[this.stack.length-2].obj.attrs.timeId.value;
      var name = this.getActorName(obj);
      // retrieve data for the timeLine
      this.timeLineData.forEach(function(element){
        if(!added && element.name === name &&
          that.samePlace(element.intervals[0].stack)){
          element.intervals.push({
            index: parseInt(element.intervals[0].index, 10),
            start: timeId,
            end: timeId,
            id: that.id,
            // clone the stack
            stack:that.stack.slice(0),
          })
          that.id++;
          added = true
        }
      })
      if(!added){
        this.timeLineData.push({
          name:name,
          intervals:[{
            index: parseInt(that.timeLineData.length, 10),
            start: timeId,
            end: timeId,
            id: that.id,
            // clone the stack
            stack: this.stack.slice(0),
          }]
        })
        that.id++;
      }
      added = false
    }
  }



  /*
  Use the actorsNameMap to get the name of the actor, and his id if name is not defined
  */
  getActorName(obj){
    var actor = this.actorsNameMap.find(actor => actor.id === obj.attrs.id.value);
    if(actor.name !== ' '){
      return actor.name;
    }

    return "actor "+obj.attrs.id.value;
  }

  /* Use to determine if the two XML node have the same parents
  @returns: true if this.stack and stack have the same tags
  false otherwise
  */
  samePlace(stack){
    var result = true;
    if(this.stack.length !== stack.length){
      result = false;
    }else{
      this.stack.forEach(function(element, i){
        if(element.tag !== stack[i].tag){
          result = false;
        }
      })
    }
    return result;
  }
}
