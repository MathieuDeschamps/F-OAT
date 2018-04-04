import {TimeLine} from "./TimeLine.js"
import { Template } from 'meteor/templating';
import { Parser } from '../class/Parser.js'
import { ReactiveVar } from 'meteor/reactive-var';
import './timeLineDisplay.html';
import '../../layout/project/project.html'

Template.timeLineDisplay.onRendered(()=>{
    timelineInterval=setInterval(function(){
        var xml = Session.get('XMLDoc');
        $(xml).find("extractors").children().each(function(i,e){
            if (typeof e !== 'undefined'){
              //console.log("e: ", e);
              var timeLineData = Parser.getTimelineData(xml,e.localName);
              $("#timeLines").append("<div id = 'timeLine" + i + "' class = 'row' style = 'display:none'></div>");
              //console.log("timeLineData: " , timeLineData);
              timeLine = new TimeLine(e.localName,$(timeLineData).attr('frameRate'),
              $(timeLineData).attr('nbFrames'),$(timeLineData).attr('data'),
              "timeLine" + i);
              clearInterval(timelineInterval);
            }
        })
    },10);

});

Template.timeLineDisplay.events({
    'click .frame'(event,instance){
    var numFrame = $(event.currentTarget).attr('id');
    console.log("numFrame = " , numFrame);
    //console.log($(forms));
    $(forms).each(function(i,form){
        console.log("form: " , form);
      //if(form.attr("style") === 'display:block'){
              form.displayFrame(numFrame);
      //}
    });
  },

  'click .filled-in'(event,instance){
    //toggle
    console.log("#document");
    /*
        if($(event.currentTarget).attr('marked') == 'true'){
      $(event.currentTarget).attr('marked', 'false')
      $('#extractor' + id).attr('style', 'display:none')
    }else{
      $(event.currentTarget).attr('marked', 'true')
      $('#extractor' + id).attr('style', 'display:block')
    }
    */
  },
});
