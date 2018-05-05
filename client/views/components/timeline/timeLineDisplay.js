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
                // console.log("timeLineData: " , timeLineData);
                $("#timeLines").append("<div id = 'timeLine" + i + "' class = 'row' style = 'display:none'></div>");

                timeLine = new TimeLine(e.localName,$(timeLineData).attr('frameRate'),
                $(timeLineData).attr('nbFrames'),$(timeLineData).attr('data'),
                i);
                // console.log("data: " , timeLineData);
                clearInterval(timelineInterval);
            }
        })
    },10);

});

  Template.timeLineDisplay.events({
    'click .elementTimeline'(event,instance){
      // TODO find a way to check NaN values
      var startFrame = parseInt($(event.currentTarget).attr('startframe'));
      var endFrame = parseInt($(event.currentTarget).attr('endframe'));
      var timelineId = parseInt($(event.currentTarget).attr('timelineid'));
      var name = $(event.currentTarget).attr('name')
      forms[timelineId].displayFrame(name, startFrame, endFrame)
    },
});
