import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Projects} from '../../../../lib/collections/Project.js';
import {videoControler} from '../videoControler/videoControler.js';
import {seekBarManager} from '../playerCommand/seekBarManager.js';
import  '/public/renderers/vimeo.js';
import './videoPlayer.html';
import './videoPlayer.css';
import { Parser } from '../../components/class/Parser.js'


//this function is called when the input loads a video
function renderVideo(file){
  var reader = new FileReader();
  reader.onload = function(event){
    the_url = event.target.result
    console.log(the_url);
    //of course using a template library like handlebars.js is a better solution than just inserting a string
    $('#videoDisplayId').html("<video width='400' controls><source id='vid-source' src='"+the_url+"' type='video/mp4'></video>")
    $('#name-vid').html(file.name)

  }

  console.log(file);
  reader.readAsDataURL(file);
}

  var Player;
  Template.videoPlayer.onRendered(function () {
    var project = Projects.findOne(Router.current().params._id)
    var url = project.url;
    console.log("URL : "+url);
    if(url.includes(".mp4") || url.includes(".avi") || url.includes(".mkv") || url.includes('.wmv') || url.includes(".mov")){
      /*console.log("TRUE");
      url = "/tmp/"+project._id+"/"+url
      const { Cu } = require("chrome");
      let File = Cu.importGlobalProperties( [ "File" ] )
      var file = Services.io.newURI(url, null, null)
            .QueryInterface(Components.interfaces.nsIFileURL).file;
      file = File.createFromFileName(file.path);
      renderVideo(file);*/
    }
    else{
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
    }
  });

  Template.videoPlayer.onDestroyed(function(){
    $('.videoContainer').remove();
    Player.pause();
    Player.remove();

  });
