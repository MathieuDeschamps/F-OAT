import { TimeLine } from '../class/TimeLine.js'
import { XMLXSDForm } from '../XMLXSDForm/XMLXSDForm.js'

export class ShotExtractVisualizer{

  /* Constructor
  */
  constructor(xmlxsdObj,idExtractor, name, divIdForm, divIdTimeLine){
    this.xmlxsdObj = xmlxsdObj;
    this.idExtractor = idExtractor;
    this.name = name
    this.divIdForm = divIdForm;
    this.divIdTimeLine = divIdTimeLine;
    this.observers = [];
    this.timeLineData = [];
    this.stack = [];
    this.minNumFrame = NaN
    this.maxNumFrame = NaN
  }

  init(){
    this.stack = [];
    this.timeLineData = [];
    this.minNumFrame = NaN;
    this.maxFrame = NaN;
  }

  /* Obsever pattern : attach function
  @observer : Object
  */
  attach(observer){
    if(!this.alreadyAttached(observer)){
      this.observers.push(observer);
    }
  }

  alreadyAttached(newObserver){
    result = false;
    this.observers.forEach(function(observer){
      if(observer.equals(newObserver)){
        result = true;
      }
    })
    return result;
  }
  /* Obsever pattern : dettach function
  @observer : Object
  */
  detach(observer){
    var index = this.observers.indexOf(observer);
    this.observers.splice(index);
  }

  /* Obsever pattern : notifyAll function
  */
  notifyAll(){
    this.observers.forEach(function(observer){
      observer.update();
    })
  }

  /* Obsever pattern : update function
  */
  update(){
    this.getDataTimeLine();
    this.notifyAll()
  }

  /* Visualize the XMLXSDObject
  */
  visualize(){
    this.init()
    this.xmlxsdObj.accept(this);

    var nbFrames = this.maxNumFrame - this.minNumFrame + 1
    if(isNaN(nbFrames)){
      nbFrames = 0
    }
    var timeLine = new TimeLine(this.name, nbFrames, this.timeLineData, this.divIdTimeLine);
    this.attach(timeLine);

    var xmlxsdForm = new XMLXSDForm(this.xmlxsdObj,this.idExtractor,this.name, this.divIdForm);
    this.attach(xmlxsdForm)
    xmlxsdForm.generateForm();
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
    this.stack.push({
      tag:xmlxsdElt.name,
      obj:xmlxsdElt
    })
    xmlxsdElt.eltsList.forEach(function(elt,i){
      elt.accept(that);
    })
    that.stack.pop()
  }

  /* Visitor pattern : visit function
  @xmlxsdSeq : XMLXSDSequence object
  */
  visitXMLXSDSequence(xmlxsdSeq){
    // console.log('visit Sequence visualizer :', xmlxsdSeq);
    var that = this;
    this.visualizeAttrs(xmlxsdSeq)
    xmlxsdSeq.seqList.forEach(function(seq){
      seq.forEach(function (xmlxsdElt){
        xmlxsdElt.accept(that)
      })
    })
  }

  /* Visitor pattern : visit function
  @xmlxsdExt : XMLXSDExtensionType object
  */
  visitXMLXSDExtensionType(xmlxsdExt){
    this.visualizeAttrs(xmlxsdExt)
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
  visualizeAttrs(obj){
    var that = this
    var added = false;

    // code for the attr startFrame and endFrame
    if(typeof obj.attrs.startFrame !== 'undefined' &&
      typeof obj.attrs.endFrame !== 'undefined' &&
      obj.attrs.startFrame.value <= obj.attrs.endFrame.value){
        // retrieve the max and min numFrame
        if(isNaN(this.minNumFrame)){
          this.minNumFrame = obj.attrs.startFrame.value;
        }else if(this.minNumFrame > obj.attrs.startFrame.value){
            this.minNumFrame = obj.attrs.startFrame.value;
        }
        if(isNaN(this.maxNumFrame)){
          this.maxNumFrame =  obj.attrs.endFrame.value;
        }else if(this.maxNumFrame < obj.attrs.endFrame.value){
            this.maxNumFrame = obj.attrs.endFrame.value;
        }

        // retrieve data for the timeLine
        this.timeLineData.forEach(function(element){
          if(that.samePlace(element.intervals[0].stack) && !added){
            element.intervals.push({
              index:element.intervals[0].index,
              start:obj.attrs.startFrame.value,
              end:obj.attrs.endFrame.value,
              obj:obj,
              // clone the stack
              stack:that.stack.slice(0),
            })
            added = true
          }
        })
        if(!added){
          this.timeLineData.push({
            name:this.stack[this.stack.length - 1].tag,
            intervals:[{
              index:that.timeLineData.length,
              start:obj.attrs.startFrame.value,
              end:obj.attrs.endFrame.value,
              obj:obj,
              // clone the stack
              stack:this.stack.slice(0),
            }]
          })
        }
        added = false
    }

    // code for the attr timeId
    if(typeof obj.attrs.timeId !== 'undefined'){
      // retrieve the max and min numFrame
      if(isNaN(this.minNumFrame)){
        this.minNumFrame = obj.attrs.timeId.value;
      }else if(this.minNumFrame > obj.attrs.timeId.value){
        this.minNumFrame = obj.attrs.timeId.value;
      }
      if(isNaN(this.maxNumFrame)){
        this.maxNumFrame = obj.attrs.timeId.value;

      }else if(this.maxNumFrame < obj.attrs.timeId.value){
        this.maxNumFrame = obj.attrs.timeId.value;
      }

      // retrieve data for the timeLine
      this.timeLineData.forEach(function(element){
        if(that.samePlace(element.intervals[0].stack) && !added){
          element.intervals.push({
            index:element.intervals[0].index,
            start:obj.attrs.timeId.value,
            end:obj.attrs.timeId.value,
            obj:obj,
            // clone the stack
            stack:that.stack.slice(0),
          })
          added = true
        }
      })
      if(!added){
        this.timeLineData.push({
          name:this.stack[this.stack.length - 1].tag,
          intervals:[{
            index:that.timeLineData.length,
            start:obj.attrs.timeId.value,
            end:obj.attrs.timeId.value,
            obj:obj,
            // clone the stack
            stack:this.stack.slice(0),
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

  /*
  @returns the list of the id
  */
  getIdsDiv(){
    var result = [];
    result.push(this.divIdForm)
    result.push(this.divIdTimeLine);

    return result;
  }
}
