import {TimeLine} from "./TimeLine.js"
import { Template } from 'meteor/templating';
import { Parser } from '../../../../lib/components/Parser.js'
import { ReactiveVar } from 'meteor/reactive-var';
import './timeLineDisplay.html';

Template.timeLineDisplay.onRendered(()=>{
    var xml = Session.get('xmlDoc');    
    var timeLineData = Parser.getTimelineData(xml); 
    var timeLine = new TimeLine($(timeLineData).attr('frameRate'),$(timeLineData).attr('nbFrames'),$(timeLineData).attr('data'));
});
