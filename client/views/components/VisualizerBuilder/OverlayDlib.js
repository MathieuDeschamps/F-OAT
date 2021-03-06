export class OverlayDlib{
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

  setXMLXSDObj(xmlxsdObj){
    this.xmlxsdObj = xmlxsdObj;
  }

  getOverlayData(){
    this.initialize();
    this.xmlxsdObj.accept(this);
    return this.overlayData;
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
    var that = this;
    var oldCurrentTimeId = this.currentTimeId;
    xmlxsdElt.eltsList.forEach(function(elt,i){
      that.stack.push({
        tag:xmlxsdElt.name,
        obj:elt,
        i:i
      });
      elt.accept(that);
      that.stack.pop();
    })
    this.currentTimeId = oldCurrentTimeId;
  }

  /* Visitor pattern : visit function
  @xmlxsdSeq: XMLXSDSequence object
  */
  visitXMLXSDSequence(xmlxsdSeq){
    var that = this;
    this.buildAttrs(xmlxsdSeq)
    xmlxsdSeq.seqList.forEach(function(seq, k){
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

    // code for the attribut timeId
    if(typeof obj.attrs.timeId !== 'undefined' &&
        (!isNaN(parseInt(obj.attrs.timeId.value)))){
      this.currentTimeId = parseInt(obj.attrs.timeId.value, 10);
    }

    // code for the attributs x and y
    if((!isNaN(this.currentTimeId)) &&
      typeof obj.attrs.top !== 'undefined' &&
      typeof obj.attrs.right!== 'undefined' &&
      parseFloat(obj.attrs.top.value) <= 1 &&
      parseFloat(obj.attrs.right.value) <= 1 &&
      typeof obj.attrs.bottom !== 'undefined' &&
      typeof obj.attrs.left!== 'undefined' &&
      parseFloat(obj.attrs.bottom.value) <= 1 &&
      parseFloat(obj.attrs.left.value) <= 1
      ){
        this.overlayData.forEach(function(element){
          if(!added && element.timeId === that.currentTimeId){
            element.positions.push({
              top: parseFloat(obj.attrs.top.value),
              right: parseFloat(obj.attrs.right.value),
              bottom: parseFloat(obj.attrs.bottom.value),
              left: parseFloat(obj.attrs.left.value),
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
              top: parseFloat(obj.attrs.top.value),
              right: parseFloat(obj.attrs.right.value),
              bottom: parseFloat(obj.attrs.bottom.value),
              left: parseFloat(obj.attrs.left.value),
              // clone the stack
              stack: this.stack.slice(0),
            }]
          })
        }
        added = false;
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
