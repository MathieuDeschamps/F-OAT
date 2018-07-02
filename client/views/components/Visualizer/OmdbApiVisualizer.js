import { OmdbApiForm } from '../XMLXSDForm/OmdbApiForm.js'
import { XMLGenerator } from '../XMLGenerator/XMLGenerator.js'

export class OmdbApiVisualizer{


    /* Constructor
    */
  constructor(xmlxsdObj, idExtractor, name, divIdForm){
    this.xmlxsdObj = xmlxsdObj;
    this.idExtractor = idExtractor;
    this.name = name;
    this.divIdForm = divIdForm;
    this.observers = [];
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
    eventLiveUpdate.emit("liveUpdate",this.idExtractor,xml);
  }

  /* Visualize the XMLXSDObject
  */
  visualize(){
    var omdbForm = new OmdbApiForm(this.xmlxsdObj,this.idExtractor,this.name,this.divIdForm,this);
    this.attach(omdbForm);
    omdbForm.generateForm();
  }

  /*
  @returns the list of the id
  */
  getIdsDiv(){
    var result = []
    result.push(this.divIdForm)
    return result
  }

  getXmlXsdObj(){
    return this.xmlxsdObj;
  }

  setXmlXsdObj(xmlxsdObj){
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
