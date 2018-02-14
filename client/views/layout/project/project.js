import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Form } from '../../../../lib/components/Form.js'
import { Parser } from '../../../../lib/components/Parser.js'
import { Tool } from '../../../../lib/components/Tool.js'
import {Projects} from '../../../../lib/collections/Project.js';
import { Writer } from '../../../../lib/components/Writer.js'
import './project.html';

Template.project.onRendered(()=>{
  var xml;
  var projectId= Router.current().params._id
  var path
  // uncomment the line bellow when the createFile method is fixe
  // var path = '/tmp/' + projectId + '/annontation.xml'

  // var project = Projects.findOne(projectId)
  path = 'tmp/' + project.owner + project.name + '/annotation.xml'
  // path = '/workspace/meteor/F-OAT/server/xmlFiles/mix_format.xml'

  Meteor.call("getXml", path ,(err,result)=>{
    if(err){
      alert(err.reason);
    }else{
      Session.set('xmlDoc', result.data)
  }});
})

Template.project.events({
  // temporary event which links and XMLForm
  'change #listFrame'(event,instance){
    //console.log('getFrame',parser.getFrame($('#listFrame').val()))
    $('#XMLTab').empty()
    $('#XMLForm').empty()
    console.log('getFrame',Parser.getFrame(Session.get('xmlDoc'),$('#listFrame').val()))
    Form.browseXML(Parser.getFrame(Session.get('xmlDoc'),$('#listFrame').val()), 1, '#XMLTab', '#XMLForm')
    $('#XMLForm').append('<a class="btn waves-effect waves-light blue darken-4 " id="saveForm" name="action">Save </a>')
  },

  // show or hide the attributes and the children of the element
  'click .tab'(event, instance){
    var id = event.target.id

    $('#XMLForm').children('div').each(function(i,e){
    if($(e).attr('id') == 'div' + id){
          $(e).attr('style','display:block')
      }else{
        $(e).attr('style','display:none')
      }
    })
  },

  'click #saveForm'(event,instance){
    var form = $('#XMLForm').children('div')
    result = Form.buildXML('#XMLTab', form)

    result = Tool.convertDocumentToString(result, 0)
    // TODO fixe <#document>

    // call the merge fonction and update the client XML
    // update the other element
    //Session.set('xmlDoc', result)
  }
});

Template.project.helpers({
      timeLine(){
    // N'ayez pas peur de supprimer les lignes suivantes
    var xml = Session.get('xmlDoc');
    var timeLineData = Parser.getTimelineData(xml);
  
    var timeLine = new TimeLine($(timeLineData).attr('frameRate'),$(timeLineData).attr('nbFrames'),$(timeLineData).attr('data'));
    
  },
  test(){
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