import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Projects} from '../../../../lib/collections/Project.js';
import {videoControler} from '../videoControler/videoControler.js';
import {seekBarManager} from '../playerCommand/seekBarManager.js';
import  '/public/renderers/vimeo.js';
import './videoPlayer.html';
import './videoPlayer.css';
import { Parser } from '../../components/class/Parser.js'


var Player;
Template.videoPlayer.onRendered(function () {
   $('video').mediaelementplayer({
      pluginPath:'/packages/johndyer_mediaelement/',
      features: '[]',
      clickToPlayPause : false,
      success: function (mediaElement, domObject) {
        Player =mediaElement;
        mediaElement.setSrc((Projects.findOne(Router.current().params._id).url));

      }
    });
    vid=$("#videoDisplayId").get(0);
    vidCtrl=new videoControler(vid,30);
	seekBarMng=new seekBarManager(vidCtrl);
	vidCtrl.attach(seekBarMng,5);
});

Template.videoPlayer.onDestroyed(function(){
  $('.videoContainer').remove();
  Player.pause();
  Player.remove();

});
