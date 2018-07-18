import { ShotExtractVisualizer } from './ShotExtractVisualizer.js';
import { CharacterExtractVisualizer } from './CharacterExtractVisualizer.js';
import { DefaultVisualizer } from './DefaultVisualizer.js';
import { OmdbApiVisualizer } from './OmdbApiVisualizer.js';
import { DLibVisualizer } from './DLibVisualizer.js';



export class VisualizerFactory{
  /* Constructor
  */
  constructor(xsdObj, xmlxsdObj, nbFrames, divIds){
    this.xsdObj = xsdObj;
    this.xmlxsdObj = xmlxsdObj;
    this.nbFrames = nbFrames;
    this.divIdForm = divIds[0]
    this.divIdTimeLine = divIds[1];
    this.divIdOverlay = divIds[2];
  }

  getVisualizer(extractor){
    var idExtractor = $(extractor).prop('tagName');
    var name = $(extractor).attr('name');
    var version = $(extractor).attr('version').replace('.','-');
    var expression = name;
    var visualizer;
    var id = idExtractor + '_' + version
    var idForm = 'form_annotation_' + id;
    var idTimeLine = 'time_line_' + id;
    var idOverlay = 'overlay_' + id;
    var divTimeLine;
    var divOverlay;
    var divForm = $('<div/>');
    $(divForm).attr('id', idForm).addClass('row').css('display', 'none');
    $('#' + this.divIdForm).append(divForm);
    switch(expression){
      case "shot-extract":
        divTimeLine = $('<div/>');
        $(divTimeLine).attr('id', idTimeLine).addClass('row').css('display', 'none');
        $('#' + this.divIdTimeLine).append(divTimeLine);

        divOverlay = $('<div/>')
        $(divOverlay).attr('id', idOverlay).css('display', 'none');
        $('#' + this.divIdOverlay).append(divOverlay);

        visualizer = new ShotExtractVisualizer(this.xsdObj, this.xmlxsdObj,id, name, this.nbFrames, idForm, idTimeLine, idOverlay);
        break;
      case "character-extract":
        divTimeLine = $('<div/>');
        $(divTimeLine).attr('id', idTimeLine).addClass('row').css('display', 'none');
        $('#' + this.divIdTimeLine).append(divTimeLine);

        visualizer = new CharacterExtractVisualizer(this.xsdObj, this.xmlxsdObj,id, name,this.nbFrames, idForm, idTimeLine);
        break;
      case "omdbapi":
        visualizer = new OmdbApiVisualizer(this.xmlxsdObj,id, name, idForm);
        break;
      case "dlib_face_detection":
        divTimeLine = $('<div/>');
        $(divTimeLine).attr('id', idTimeLine).addClass('row').css('display', 'none');
        $('#' + this.divIdTimeLine).append(divTimeLine);

        divOverlay = $('<div/>')
        $(divOverlay).attr('id', idOverlay).css('display', 'none');
        $('#' + this.divIdOverlay).append(divOverlay);

        visualizer = new DLibVisualizer(this.xsdObj, this.xmlxsdObj,id, name, this.nbFrames, idForm, idTimeLine, idOverlay);
        break;
      default:
      visualizer = new DefaultVisualizer(this.xmlxsdObj, id, name, idForm)
    }
    return visualizer;
  }
}
