export class TimeLineCharacter{

  /* Constructor
  */
  constructor(xmlxsdObj, name){
    this.xmlxsdObj = xmlxsdObj;
    this.name = name
    this.stack = [];
    this.timeLineData = [];
    this.currentCharacter = undefined;
    this.minNumFrame = NaN;
    this.maxNumFrame = NaN;
  }

  initialize(){
    this.stack = [];
    this.timeLineData = [];
    this.isCharacter = false;
    this.currentCharacter = undefined;
    this.minNumFrame = NaN;
    this.maxFrame = NaN;
  }

  /*
  @returns timeLineData
  */
  getTimeLineData(){
    this.initialize();
    this.xmlxsdObj.accept(this)
    return this.timeLineData;
  }

  getNbFrames(){
    this.initialize();
    this.xmlxsdObj.accept(this);
    var nbFrames = this.maxNumFrame - this.minNumFrame + 1
    if(isNaN(nbFrames)){
      nbFrames = 0
    }
    return nbFrames;
  }
  /* Visitor pattern : visit function
  @xmlxsdObj : XMLXSDObj object
  */
  visitXMLXSDObject(xmlxsdObj){
    // console.log('visit obj visualizer',xmlxsdObj);
    this.stack.push({
      tag:this.name,
      obj:xmlxsdObj.content
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
        obj:elt
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
            obj: xmlxsdElt.eltsList[i]
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
          // retrieve the max and min numFrame
          if(isNaN(this.minNumFrame)){
            this.minNumFrame = parseInt(obj.attrs.startFrame.value, 10);
          }else if(this.minNumFrame > obj.attrs.startFrame.value){
              this.minNumFrame = parseInt(obj.attrs.startFrame.value, 10);
          }
          if(isNaN(this.maxNumFrame)){
            this.maxNumFrame =  parseInt(obj.attrs.endFrame.value, 10);
          }else if(this.maxNumFrame < obj.attrs.endFrame.value){
              this.maxNumFrame = parseInt(obj.attrs.endFrame.value, 10);
          }

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

      // code for the attribut timeId
      if(typeof obj.attrs.timeId !== 'undefined' &&
          (!isNaN(parseInt(obj.attrs.timeId.value)))){
        // retrieve the max and min numFrame
        if(isNaN(this.minNumFrame)){
          this.minNumFrame = parseInt(obj.attrs.timeId.value, 10);
        }else if(this.minNumFrame > obj.attrs.timeId.value){
          this.minNumFrame = parseInt(obj.attrs.timeId.value, 10);
        }
        if(isNaN(this.maxNumFrame)){
          this.maxNumFrame = parseInt(obj.attrs.timeId.value, 10);

        }else if(this.maxNumFrame < obj.attrs.timeId.value, 10){
          this.maxNumFrame = parseInt(obj.attrs.timeId.value, 10);
        }
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
