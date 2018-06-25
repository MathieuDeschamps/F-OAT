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
      var labelConfig = "annontation_" + i
      var JQlabelConfig='#'+labelConfig;
      var extractorCheckBox = '<p><input class="filled-in" id="'+ labelConfig + '" type="checkbox"/>'
      extractorCheckBox += '<label for="'+ labelConfig + '">' + $(xmls[i]).attr('name') + '</label></p>'
      $(JQcheckBoxDiv).append(extractorCheckBox);

      var xsdObj = new XSDObject(xsd);
      var xmlxsdObj = new XMLXSDObj(xmls[i], xsdObj);

      // console.log('this.visualizerDivs', that.visualizerDivs);
      var visualizerFactory = new VisualizerFactory(xmlxsdObj, that.nbFrames, that.visualizerDivs )
      var extractor = xmls[i].clone().empty()
      var visualizer = visualizerFactory.getVisualizer(extractor)
      visualizer.visualize()
      that.visualizers.push(visualizer);
      var divIds = []
      visualizer.getIdsDiv().forEach(function(idDiv){
        divIds.push(idDiv)
      })
      $(JQlabelConfig).change(function(){that.checkBoxChange(JQlabelConfig, divIds)})
      // console.log('visualizer', visualizer)

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
        if(typeof xmlAnnotation !== 'undefined'){
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
