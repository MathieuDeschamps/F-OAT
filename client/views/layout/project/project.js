
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Form } from '../../../../lib/components/Form.js'
import { Parser } from '../../../../lib/components/Parser.js'
import { Writer } from '../../../../lib/components/Writer.js'
import { TimeLine } from '../../../../lib/components/TimeLine.js'
import './project.html';

// browse the Xml and add the input to the form with the data from the xml
function browseXml(xml, iNode, parentNode){
  if(xml == undefined){
    alert("No XML to display.")
  }else{
      var nodeName
      var nodeValue
      var attrName
      var attrValue
      var li

      $(xml).each(function(i,e0){
        nodeName = e0.nodeName
        nodeValue = $(e0).clone().children().remove().end().text()
        //console.log('nodeName', nodeName)
        //console.log("nodeValue", nodeValue)

        // case for the root node
        if(iNode == 1){
            $(parentNode).append('<a href="#" id ="'+ nodeName + '"class="XMLButton" link="' + iNode + '">' +  nodeName + '<i class="small material-icons">keyboard_arrow_down</i></a>')
            $(parentNode).append('<ul id="' + iNode + '" style="display:block"></ul>')
        }else{
            $(parentNode).append('<li><a href="#" id ="'+ nodeName + '" class="XMLButton" link="' + iNode + '">' +  nodeName + '<i class="small material-icons">keyboard_arrow_left</i></a></li>')
            $(parentNode).append('<ul id="' + iNode + '" style="display:none"></ul>')
        }


        if($(xml).children().length == 0){
          li = '<li><label>text</label><input  id="' + nodeName + '" type="text" value="' + nodeValue + '"></li>'
          $('#' + iNode).append(li);
        }

        $(e0.attributes).each(function(i,e1){
          //console.log("idNode",idNode)
          attrName = e1.name;
          attrValue = e1.value;
          //console.log("attrName", attrName)
          //console.log("attrVal", attrValue)
          li = '<li><label> ' +  attrName + '</label>'
          li +='<input  id=" ' + attrName + '" type="text" value="'+ attrValue +'"></li>'
          $('#' + iNode).append(li)
        })
        var addAttr = '<li><a href="#" class="addAttr">Add attributes to ' + nodeName + '<i class="small material-icons">add_circle</i></a></li>'
        $('#' + iNode).append(addAttr)
      })
      if($(xml).children() != undefined){
        $(xml).children().each(function(j,e){
          browseXml(e, iNode + "-" + j , '#' + iNode )
       })
      }
      $('#' + iNode).append('<li><a href="#" class="addNode">Add child to ' + nodeName + '<i class="small material-icons">add_circle</i></a></li>')
    }
}

Template.project.onRendered(()=>{
  var xml;
  console.log(Router.current().params._id);
  Meteor.call("getXml","/inetpub/wwwroot/F-OAT/server/xmlFiles/mix_format.xml",(err,result)=>{
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
    Form.browseXml(Parser.getFrame(Session.get('xmlDoc'),$('#listFrame').val()), 1, '#XMLTab', '#XMLForm')
  },

  // show or hide the attributes and the children of the element
  'click .tab'(event, instance){
    var id = event.target.id

    $('#XMLForm').children().each(function(i,e){
    if($(e).attr('id') == 'div' + id){
          $(e).attr('style','display:block')
      }else{
        $(e).attr('style','display:none')
      }
    })
  }
});

Template.project.helpers({
  timeLine(){
    // N'ayez pas peur de supprimer les lignes suivantes
    var xml = Session.get('xmlDoc');
    var timeLineData = Parser.getTimelineData(xml);
  
    var timeLine = new TimeLine($(timeLineData).attr('frameRate'),$(timeLineData).attr('nbFrames'),$(timeLineData).attr('data'));
    
  }
});
