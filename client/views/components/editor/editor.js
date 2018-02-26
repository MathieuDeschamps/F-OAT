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
      Session.set('xmlDoc', result.data)
      var listTimeId = Parser.getListTimeId(result.data)
      $(listTimeId).each(function(i,e){
      $('#listFrame').append('<option>' + e + '</option>')
    });
    var XMLObject = $.parseXML(result.data)
    Form.browseXML($(XMLObject).children('root'), 0, '#XMLForm')
    // Materiliaze initalisation for the collapsible
    $(document).ready(function(){
      $('.collapsible').collapsible();
    });
  }});

})


Template.editor.events({
  // temporary event which links and XMLForm
  'change #listFrame'(event,instance){
    var numFrame = $(event.currentTarget).val()
    var frameXML = Parser.getFrame(Session.get('xmlDoc'), numFrame)
    $('#XMLForm').empty()
    Form.browseXML(frameXML, 0, '#XMLForm')
    // Materiliaze initalisation for the collapsible
    $(document).ready(function(){
      $('.collapsible').collapsible();
    });
  },

  // move in the children element
  'click .collapsible-header'(event, instance){
    var elm = event.currentTarget
    var id = $(elm).attr('id').substr(6)
    if($(elm).find('i').text() == 'keyboard_arrow_left'){
      $(elm).find('i').text('keyboard_arrow_down')
      Form.assembleForms('hiddenForm', 'XMLForm')
      Form.buildParentNav($(elm).parents(),'XMLForm','XMLNav')
      Form.moveInForm(id,'XMLForm','hiddenForm')
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

    Form.assembleForms('hiddenForm', 'XMLForm')
    elm =  $('#XMLForm').find('div[id="header' + id + '"]')
    Form.buildParentNav($(elm).parents(),'hiddenForm','XMLNav')

    Form.moveInForm(id,'XMLForm','hiddenForm')
    $(document).ready(function(){
      $('.collapsible').collapsible();
    });
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
