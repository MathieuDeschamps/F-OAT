import { TimeLine } from '../class/TimeLine.js'
import {Overlay} from '../class/Overlay.js';
import { XMLXSDForm } from '../XMLXSDForm/XMLXSDForm.js'

export class ShotExtractVisualizer{

  /* Constructor
  */
  constructor(xmlxsdObj,idExtractor, name, divIdForm, divIdTimeLine, divIdOverlay){
    this.xmlxsdObj = xmlxsdObj;
    this.idExtractor = idExtractor;
    this.name = name
    this.divIdForm = divIdForm;
    this.divIdTimeLine = divIdTimeLine;
    this.divIdOverlay = divIdOverlay;
    this.observers = [];
    this.timeLineData = [];
    this.overlayData = [];
    this.stack = [];
    this.currentTimeId = NaN;
    this.minNumFrame = NaN;
    this.maxNumFrame = NaN;
  }

  init(){
    this.stack = [];
    this.timeLineData = [];
    this.overlayData = [];
    this.currentTimeId = NaN;
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

    var xmlxsdForm = new XMLXSDForm(this.xmlxsdObj,this.idExtractor,this.name, this.divIdForm);
    this.attach(xmlxsdForm)
    xmlxsdForm.generateForm();

    var nbFrames = this.maxNumFrame - this.minNumFrame + 1
    if(isNaN(nbFrames)){
      nbFrames = 0
    }

    var timeLine = new TimeLine(this.name, xmlxsdForm, nbFrames, this.timeLineData, this.divIdTimeLine);
    this.attach(timeLine);

    var overlay = new Overlay(this.overlayData, xmlxsdForm, this.divIdOverlay)
    this.attach(overlay);
    vidCtrl.attach(overlay,1);
    console.log('timeLineData', this.timeLineData);
    console.log('overlayData', this.overlayData);

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
    var oldCurrentTimeId = this.currentTimeId;
    xmlxsdElt.eltsList.forEach(function(elt,i){
      elt.accept(that);
    })
    this.currentTimeId = oldCurrentTimeId;
  }

  /* Visitor pattern : visit function
  @xmlxsdSeq : XMLXSDSequence object
  */
  visitXMLXSDSequence(xmlxsdSeq){
    // console.log('visit Sequence visualizer :', xmlxsdSeq);
    var that = this;
    this.visualizeAttrs(xmlxsdSeq)
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
    this.visualizeAttrs(xmlxsdExt);
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
          if(!added && that.samePlace(element.intervals[0].stack)){
            element.intervals.push({
              index: parseInt(element.intervals[0].index, 10),
              start: obj.attrs.startFrame.value,
              end: obj.attrs.endFrame.value,
              obj: obj,
              // clone the stack
              stack: that.stack.slice(0),
            })
            added = true
          }
        })
        if(!added){
          this.timeLineData.push({
            name:this.stack[this.stack.length - 1].tag,
            intervals:[{
              index: parseInt(that.timeLineData.length, 10),
              start: obj.attrs.startFrame.value,
              end: obj.attrs.endFrame.value,
              obj: obj,
              // clone the stack
              stack: this.stack.slice(0),
            }]
          })
        }
        added = false
    }

    // code for the attr timeId
    if(typeof obj.attrs.timeId !== 'undefined' &&
      obj.attrs.timeId.value !== undefined){
      this.currentTimeId = parseInt(obj.attrs.timeId.value, 10);
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

      // retrieve data for the timeLine
      this.timeLineData.forEach(function(element){
        if(!added && that.samePlace(element.intervals[0].stack)){
          element.intervals.push({
            index: parseInt(element.intervals[0].index, 10),
            start: obj.attrs.timeId.value,
            end: obj.attrs.timeId.value,
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
            index: parseInt(that.timeLineData.length, 10),
            start: obj.attrs.timeId.value,
            end: obj.attrs.timeId.value,
            obj: obj,
            // clone the stack
            stack: this.stack.slice(0),
          }]
        })
      }
      added = false
    }

    // code for x and y attribute
    if((!isNaN(this.currentTimeId)) &&
      typeof obj.attrs.x !== 'undefined' &&
      typeof obj.attrs.y !== 'undefined' &&
      parseFloat(obj.attrs.x.value) <= 1 &&
      parseFloat(obj.attrs.y.value) <= 1
      ){
        this.overlayData.forEach(function(element){
          if(!added && element.timeId === that.currentTimeId){
            element.positions.push({
              x: parseFloat(obj.attrs.x.value),
              y: parseFloat(obj.attrs.y.value),
              obj: obj,
              // clone the stack
              stack:that.stack.slice(0),
            })
            added = true;
          }
        })
        if(!added){
          this.overlayData.push({
            timeId: parseInt(this.currentTimeId, 10),
            positions: [{
              x: parseFloat(obj.attrs.x.value),
              y: parseFloat(obj.attrs.y.value),
              obj: obj,
              // clone the stack
              stack: this.stack.slice(0),
            }]
          })
        }
        added = false;
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
    result.push(this.divIdOverlay);
    return result;
  }
}
