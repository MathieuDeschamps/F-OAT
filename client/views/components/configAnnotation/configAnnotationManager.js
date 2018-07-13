import { Parser } from '../class/Parser.js'
import { Projects } from '../../../../lib/collections/projects.js';
import { VisualizerFactory } from '../Visualizer/VisualizerFactory.js'
import { XSDObject } from '../XSDParser/XSDObject.js';
import { XMLXSDObj } from '../XMLXSDParser/XMLXSDObj.js';
import { XMLXSDForm } from '../XMLXSDForm/XMLXSDForm.js';
import { XMLGenerator } from '../XMLGenerator/XMLGenerator.js';
import { Writer } from '../class/Writer.js'

export class configAnnotationManager{

  /* Constructor
  @xml : xml of the project with the annotations and the header parsed
  @xsds : array which contains the XSD files parsed
  @xmls: array which contains the XML of the extractors parsed
  @checkBoxDiv: id of the div of the checkBox
  @visualizerDivs: array which contains the id of div of the visualizer
  @saveButtonDiv
  */
  constructor(xsds, xmls, nbFrames, checkBoxDiv, visualizerDivs, saveButtonDiv){
    this.xsds = xsds.slice(0);
    this.xmls = xmls.slice(0);
    this.nbFrames = nbFrames;
    this.checkBoxDiv = checkBoxDiv;
    this.visualizerDivs = visualizerDivs;
    this.saveButtonDiv = saveButtonDiv;
    this.visualizers = [];

    var that = this;
    var JQcheckBoxDiv='#'+checkBoxDiv;
    this.xsds.forEach(function(xsd, i){
      var labelConfig = "annotation_" + i
      var JQlabelConfig='#'+labelConfig;
      var extractorCheckBox = '<p><input class="filled-in" id="'+ labelConfig + '" type="checkbox"/>'
      extractorCheckBox += '<label for="'+ labelConfig + '">' + $(xmls[i]).attr('name') + '</label></p>'
      $(JQcheckBoxDiv).append(extractorCheckBox);

      var xsdObj = new XSDObject(xsd);
      var xmlxsdObj = new XMLXSDObj(xmls[i], xsdObj);

      // console.log('this.visualizerDivs', that.visualizerDivs);
      var visualizerFactory = new VisualizerFactory(xsdObj, xmlxsdObj, that.nbFrames, that.visualizerDivs )
      var extractor = xmls[i].clone().empty()
      var visualizer = visualizerFactory.getVisualizer(extractor)
      visualizer.visualize()
      that.visualizers.push(visualizer);
      var divIds = []
      visualizer.getIdsDiv().forEach(function(idDiv){
        divIds.push(idDiv)
      })
      $(JQlabelConfig).change(function(){that.checkBoxChange( JQlabelConfig, divIds)})

      $( window ).resize(function() {
        setTimeout(function(){
          $('#overlay').find("svg").css({
            'width': $('#videoContainer').width() + 'px',
            'height': $('#videoContainer').height() + 'px'
          });
          that.visualizers.forEach(function(visualizer){
            visualizer.notifyAll();
          });
        },20);
      });
    })
    var JQSaveButtonDiv = '#'+saveButtonDiv;
    $(JQSaveButtonDiv).click(function(){that.saveAnnotations()})
  }

  /* Event trigger when the checkBox change
  @JQlabelConfig: the label of the check which trigger the event
  @idsDiv: array which contains the id of div of the visualizer
  */
  checkBoxChange(JQlabelConfig,idsDiv){
      var that=this;
      if ($(JQlabelConfig).prop('checked')){
        idsDiv.forEach(function(idDiv){
          var JQidDiv = '#' + idDiv;
          $(JQidDiv).css('display', 'block');
        })
      }else{
        idsDiv.forEach(function(idDiv){
          var JQidDiv = '#' + idDiv;
          $(JQidDiv).css('display', 'none');

        })
        // Timeline lost the focus of the vidCtrl when it is hidden
        if(typeof vidCtrl.focusedTimeLine !== 'undefined'){
          var idTimeline = vidCtrl.focusedTimeLine.div_id;
          if(idsDiv.indexOf(idTimeline) !== -1){
            vidCtrl.focusedTimeLine.lostFocus();
            vidCtrl.isFocusedTimeLine = false;
            vidCtrl.setPlayingInterval(1, that.nbFrames);
            vidCtrl.setPartialPlaying(false);
          }
        }
      }
  }

