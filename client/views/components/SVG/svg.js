import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Visual} from './visual.js';
import {Parser} from '../class/Parser.js';
import './svg.html';


Template.svg.onRendered(function () {
    var pathXML = '/tmp/' + Router.current().params._id + '/annotation.xml'
    Tracker.autorun(function doWhenVideoPlayerRendered(computation) {
      if(Session.get('videoPlayer') === 1) {
        Meteor.call("getXml",pathXML,(errXML,result)=>{
          if(errXML){
            alert(errXML.reason);
          }
          else{
            var data = Parser.getOverlayData(result.data);
            visual=new Visual(data);
            vidCtrl.attach(visual,1);
          }
        });

        computation.stop();
      }
    });
});

Template.svg.onCreated(function (){
    Session.set('videoPlayer',0);
})
