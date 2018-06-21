import {TimeLine} from "../class/TimeLine.js"
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './configTimeLine.html';

Template.configTimeLine.onRendered(()=>{
});

  Template.configTimeLine.events({
    'click .elementTimeLine'(event,instance){
      // TODO find a way to check NaN values
      var startFrame = parseInt($(event.currentTarget).attr('startframe'), 10);
      var endFrame = parseInt($(event.currentTarget).attr('endframe'), 10);
      var timeLineId = parseInt($(event.currentTarget).attr('time_line_id'), 10);
      var name = $(event.currentTarget).attr('name')
      // forms[timeLineId].displayFrame(name, startFrame, endFrame)
    },
});
