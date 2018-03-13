import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Form } from '../class/Form.js'
import { Parser } from '../class/Parser.js'
import { Writer } from '../class/Writer.js'
import './editor.html';

Template.editor.onRendered(()=>{
})

Template.editor.events({
  // check button event
  'click .filled-in'(event,instance){
    //toggle
    if($(event.currentTarget).attr('marked') == 'true'){
      $(event.currentTarget).attr('marked', 'false')
      var nameExtractor = $(event.currentTarget).attr('id')
      $('#nav-' + nameExtractor).remove()
      $('#hidden-' + nameExtractor).remove()
      $('#form-' + nameExtractor).remove()
    }else{
      var nameExtractor = $(event.currentTarget).attr('id')
      var index = $(event.currentTarget).attr('index')
      var XMLObject = $.parseXML(Session.get('XMLDoc'))
      $(event.currentTarget).attr('marked', 'true')
      var formExtractor ='<nav id="nav-'+ nameExtractor + '" index="' + index + '">'
      formExtractor += '<div class="nav-wrapper white-text blue darken-4 row">'
      formExtractor += '<div class="col s12" id="anchor">'
      formExtractor += '<a class="breadcrumb">path ' + nameExtractor +'</a>'
      formExtractor += '</div></div></nav>'
      formExtractor += '<form id="hidden-' + nameExtractor + '" style="display:none" index="' + index + '">'
      formExtractor += '</form>'
      formExtractor +=  '<form id="form-'+ nameExtractor +'" index="' + index + '">'
      formExtractor += '</form>'
      $('#forms').append(formExtractor)
      forms[index].buildForm()
    }
  },

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
    var index = $(elm).parents('form').attr('index')[0]
    if($(elm).find('i').text() == 'keyboard_arrow_left'){
      $(elm).find('i').text('keyboard_arrow_down')
      forms[index].assembleForms()
      forms[index].buildParentNav($(elm).parents())
      forms[index].moveInForm(id)
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
    var index = $(elm).parents('nav').attr('index')[0]
    forms[index].assembleForms()
    elm =  $('#forms').find('div[id="header' + id + '"]')
    forms[index].buildParentNav($(elm).parents())
    forms[index].moveInForm(id)
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

    var XMLDoc = Session.get('XMLDoc')
    // build the extractors
    var extractors = Parser.getListExtractors(XMLDoc)
    var extractor
    // global table which will contains the form objects
    forms = [extractors.lenght]

    $(extractors).each(function(i,nameExtractor){
      extractor = '<p><input class="filled-in"  id="'+ nameExtractor + '" index="' + i + '"type="checkbox" mark="false"/>'
      extractor += '<label for="'+ nameExtractor + '">' + nameExtractor + '</label></p>'
      $('#extractors').append(extractor)
      forms[i] = new Form(i, nameExtractor, $($.parseXML(XMLDoc)).find(nameExtractor), undefined,
        'nav-' + nameExtractor, 'hidden-' + nameExtractor, 'form-'+ nameExtractor)
    })

      //TODO temporary element which simulate the timeline interraction
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
