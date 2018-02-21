import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Form } from '../../../../lib/components/Form.js'
import { Parser } from '../../../../lib/components/Parser.js'
import { Writer } from '../../../../lib/components/Writer.js'
import './editor.html';

Template.editor.onRendered(()=>{

  var path = '/tmp/' + Router.current().params._id + '/annotation.xml'

  Meteor.call("getXml",path,(err,result)=>{
    if(err){
      alert(err.reason);
    }else{
      // fill the listFrame temp
      var listTimeId = Parser.getListTimeId(result.data)
      $(listTimeId).each(function(i,e){
      $('#listFrame').append('<option>' + e + '</option>')
    });
    var XMLObject = $.parseXML(result.data)
    Form.browseXML($(XMLObject).children('root'), 0, '#XMLForm')
  }});

})


Template.editor.events({
  // temporary event which links and XMLForm
  'change #listFrame'(event,instance){
    var value = $(event.currentTarget).val()
    var elm = $('#XMLForm').find('input[name="timeId"][value="' + value + '"]')
    $(elm).parents('fieldset').each(function(i,e){
      console.log('e', $(e).get(0))
      $(e).children('a').children('div').children('i').text('keyboard_arrow_down')
      $(e).children('ul').attr('style', 'display:block')
    })
  },

  // show or hide the attributes and the children of the element
  'click .XMLButton'(event, instance){
    var elm = event.currentTarget
    var linkId = $(elm).attr('id')
    console.log('elm',$(elm).parent().find('ul[link="' + linkId + '"]'))
    if($(elm).parent().find('ul[link="' + linkId + '"]').attr('style') == 'display:none'){
      $(elm).parent().find('ul[link="' + linkId + '"]').attr('style','display:block')
      $(elm).children('div').children('i').text('keyboard_arrow_down')
      // $(elm).parent().attr('class','border-fold')

    }else{
      $(elm).parent().find('ul[link="' + linkId + '"]').attr('style','display:none')
      $(elm).children('div').children('i').text('keyboard_arrow_left')
      // $(elm).parent().attr('class','border-unfold')
    }
  }
});

Template.editor.helpers({
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
