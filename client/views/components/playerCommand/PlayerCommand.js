
import { SeekBar } from './SeekBar.js';
import { VideoControler} from '../VideoControler/VideoControler.js';

export class PlayerCommand{

  constructor(videoControler, idsCommands){
    if(videoControler instanceof VideoControler &&
      typeof idsCommands !== 'undefined' &&
      idsCommands.length >= 9){
      this.videoControler = videoControler;
      this.videoControler.attach(this, 1);
      this.idPlayButton = idsCommands[0];
      this.idPauseButton = idsCommands[1];
      this.idSeekBar = idsCommands[2];
      this.seekBar = new SeekBar(videoControler, this.idSeekBar);
      this.videoControler.attach(this.seekBar, 1);
      this.idCurrentFrame = idsCommands[3];
      this.idPrevAnnotedButton = idsCommands[4];
      this.idNextAnnotedButton = idsCommands[5];
      this.idBeginSelect = idsCommands[6];
      this.idEndSelect = idsCommands[7];
      this.idPartialButton = idsCommands[8];
      $('#'+this.idSeekBar).prop('max', this.videoControler.endVid);
      $('#'+this.idCurrentFrame).prop('max', this.videoControler.endVid);
    }
  }

  render(){
    var that = this
    $( "#"+this.idPauseButton ).css('display', 'none');
    $( "#"+this.idPlayButton ).click(function() {
      that.videoControler.play();
    } );
    $( "#"+this.idPauseButton ).click(function() {
      that.videoControler.pause();
    } );
    $( "#"+this.idSeekBar ).mousedown(function() {that.seekBar.mousePressed();} );
    $( "#"+this.idSeekBar ).mouseup(function() {that.seekBar.mouseReleased();} );
    $( "#"+this.idSeekBar ).change(function() {
      that.videoControler.setPartialPlaying(false);
      that.videoControler.setCurrentFrame(parseInt($( "#"+that.idSeekBar ).val()));
    });
    $( "#"+this.idCurrentFrame ).change(function(){
      // console.log('change currentFrame', $( "#"+that.idCurrentFrame ).val())
      that.videoControler.setPartialPlaying(false);
      that.videoControler.setCurrentFrame(parseInt($( "#"+that.idCurrentFrame ).val()));
    })
    $( "#"+this.idPrevAnnotedButton ).click(function() {that.videoControler.prevAnnotedFrame();} );
    $( "#"+this.idNextAnnotedButton ).click(function() {that.videoControler.nextAnnotedFrame();} );
    $( "#"+this.idBeginSelect).change(function(){
      // console.log('change Begin')
      that.videoControler.setBeginSelect(this.value);})
    $( "#"+this.idEndSelect).change(function(){
      // console.log('change End')
      that.videoControler.setEndSelect(this.value);})
    $( "#"+this.idPartialButton ).click(function() {
      // console.log('changePartialPlaying')
      var pp=that.videoControler.getPartialPlaying();
      that.videoControler.setPartialPlaying(!pp);} );
  }

  play(){
    // console.log('play')
    $( "#"+this.idPlayButton ).css('display', 'none');
    $( "#"+this.idPauseButton ).css('display', 'block');
  }

  pause(){
    // console.log('pause')
    $( "#"+this.idPauseButton ).css('display', 'none');
    $( "#"+this.idPlayButton ).css('display', 'block');
  }

  updateVideoControler(){
    var currentFrame = this.videoControler.getCurrentFrame();
    $( "#"+this.idCurrentFrame ).val(currentFrame);
  }
}
