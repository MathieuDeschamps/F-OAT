import { ShotExtractVisualizer } from './ShotExtractVisualizer.js';
import { DefaultVisualizer } from './DefaultVisualizer.js';

export class VisualizerFactory{
  /* Constructor
  */
  constructor(xmlxsdObj, divIds){
    this.xmlxsdObj = xmlxsdObj;
    this.divIdForm = divIds[0]
    this.divIdTimeLine = divIds[1];
    this.divIdOverlay = divIds[2];
  }

  getVisualizer(extractor){
    var id = $(extractor).prop('tagName');
    var name = $(extractor).attr('name');
    var version = $(extractor).attr('version').replace('.','-');
    var expression = name;
    var visualizer;
    var idForm = 'form_annontation_' + id + '_' + version;
    var idTimeLine = 'time_line_' + id + '_' + version;
    var idOverlay = 'overlay_' + id + '_' + version;
    var divTimeLine;
    var divForm = $('<div/>');
    $(divForm).attr('id', idForm).addClass('row').css('display', 'none');
    $('#' + this.divIdForm).append(divForm);
    switch(expression){
      case "shot-extract":
        divTimeLine = $('<div/>');
        $(divTimeLine).attr('id', idTimeLine).addClass('row').css('display', 'none');
        $('#' + this.divIdTimeLine).append(divTimeLine);
        visualizer = new ShotExtractVisualizer(this.xmlxsdObj,id, name, idForm, idTimeLine);
        break;
      default:
      console.log('name', name)
      visualizer = new DefaultVisualizer(this.xmlxsdObj, id, name, idForm)
    }
    return visualizer;
  }
}
