import { TimeLine } from '../class/TimeLine.js'
import { TimeLineShot } from '../VisualizerBuilder/TimeLineShot.js'
import { Overlay } from '../class/Overlay.js';
import { OverlayPosition} from '../VisualizerBuilder/OverlayPosition.js'
import { XMLSelector } from '../XMLFilter/XMLSelector.js'
import { XMLXSDForm } from '../XMLXSDForm/XMLXSDForm.js'
import { XMLGenerator } from '../XMLGenerator/XMLGenerator.js'

export class ShotExtractVisualizer{

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

  /* Visualize the XMLXSDObject
  */
  visualize(){
    var xmlxsdForm = new XMLXSDForm(this.xmlxsdObj,this.idExtractor,this.name,
    this.divIdForm, this);
    this.attach(xmlxsdForm)
    xmlxsdForm.generateForm();

    this.timeLineBuilder = new TimeLineShot(this.xmlxsdObj, this.name);
    var timeLineData = this.timeLineBuilder.getTimeLineData();
    var timeLine = new TimeLine(this.name, this.nbFrames, this.xsdObj, timeLineData,
    this.divIdTimeLine,this);
    timeLine.setXMLXSDForm(xmlxsdForm);
    this.attach(timeLine);

    this.overlayBuilder = new OverlayPosition(this.xmlxsdObj, this.name)
    var overlayData = this.overlayBuilder.getOverlayData();
    var overlay = new Overlay(overlayData, this.divIdOverlay,this)
    overlay.setXMLXSDForm(xmlxsdForm);
    this.attach(overlay);

    // console.log('timeLineData', timeLineData);
    // console.log('overlayData', overlayData);

  }

  /*
  @returns: the list of the id
  */
  getIdsDiv(){
    var result = [];
    result.push(this.divIdForm)
    result.push(this.divIdTimeLine);
    result.push(this.divIdFilter);
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
