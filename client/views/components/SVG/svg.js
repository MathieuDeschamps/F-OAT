import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Visual} from './visual.js';
import './svg.html';


Template.svg.onRendered(function () {
    Visual.draw_circles();
});
