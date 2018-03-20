import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Form } from '../class/Form.js'
import { Parser } from '../class/Parser.js'
import { Writer } from '../class/Writer.js'
import './editor.html';

Template.editor.onRendered(()=>{
})

Template.editor.events({
  //TODO temporary event which simulate Timeline
  'change #listFrame'(event,instance){
    var numFrame = $(event.currentTarget).val()
    $(forms).each(function(i,form){
      form.displayFrame(numFrame)
    })
  },

  // check button event display form
  'click .filled-in'(event,instance){
    //toggle
    var id = $(event.currentTarget).attr('id')
    if($(event.currentTarget).attr('marked') == 'true'){
      $(event.currentTarget).attr('marked', 'false')
      $('#extractor' + id).attr('style', 'display:none')
    }else{
      $(event.currentTarget).attr('marked', 'true')
      $('#extractor' + id).attr('style', 'display:block')
    }
  },

  // move in the children element
  'click .collapsible-header'(event, instance){
    var elm = event.currentTarget
    var id = $(elm).attr('id').substr(6)
    var idExtractor = $(elm).parents('form').attr('id').substr(5)
    if($(elm).find('i').text() == 'keyboard_arrow_left'){
      $(elm).find('i').text('keyboard_arrow_down')
      forms[idExtractor].assembleForms()
      forms[idExtractor].buildNav($(elm).parents())
      forms[idExtractor].moveInForm(id)
      forms[idExtractor].collapseAll(forms[idExtractor].idHiddenForm)
      $(document).ready(function(){
        $('.collapsible').collapsible();
      });
    }else{
      $(elm).find('i').text('keyboard_arrow_left')
    }
  },

  // move in the parent element
  'click .breadcrumb'(event, instance){
    var elm = event.currentTarget
    var id = $(elm).attr('id').substr(3)
    var idExtractor = $(elm).parents('nav').attr('id').substr(4)
    forms[idExtractor].assembleForms()
    elm =  $('#forms').find('div[id="header' + id + '"]')
    forms[idExtractor].buildNav($(elm).parents())
    forms[idExtractor].moveInForm(id)
    forms[idExtractor].collapseAll(forms[idExtractor].idHiddenForm)
  },

  // save the forms information
  'click #saveForms'(event, instance){
    var result
    var XMLObject = $.parseXML(Session.get('XMLDoc'))
    $(forms).each(function(i,form){
      result = form.getXML()
      if(result !=  undefined){
        XMLObject = Writer.removeExtractor(XMLObject, form.name)
        XMLObject = Writer.addExtractor(XMLObject, result)
      }
      //console.log('XMLObject', XMLObject)
      // TODO call merge service
      // TODO call to update aother element
    })

  }
});

Template.editor.helpers({

  init(){
    //TODO temporary element which simulate the timeline interraction
    var XMLDoc = Session.get('XMLDoc')
    var listTimeId = Parser.getListTimeId(XMLDoc)
    $(listTimeId).each(function(i,e){
      $('#listFrame').append('<option>' + e + '</option>')
    });
  },

  test(){
    // N'ayez pas peur de supprimer les lignes suivantes
    // Parser.getTimelineData(Session.get('xmlDoc'))
    // Parser.getFramesActors(Session.get('xmlDoc'))
    // Parser.getFrame(Session.get('xmlDoc'),221)
    // Parser.getShotsActor(Session.get('xmlDoc'),0)
    // Parser.getFrames(Session.get('xmlDoc'),4725)
    // Parser.getFrames(Session.get('xmlDoc'),4726)
    // Parser.getFrames(Session.get('xmlDoc'),4727)
    // Parser.getShotFrames(Session.get('xmlDoc'),3800)
    // Parser.getActor(Session.get('xmlDoc'),1)
    // Parser.getShotsActor(Session.get('xmlDoc'),1)
    // Parser.getNbFrames(Session.get('xmlDoc'))
    // Parser.getListTimeId(Session.get('xmlDoc'))
    // Parser.getShotFrames(Session.get('xmlDoc'),3000)
    // var id = $(Parser.getFramesActors(Session.get('xmlDoc'))[0]).attr('refId')
    // Parser.getActor(Session.get('xmlDoc'),id)
    // Parser.getNbFrames(Session.get('xmlDoc'))
    // Parser.getShotFrames(Session.get('xmlDoc'),3149)
    // Parser.getMaxIdActor(Session.get('xmlDoc'))
    // Writer.addFrame(Session.get('xmlDoc'),'<frame timeId="3149"><path>3149</path></frame>')
    // Writer.addActor(Session.get('xmlDoc'),'<actor icon="Actor/Danny.png" id="2" name="Danny" ></actor>')
    // Writer.addFrame(Session.get('xmlDoc'),'<frame timeId="4600"><path>4600.png</path></frame>')
    // Writer.deleteActor(Session.get('xmlDoc'),1)
  }
});
