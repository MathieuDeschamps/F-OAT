import {TimeLine} from "../class/TimeLine.js"
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './timeLineDisplay.html';

Template.timeLineDisplay.onRendered(()=>{
});

  Template.timeLineDisplay.events({
    'click .elementTimeLine'(event,instance){
      // TODO find a way to check NaN values
      var startFrame = parseInt($(event.currentTarget).attr('startframe'));
      var endFrame = parseInt($(event.currentTarget).attr('endframe'));
      var timeLineId = parseInt($(event.currentTarget).attr('time_line_id'));
      var name = $(event.currentTarget).attr('name')
      forms[timeLineId].displayFrame(name, startFrame, endFrame)
    },
});
