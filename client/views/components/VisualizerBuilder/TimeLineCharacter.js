export class TimeLineCharacter{

  /* Constructor
  */
  constructor(xmlxsdObj, name){
    this.xmlxsdObj = xmlxsdObj;
    this.name = name
    this.stack = [];
    this.timeLineData = [];
    this.currentCharacter = undefined;
  }

  initialize(){
    this.stack = [];
    this.timeLineData = [];
    this.isCharacter = false;
    this.currentCharacter = undefined;
  }

  setXmlXsdObj(xmlxsdObj){
    this.xmlxsdObj = xmlxsdObj;
  }

  /*
  @returns timeLineData
  */
  getTimeLineData(){
    this.initialize();
    this.xmlxsdObj.accept(this)
    return this.timeLineData;
  }
  /* Visitor pattern : visit function
  @xmlxsdObj : XMLXSDObj object
  */
  visitXMLXSDObject(xmlxsdObj){
    // console.log('visit obj visualizer',xmlxsdObj);
    this.stack.push({
      tag:this.name,
      obj:xmlxsdObj.content,
      i:0
    });
    this.xmlxsdObj.content.accept(this);
  }

  /* Visitor pattern : visit function
  @xmlxsdElt : XMLXSDElt object
  */
  visitXMLXSDElt(xmlxsdElt){
    // console.log('visit Element visualizer :', xmlxsdElt);
    var that = this;
    var oldCurrentCharacter = this.currentCharacter;
    xmlxsdElt.eltsList.forEach(function(elt,i){
      that.stack.push({
        tag:xmlxsdElt.name,
        obj:elt,
        i:i
      });
      elt.accept(that);
    })
    this.currentCharacter = oldCurrentCharacter;
  }

  /* Visitor pattern : visit function
  @xmlxsdSeq : XMLXSDSequence object
  */
  visitXMLXSDSequence(xmlxsdSeq){
    // console.log('visit Sequence visualizer :', xmlxsdSeq);
    var that = this;
    this.buildAttrs(xmlxsdSeq)
    xmlxsdSeq.seqList.forEach(function(seq, k){
      // console.log('visit seq visualizer :', seq);
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
  @xmlxsdExt : XMLXSDExtensionType object
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

      // code for the attributs firstName lastName
      if(typeof obj.attrs.firstName !== 'undefined' &&
        typeof obj.attrs.lastName !== 'undefined'){
          var firstName = obj.attrs.firstName.value;
          var lastName = obj.attrs.lastName.value;
          this.currentCharacter = firstName + " " + lastName;
        }

      // code for the attributs startFrame and endFrame
      if(typeof obj.attrs.startFrame !== 'undefined' &&
        typeof obj.attrs.endFrame !== 'undefined' &&
        parseInt(obj.attrs.startFrame.value, 10) <= parseInt(obj.attrs.endFrame.value, 10)){
          // retrieve data for the timeLine
          this.timeLineData.forEach(function(element){
            if(!added && element.name === that.currentCharacter &&
              that.samePlace(element.intervals[0].stack)){
              element.intervals.push({
                index: parseInt(element.intervals[0].index, 10),
                start: obj.attrs.startFrame.value,
                end: obj.attrs.endFrame.value,
                // clone the stack
                stack: that.stack.slice(0),
              })
              added = true
            }
          })
          if(!added){
            this.timeLineData.push({
              name:this.currentCharacter,
              intervals:[{
                index: parseInt(that.timeLineData.length, 10),
                start: obj.attrs.startFrame.value,
                end: obj.attrs.endFrame.value,
                // clone the stack
                stack: this.stack.slice(0),
              }]
            })
          }
          added = false
      }
    }

  /* Use to determine if the two XML node have the same parents
  @return true if this.stack and stack have the same tags
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
