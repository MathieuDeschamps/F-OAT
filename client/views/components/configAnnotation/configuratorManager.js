
import { VisualizerFactory } from '../Visualizer/VisualizerFactory.js'
import { XSDObject } from '../XSDParser/XSDObject.js';
import { XMLXSDObj } from '../XMLXSDParser/XMLXSDObj.js';
import { XMLXSDForm } from '../XMLXSDForm/XMLXSDForm.js';
import { XMLGenerator } from '../XMLGenerator/XMLGenerator.js';

export class configuratorManager{

  constructor(xsds, xmls, checkBoxDiv, formDiv, visualizerDivs){
    this.xsds = xsds;
    this.xmls = xmls;
    this.checkBoxDiv = checkBoxDiv;
    this.formDiv = formDiv;
    this.visualizerDivs = visualizerDivs;
    this.JQformDiv='#'+formDiv;
    this.JQcheckBoxDiv='#'+checkBoxDiv;
    var that = this;
    this.xsds.forEach(function(xsd, i){
      var labelConfig = "annontation_" + i
      var JQlabelConfig='#'+labelConfig;
      var extractorCheckBox = '<p><input class="filled-in" id="'+ labelConfig + '" type="checkbox"/>'
      extractorCheckBox += '<label for="'+ labelConfig + '">' + $(xmls[i]).attr('name') + '</label></p>'
      $(that.JQcheckBoxDiv).append(extractorCheckBox);

      var xsdObj = new XSDObject(xsd);
      var xmlxsdObj = new XMLXSDObj(xmls[i], xsdObj);

      // console.log('this.visualizerDivs', that.visualizerDivs);
      var visualizerFactory = new VisualizerFactory(xmlxsdObj,that.visualizerDivs )
      var extractor = xmls[i].clone().empty()
      var visualizer = visualizerFactory.getVisualizer(extractor)
      visualizer.visualize()
      var divIds = []
      visualizer.getIdsDiv().forEach(function(idDiv){
        divIds.push(idDiv)
      })
      $(JQlabelConfig).change(function(){that.checkBoxChange( JQlabelConfig, divIds)})
      // console.log('visualizer', visualizer)
    })
  }

  checkBoxChange(JQlabelConfig,idsDiv){
      var that=this;
      if ($(JQlabelConfig).prop('checked')){
        idsDiv.forEach(function(idDiv){
          var JQidDiv = '#' + idDiv;
          console.log
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