  /*Event trigger when click on the save button
  */
  saveAnnotations(){
    if(!configAnnotationManager.hasRightToWrite()){
       toastr.warning(TAPi18n.__('errorProjectRight'));
    }else{
      var errorMessages = [];
      var that = this;
      var xmlDoc = $.parseXML(Session.get('xml'))
      var correct = true;
      this.visualizers.forEach(function(visualizer, i){
        var xmlGenerator = new XMLGenerator(visualizer.xmlxsdObj)
        var xmlAnnotation = xmlGenerator.generateXML()
        if(xmlGenerator.getErrorMessage() === ""){
          var extractor = that.xmls[i].clone().empty();
          xmlDoc = Writer.replaceAnnotation(xmlDoc, extractor, xmlAnnotation)
        }else{
          errorMessages.push(visualizer.name +": " + xmlGenerator.getErrorMessage());
          correct = false
        }
      })
      if(correct){
        var xml = Writer.convertDocumentToString(xmlDoc, 0)
        var project=Projects.findOne(Router.current().params._id)

        Meteor.call("updateXML",project,xml,(err,result)=>{
          if(err){
            alert(err.reason);
          }else{
            toastr.success(TAPi18n.__('save'));
            // VideoControler update
            vidCtrl.setAnnotedFrames(Parser.getListTimeId(xml));
          }
        })
      }else{
        toastr.warning(TAPi18n.__('errorSaveProject'));
        errorMessages.forEach(function(errorMessage){
          toastr.warning(errorMessage)
        })
      }
    }
  }

  /* function called when a new extraction is done to refresh the annotation manager with a new annotation
  @idExtractor : xml of the extraction with the annotations parsed
  @xsd : XSD file of the extractor parsed
  */
  addAnnotation(idExtractor,version){
    var idProject = Router.current().params._id;
    var xmlPath = '/tmp/' + idProject + '/annotation.xml';
    Meteor.call("getXml",xmlPath,(xmlErr,result)=>{
      if(xmlErr){
        alert(xmlErr.reason);
      }else{
        var xmlDoc = result.data;
        var xmlParsed = $.parseXML(result.data)
        var xmlExtractor = $(xmlParsed).find('extractors').children().each(function(i,elem){
          if ($(elem).prop('tagName') === idExtractor &&
             $(elem).attr('version') === version){
               return elem;
          }
        });
        var exists = false;
        $(this.xmls).each(function(i,elemxml){
          var header = $(elemxml).clone().empty();
          if($(header).prop('tagName') == $(xmlExtractor).prop('tagName')){
            if($(header).attr('version') == $(xmlExtractor).attr('version')){
              exists = true;
            }
          }
        });
          //Recuperer uniquement le xml du nouvel extracteur
        extractorPath  = '/tmp/'+ idExtractor + '/' + version + '/descriptor.xsd';
        Meteor.call("getXml", extractorPath, (xsdErr,resultExtractor)=>{
          if(xsdErr){
            toastr.warning(xsdErr.reason);
          }else{
            var xsd = $.parseXML(resultExtractor.data);
            //getxml du xsd et l'envoyer au configAnnotationManager
            if(!exists){

              this.xsds.push(xsd);
              this.xmls.push(xmlExtractor);
              var JQcheckBoxDiv='#'+this.checkBoxDiv;

              var labelConfig = "annotation_" + (this.xsds.length-1)
              var JQlabelConfig='#'+labelConfig;
              var extractorCheckBox = '<p><input class="filled-in" id="'+ labelConfig + '" type="checkbox"/>'
              extractorCheckBox += '<label for="'+ labelConfig + '">' + $(xmlExtractor).attr('name') + '</label></p>'
              $(JQcheckBoxDiv).append(extractorCheckBox);

              var xsdObj = new XSDObject(xsd);
              var xmlxsdObj = new XMLXSDObj(xmlExtractor, xsdObj);
              var visualizerFactory = new VisualizerFactory(xmlxsdObj, this.nbFrames, this.visualizerDivs )
              var extractor = xmlExtractor.clone().empty()
              var visualizer = visualizerFactory.getVisualizer(extractor)
              visualizer.visualize()
              this.visualizers.push(visualizer);
              var that = this;
              var divIds = []
              visualizer.getIdsDiv().forEach(function(idDiv){
                divIds.push(idDiv)
              })
              $(JQlabelConfig).change(function(){that.checkBoxChange( JQlabelConfig, divIds)})
            }

            else{
              var v = version.replace('.','-');
              var id = idExtractor + '_' + v;
              var that = this;
              this.visualizers.forEach(function(elem,i){
                if(elem.idExtractor!=null){
                  if(elem.idExtractor === id){
                    that.visualizers.splice(i,1);
                  }
                }
              });

              var xsdObj = new XSDObject(xsd);
              var xmlxsdObj = new XMLXSDObj(xmlExtractor, xsdObj);
              var visualizerFactory = new VisualizerFactory(xmlxsdObj,this.nbFrames,this.visualizerDivs )
              var extractor = xmlExtractor.clone().empty()
              var visualizer = visualizerFactory.getVisualizer(extractor)
              visualizer.visualize()
              this.visualizers.push(visualizer);
            }

          var annotedFrames = [];
          this.xmls.forEach(function(xml,i){
            var xmltostring = Writer.convertDocumentToString(xml, 0)
            var newFrames = Parser.getListTimeId(xmltostring);
            newFrames.forEach(function(frame,j){
              annotedFrames.push(frame);
            })
          });
          annotedFrames.sort(function(a,b){
            return a-b;
          });
          vidCtrl.setAnnotedFrames(annotedFrames);
          }
        });
      }
    });
  }

