import {TimeLine} from "../class/TimeLine.js"
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Parser } from '../class/Parser.js'
import './configTimeLine.html';

Template.configTimeLine.onRendered(()=>{
  //Wait for video player and the project to be rendered before doing that
  Tracker.autorun(function doWhenProjectAndVideoPlayerRendered(computation) {
    console.log("project",Session.get('projectReady'))
    console.log("video",Session.get('videoPlayer'))
    if(Session.get('projectReady') === 1 &&  Session.get('videoPlayer') === 1) {
      xmlArray.forEach(function(xml, i){
        var idDiv= 'time_line_' + i;
        $('#timeLines').append('<div id="'+idDiv +'"/>')
        console.log('#timeLines', $('#timeLines'))
        var timeLineData = Parser.getTimeLineData(xml)
        var nbFrames = $(timeLineData).attr('nbFrames')
        var data = $(timeLineData).attr('data')
        var nameExtractor = $(xml).attr('name')
        if(!isNaN(nbFrames)){
          timeLines[i] =new TimeLine(nameExtractor, nbFrames, data, idDiv);
        }else{
          timeLines[i] = undefined
        }
        $('#'+idDiv).css('display','none');

      })
      console.log('timeLine[]', timeLines)
      computation.stop();
    }
  });

});

  Template.configTimeLine.events({
    'click .elementTimeLine'(event,instance){
      // TODO find a way to check NaN values
      var startFrame = parseInt($(event.currentTarget).attr('startframe'));
      var endFrame = parseInt($(event.currentTarget).attr('endframe'));
      var timeLineId = parseInt($(event.currentTarget).attr('time_line_id'));
      var name = $(event.currentTarget).attr('name')
      forms[timeLineId].displayFrame(name, startFrame, endFrame)
    },
});
