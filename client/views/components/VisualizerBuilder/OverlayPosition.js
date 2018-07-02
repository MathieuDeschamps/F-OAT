export class OverlayPositon{
  /* Constructor
  */
  constructor(xmlxsdObj, name){
    this.xmlxsdObj = xmlxsdObj;
    this.name = name
    this.stack = [];
    this.overlayData = [];
    this.currentTimeId = NaN;
  }

  /*initialize the attributs to default XMLXSDNodeValue
  */
  initialize(){
    this.stack = [];
    this.overlayData = [];
    this.currentTimeId = NaN;
  }

  setXmlXsdObj(xmlxsdObj){
    this.xmlxsdObj = xmlxsdObj;
  }

  getOverlayData(){
    this.initialize();
    this.xmlxsdObj.accept(this);
    return this.overlayData;
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
    var oldCurrentTimeId = this.currentTimeId;
    xmlxsdElt.eltsList.forEach(function(elt,i){
      that.stack.push({
        tag:xmlxsdElt.name,
        obj:elt,
        i:i
      });
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

    // code for the attribut timeId
    if(typeof obj.attrs.timeId !== 'undefined' &&
        (!isNaN(parseInt(obj.attrs.timeId.value)))){
      this.currentTimeId = parseInt(obj.attrs.timeId.value, 10);
    }

    // code for the attributs x and y
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
}
