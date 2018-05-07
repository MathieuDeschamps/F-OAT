import {TimeLine} from "../class/TimeLine.js"
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './timeLineDisplay.html';
import '../../layout/project/project.html'

Template.timeLineDisplay.onRendered(()=>{
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
