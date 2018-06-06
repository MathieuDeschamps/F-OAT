import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Form } from '../class/Form.js'
import { Parser } from '../class/Parser.js'
import { Writer } from '../class/Writer.js'
import {XSDObject} from '../XSDParser/XSDObject.js';
import {XMLXSDObj} from '../XMLXSDParser/XMLXSDObj.js';
import {XMLXSDForm} from '../XMLXSDForm/XMLXSDForm.js';
import {XMLGenerator} from '../XMLGenerator/XMLGenerator.js';

import {Extractors} from '/lib/collections/extractors.js';

import './configAnnotation.html';

Template.configAnnotation.onRendered(()=>{
  //Wait for video player to be rendered before doing that
  Tracker.autorun(function doWhenProjectRendered(computation) {
    if(Session.get('projectReady') === 1) {
      console.log('XMLArray',xmlArray)
      console.log('XSDArray', xsdArray)

      xmlArray.forEach(function(xml, i){
        var idDiv= i+'_formConfigAnnontation';
        $('#configAnnotationForm').append('<div id="'+idDiv+'" class="row"/>')
        var xsdObj=new XSDObject(xsdArray[i]);
        xmlxsdObjAnnotations[i]= new XMLXSDObj(xml,xsdObj);
        console.log('xmlxsdObj', xmlxsdObjAnnotations[i])
        var nameExtractor = $(xml).attr('name')
        var form =new XMLXSDForm(xmlxsdObjAnnotations[i],'annot_'+i,nameExtractor, idDiv);
        form.generateForm()
        $('#'+idDiv).css('display','none');


      })
      computation.stop();
    }
  });
})

Template.configAnnotation.events({
});

Template.configAnnotation.helpers({
  test(){
    // N'ayez pas peur de supprimer les lignes suivantes
    var timeLine = Parser.getTimeLineData(Session.get('XMLDoc'),'shot-extract')
    console.log('timeLine', timeLine)
    // Parser.getFramesActors(Session.get('XMLDoc'))
    // Parser.getFrame(Session.get('XMLDoc'),221)
    // Parser.getShotsActor(Session.get('XMLDoc'),0)
    // Parser.getFrames(Session.get('XMLDoc'),4725)
    // Parser.getFrames(Session.get('XMLDoc'),4726)
    // Parser.getFrames(Session.get('XMLDoc'),4727)
    // Parser.getShotFrames(Session.get('XMLDoc'),3800)
    // Parser.getActor(Session.get('XMLDoc'),1)
    // Parser.getShotsActor(Session.get('XMLDoc'),1)
    // Parser.getNbFrames(Session.get('XMLDoc'))
    // Parser.getListTimeId(Session.get('XMLDoc'))
    // Parser.getShotFrames(Session.get('XMLDoc'),3000)
    // var id = $(Parser.getFramesActors(Session.get('XMLDoc'))[0]).attr('refId')
    // Parser.getActor(Session.get('XMLDoc'),id)
    // Parser.getNbFrames(Session.get('XMLDoc'))
    // Parser.getShotFrames(Session.get('XMLDoc'),3149)
    // Parser.getMaxIdActor(Session.get('XMLDoc'))
    // Parser.getOverlayData(Session.get('XMLDoc'))
    // Writer.addFrame(Session.get('xmlDoc'),'<frame timeId="3149"><path>3149</path></frame>')
    // Writer.addActor(Session.get('xmlDoc'),'<actor icon="Actor/Danny.png" id="2" name="Danny" ></actor>')
    // Writer.addFrame(Session.get('xmlDoc'),'<frame timeId="4600"><path>4600.png</path></frame>')
    // Writer.deleteActor(Session.get('xmlDoc'),1)
  }
});
