import { XMLXSDForm } from '../XMLXSDForm/XMLXSDForm.js'

export class DefaultVisualizer{


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
    })
  }

  /* Obsever pattern : update function
  */
  updateVisualizer(){
    this.notifyAll()
  }

  /* Visualize the XMLXSDObject
  */
  visualize(){
    var xmlxsdForm = new XMLXSDForm(this.xmlxsdObj,this.idExtractor,this.name, this.divIdForm, this);
    this.attach(xmlxsdForm)
    xmlxsdForm.generateForm();

    // console.log('observers', this.observers)
  }

  /*
  @returns the list of the id
  */
  getIdsDiv(){
    var result = []
    result.push(this.divIdForm)
    return result
  }
}