  /* Function that will update the visualizer content
    Triggered by eventDDP liveUpdate
    @idVisualizer : visualizer to update
    @xml : new xml to put in visualizer
  */
  update(idVisualizer,xml){
    var that = this;
    this.visualizers.forEach(function(elem, i){
      if(elem.idExtractor!=null){
        if(elem.idExtractor === idVisualizer){
          var xsd = that.xsds[i];
          var parsexml = $.parseXML(xml);
          that.xmls[i] = $(parsexml).children().first();
          var xsdObj = new XSDObject(xsd);
          var xmlxsdObj = new XMLXSDObj(that.xmls[i], xsdObj);
          elem.setXmlXsdObj(xmlxsdObj);
        }
      }
    });
    var annotedFrames = [];
    this.xmls.forEach(function(xml,i){
      var xmltostring = Writer.convertDocumentToString(xml, 0)
      var newFrames = Parser.getListTimeId(xmltostring);
      newFrames.forEach(function(frame,j){
        annotedFrames.push(frame);
      })
    });
    annotedFrames.sort(function(a,b){
      return a-b;
    });
    vidCtrl.setAnnotedFrames(annotedFrames);

  }

  /* Function that will update all visualizers
  triggered by eventDDP setXmls for a user coming on project page to get last version
  @xmls : array of xml from the manager of another user
  */
  updateXmls(xmls){

    var that = this;
    xmls.forEach(function(xml,i){
      var visualizer = that.visualizers[i];
      var xsd = that.xsds[i];
      var parsexml = $.parseXML(xml);
      that.xmls[i] = $(parsexml).children().first();
      var xsdObj = new XSDObject(xsd);
      var xmlxsdObj = new XMLXSDObj(that.xmls[i], xsdObj);
      visualizer.setXmlXsdObj(xmlxsdObj);
    });
  }

  /* Function that will reinitialize event ddp client of all visualizers
  */
  destroyVisualizersEventDDP(){
    this.visualizers.forEach(function(elem, i){
      elem.destroyEventDDP();
    });
  }

  getXmls(){
    var xmls = [];
    var that = this;
    this.xmls.forEach(function(xmlDoc,i){
      var xml = xmlDoc[0].outerHTML;
      xmls.push(xml);
    })
    return xmls;
  }

  /*function which checked if the current user has the right write on the proejct
  */
  static hasRightToWrite(){
    var idProject = Router.current().params._id
    var project = Projects.findOne(idProject)
    if(!project){
      return false;
    }
    var username = Meteor.user().username
    var participant = $(project.participants).filter(function(i,p){
      return p.username == username && p.right == "Write"
    })
    if(project.owner == username || participant.length > 0){
      return true
    }else{
      return false
    }
  }

}
