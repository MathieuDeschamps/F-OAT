import {TimeLine} from "./TimeLine.js"
import { Template } from 'meteor/templating';
import { Parser } from '../class/Parser.js'
import { ReactiveVar } from 'meteor/reactive-var';
import './timeLineDisplay.html';

Template.timeLineDisplay.onRendered(()=>{
    timelineInterval=setInterval(function(){
        var xml = Session.get('XMLDoc');
        if (typeof xml !== 'undefined'){
            var timeLineData = Parser.getTimelineData(xml);
            timeLine = new TimeLine($(timeLineData).attr('frameRate'),$(timeLineData).attr('nbFrames'),$(timeLineData).attr('data'));
            clearInterval(timelineInterval);
        }
    },10);

});

Template.timeLineDisplay.events({
    'click .frame'(event,instance){
    var numFrame = $(event.currentTarget).attr('id');
    $(forms).each(function(i,form){
      //if(form.attr("style") === 'display:block'){
              form.displayFrame(numFrame);
      //}
    });
  },
});
