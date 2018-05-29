import { Template } from 'meteor/templating';
import {Projects} from '../../../../lib/collections/Project.js';
import {Videos} from '../../../../lib/collections/videos.js';
import {videoControler} from '../videoControler/videoControler.js';
import {seekBarManager} from '../playerCommand/seekBarManager.js';
import  '/public/renderers/vimeo.js';
import './videoPlayer.html';
import './videoPlayer.css';
import { Parser } from '../../components/class/Parser.js'

Template.videoPlayer.onCreated(function(){

  Meteor.subscribe('projects');
  Meteor.subscribe('videos');

});

var Player;
Template.videoPlayer.onRendered(function () {
  Session.set('videoPlayer', 0);
  var project = Projects.findOne(Router.current().params._id);
  var file = Videos.findOne({_id : project.fileId});
  var url;
  if(!file){
    url = project.url;
  }
  else{
    url = file.link();
  }

  $('video').mediaelementplayer({
    pluginPath:'/packages/johndyer_mediaelement/',
    features: '[]',
    clickToPlayPause : false,
    success: function (mediaElement, domObject) {
      Player =mediaElement;
      mediaElement.setSrc(url);
    }
  });
  vid=$("#videoDisplayId").get(0);
  vidCtrl=new videoControler(vid,30);
  seekBarMng=new seekBarManager(vidCtrl);
  vidCtrl.attach(seekBarMng,5);
  Session.set('videoPlayer', 1);

});

Template.videoPlayer.onDestroyed(function(){
  $('.videoContainer').remove();
  Player.pause();
  Player.remove();
  Session.set('videoPlayer', 0);
});
