
import { VisualizerFactory } from '../Visualizer/VisualizerFactory.js'
import { XSDObject } from '../XSDParser/XSDObject.js';
import { XMLXSDObj } from '../XMLXSDParser/XMLXSDObj.js';
import { XMLXSDForm } from '../XMLXSDForm/XMLXSDForm.js';
import { XMLGenerator } from '../XMLGenerator/XMLGenerator.js';

export class configAnnotationManager{

  /* Constructor
  @xsds : array which contains the XSD files parsed
  @xmls: array which contains the XML of the extractors parsed
  @checkBoxDiv: id of the div of the checkBox
  @visualizerDivs: array which contains the id of div of the visualizer
  */
  constructor(xsds, xmls, checkBoxDiv, visualizerDivs){
    this.xsds = xsds;
    this.xmls = xmls;
    this.checkBoxDiv = checkBoxDiv;
    this.visualizerDivs = visualizerDivs;
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
      var visualizerFactory = new VisualizerFactory(xmlxsdObj,that.visualizerDivs )
      var extractor = xmls[i].clone().empty()
      var visualizer = visualizerFactory.getVisualizer(extractor)
      visualizer.visualize()
      that.visualizers.push(visualizer);
      var divIds = []
      visualizer.getIdsDiv().forEach(function(idDiv){
        divIds.push(idDiv)
      })
      $(JQlabelConfig).change(function(){that.checkBoxChange( JQlabelConfig, divIds)})
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
}
