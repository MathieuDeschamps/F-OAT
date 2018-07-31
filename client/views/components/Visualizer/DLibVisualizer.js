import { TimeLine } from '../VisualizerTool/TimeLine.js'
import { TimeLineDlib } from '../VisualizerBuilder/TimeLineDlib.js'
import { Overlay } from '../VisualizerTool/Overlay.js';
import { OverlayDlib} from '../VisualizerBuilder/OverlayDlib.js'
import { XMLXSDForm } from '../VisualizerTool/XMLXSDForm.js'
import { XMLGenerator } from '../XMLGenerator/XMLGenerator.js'

export class DLibVisualizer{

  /* Constructor
  */
  constructor(xsdObj, xmlxsdObj,idExtractor, name, nbFrames, divIdForm, divIdTimeLine, divIdOverlay){
    this.xsdObj = xsdObj;
    this.xmlxsdObj = xmlxsdObj;
    this.idExtractor = idExtractor;
    this.name = name;
    this.nbFrames = nbFrames;
    this.divIdForm = divIdForm;
    this.observers = [];
    this.divIdTimeLine = divIdTimeLine;
    this.divIdOverlay = divIdOverlay;
    this.timeLineBuilder = undefined;
    this.overlayBuilder = undefined;
  }

  /* Obsever pattern : attach function
  @observer; Object
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
      observer.updateVisualizer();
    });
    if(!eventLiveUpdate){
      eventLiveUpdate = new EventDDP('liveUpdate',Meteor.connection);
    }

    eventLiveUpdate.setClient({
      appId: Router.current().params._id,
      _id: Meteor.userId()
    });
    var extractor = this.idExtractor.substring(0,this.idExtractor.indexOf('_'));
    var version = this.idExtractor.substring(this.idExtractor.indexOf('_')+1,this.idExtractor.length);
    version = version.replace('-','.');
    var xml = '<'+extractor+' name="'+this.name+'" version="'+version+'">';
    var generator = new XMLGenerator(this.xmlxsdObj);
    xml += generator.generateXML();
    xml += "</"+extractor+">";
    if(generator.getErrorMessage()===""){
      eventLiveUpdate.emit("liveUpdate",this.idExtractor,xml);
    }else{
      console.log("error",generator.getErrorMessage());
    }
  }

  /* Obsever pattern : update function
  */
  updateVideoControler(){
    this.notifyAll()
  }

  /* Visualize the XMLXSDObject
  */
  visualize(){
    // this.init()
    // this.xmlxsdObj.accept(this);

    var xmlxsdForm = new XMLXSDForm(this.xmlxsdObj,this.idExtractor,this.name,
    this.divIdForm, this);
    this.attach(xmlxsdForm)
    xmlxsdForm.generateForm();

    this.timeLineBuilder = new TimeLineDlib(this.xmlxsdObj, this.name);
    var timeLineData = this.timeLineBuilder.getTimeLineData();
    var timeLine = new TimeLine(this.name, this.nbFrames, this.xsdObj, timeLineData,
    this.divIdTimeLine, this);
    timeLine.setXMLXSDForm(xmlxsdForm);
    this.attach(timeLine);

    this.overlayBuilder = new OverlayDlib(this.xmlxsdObj, this.name)
    var overlayData = this.overlayBuilder.getOverlayData();
    var overlay = new Overlay(overlayData, this.divIdOverlay,this)
    overlay.setXMLXSDForm(xmlxsdForm);
    this.attach(overlay);

    console.log('timeLineData', timeLineData);
    console.log('overlayData', overlayData);

  }

  /*
  @returns: the list of the id
  */
  getIdsDiv(){
    var result = [];
    result.push(this.divIdForm)
    result.push(this.divIdTimeLine);
    result.push(this.divIdOverlay);
    return result;
  }

  getTimeLineData(){
    this.timeLineBuilder.setXMLXSDObj(this.xmlxsdObj);
    return this.timeLineBuilder.getTimeLineData();
  }

  getOverlayData(){
    this.overlayBuilder.setXMLXSDObj(this.xmlxsdObj);
    return this.overlayBuilder.getOverlayData();
  }

  getXMLXSDObj(){
    return this.xmlxsdObj;
  }

  setTimeLineBuilderXMLFilter(xmlFilter){
    this.timeLineBuilder.setXMLFilter(xmlFilter);
  }

  setXMLXSDObj(xmlxsdObj){
    this.xmlxsdObj = xmlxsdObj;
    // console.log("setXMLXSDObj",xmlxsdObj);
    this.observers.forEach(function(observer){
      observer.updateVisualizer();
    });
  }

  destroyEventDDP(){
    if(eventLiveUpdate!=null){
        eventLiveUpdate.setClient({
          appId: -1,
          _id: -1
        });
    }
  }

}
