import { XMLFilter } from '../XMLFilter/XMLFilter.js'
export class TimeLineShot{

  /* Constructor
  */
  constructor(xmlxsdObj, name){
    this.xmlxsdObj = xmlxsdObj;
    this.name = name
    this.stack = [];
    this.timeLineData = [];
    this.xmlFilter = undefined;
    this.count = 0
    this.isDisplayed = true;
  }

  initialize(){
    this.count= 0;
    this.stack = [];
    this.timeLineData = [];
    this.isDisplayed = true;
  }

  /*
  @returns: timeLineData
  */
  getTimeLineData(){
    this.initialize();
    this.xmlxsdObj.accept(this)
    return this.timeLineData;
  }

  setXMLXSDObj(xmlxsdObj){
    this.xmlxsdObj = xmlxsdObj;
  }

  setXMLFilter(xmlFilter){
    if(xmlFilter instanceof XMLFilter){
      this.xmlFilter = xmlFilter;
    }
  }

  /* Visitor pattern : visit function
  @xmlxsdObj: XMLXSDObj object
  */
  visitXMLXSDObject(xmlxsdObj){
    // console.log('visit obj visualizer',xmlxsdObj);
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
    // console.log('visit Element visualizer :', xmlxsdElt);
    var that = this;
    xmlxsdElt.eltsList.forEach(function(elt,i){
      that.stack.push({
        tag:xmlxsdElt.name,
        obj:elt,
        i:i
      })
      var oldIsDiplayed = that.isDisplayed;
      if(oldIsDiplayed &&
        that.xmlFilter instanceof XMLFilter &&
        that.xmlFilter.getIsActive()){
        that.isDisplayed = that.xmlFilter.matchFilter(elt, that.stack.slice(0))
      }
      elt.accept(that);
      that.isDisplayed = oldIsDiplayed;
      that.stack.pop();
    })
  }

  /* Visitor pattern : visit function
  @xmlxsdSeq: XMLXSDSequence object
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
          });
          var oldIsDiplayed = that.isDisplayed;
          if(oldIsDiplayed &&
            that.xmlFilter instanceof XMLFilter &&
            that.xmlFilter.getIsActive()){
              that.isDisplayed = that.xmlFilter.matchFilter(elt, that.stack.slice(0))
          }
          elt.accept(that);
          that.isDisplayed = oldIsDiplayed;
          that.stack.pop();
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

      // code for the attributs startFrame and endFrame
      if(typeof obj.attrs.startFrame !== 'undefined' &&
        typeof obj.attrs.endFrame !== 'undefined' &&
        parseInt(obj.attrs.startFrame.value, 10) <= parseInt(obj.attrs.endFrame.value, 10)){

          // retrieve data for the timeLine
          this.timeLineData.forEach(function(element){
            if(!added && that.samePlace(element.intervals[0].stack)){
              element.intervals.push({
                index: parseInt(element.intervals[0].index, 10),
                start: obj.attrs.startFrame.value,
                end: obj.attrs.endFrame.value,
                id: that.count,
                isDisplayed : that.isDisplayed,
                // clone the stack
                stack: that.stack.slice(0),
              })
              that.count++;
              added = true
            }
          })
          if(!added){
            this.timeLineData.push({
              name:this.stack[this.stack.length - 1].tag,
              intervals:[{
                end: obj.attrs.endFrame.value,
                start: obj.attrs.startFrame.value,
                id: that.count,
                index: parseInt(that.timeLineData.length, 10),
                isDisplayed : that.isDisplayed,
                // clone the stack
                stack: this.stack.slice(0),
              }]
            })
            this.count++;
          }
          added = false
      }

      // code for the attribut timeId
      if(typeof obj.attrs.timeId !== 'undefined' &&
          (!isNaN(parseInt(obj.attrs.timeId.value)))){

        // retrieve data for the timeLine
        this.timeLineData.forEach(function(element){
          if(!added && that.samePlace(element.intervals[0].stack)){
            element.intervals.push({
              index: parseInt(element.intervals[0].index, 10),
              start: obj.attrs.timeId.value,
              end: obj.attrs.timeId.value,
              id: that.count,
              isDisplayed : that.isDisplayed,
              // clone the stack
              stack:that.stack.slice(0),
            })
            that.count++;
            added = true
          }
        })
        if(!added){
          this.timeLineData.push({
            name:this.stack[this.stack.length - 1].tag,
            intervals:[{
              index: parseInt(that.timeLineData.length, 10),
              start: obj.attrs.timeId.value,
              end: obj.attrs.timeId.value,
              id:that.count,
              isDisplayed : that.isDisplayed,
              // clone the stack
              stack: this.stack.slice(0)
            }]
          })
          this.count++;
        }
        added = false
      }
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
