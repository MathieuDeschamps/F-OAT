import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Projects} from '../../../../lib/collections/Project.js';
import './videoPlayer.html';
import '/public/renderers/vimeo.js';
var Player;
Template.videoPlayer.onRendered(function () {
   $('video').mediaelementplayer({
      pluginPath:'/packages/johndyer_mediaelement/',
      success: function (mediaElement, domObject) {
        Player =mediaElement;
        mediaElement.setSrc((Projects.findOne(Router.current().params._id).url));
        Player.defaultVideoWidth = "800";
        Player.defaultVideoHeigth = "800";
        Player.videoWidth = "800";
        Player.videoHeigth="800";
      },
      error : function (media) {
        alert("Invalide Url");
      },

    });
});

Template.videoPlayer.onDestroyed(function(){
  $('.videoContainer').remove();
  Player.pause();
  Player.remove();
});
