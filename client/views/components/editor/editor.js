import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Form } from '../class/Form.js'
import { Parser } from '../class/Parser.js'
import { Writer } from '../class/Writer.js'
import {Projects} from '../../../../lib/collections/Project.js';
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


  // move in the children element
  'click .collapsible-header'(event, instance){
    var elm = event.currentTarget
    var id = $(elm).attr('id').substr(6)
    var idExtractor = $(elm).parents('form').attr('id').substr(5)
    // TODO debug
    if($(elm).find('i').text() == 'keyboard_arrow_right'){
      $(elm).find('i').text('keyboard_arrow_down')
      // does not trigger the moveInForm for add element
      if($(elm).attr('name') != undefined){
        forms[idExtractor].assembleForms()
        forms[idExtractor].buildNav($(elm).parents())
        forms[idExtractor].moveInForm(id)
        forms[idExtractor].collapseAll(forms[idExtractor].idHiddenForm)
        $(document).ready(function(){
          $('.collapsible').collapsible();
        });
      }

    }else if($(elm).find('i').text() == 'keyboard_arrow_down'){
      $(elm).find('i').text('keyboard_arrow_right')
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
      // console.log('result getXML', result[0])
      if(result !=  undefined){
        XMLObject = Writer.removeExtractor(XMLObject, form.name)
        XMLObject = Writer.addExtractor(XMLObject, result)
      }
    })
      var project = Projects.findOne(Router.current().params._id);
      var xml = Writer.convertDocumentToString(XMLObject,0);
      Meteor.call("updateXML",project,xml,(err,result)=>{
        if(err){
          alert(err.reason);
        }else{
          // update the forms
          $(forms).each(function(i,form){
            // TODO maybe return the XML in result
            form.XMLObject = $(XMLObject).find('extractors').children(form.name)[0]
            form.update()
          })
        }
      });
      // TODO call to update other elements


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
    // Parser.getTimelineData(Session.get('XMLDoc'),'extractorx1')
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
