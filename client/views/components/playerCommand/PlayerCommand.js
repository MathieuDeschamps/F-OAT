export class PlayerCommand{

  constructor(idsCommands){
    if(typeof idsCommands !== 'undefined' &&
    idsCommands.length >= 9){
      this.idPlayButton = idsCommands[0];
      this.idPauseButton = idsCommands[1];
      this.idSeekBar = idsCommands[2];
      this.idCurrentFrame = idsCommands[3];
      this.idPrevAnnotedButton = idsCommands[4];
      this.idNextAnnotedButton = idsCommands[5];
      this.idBeginSelect = idsCommands[6];
      this.idEndSelect = idsCommands[7];
      this.idPartialButton = idsCommands[8];
      console.log('playerCommand', this)
    }
  }

  render(){
    var that = this
    $( "#"+this.idPauseButton ).css('display', 'none');
    $( "#"+this.idPlayButton ).click(function() {
      vidCtrl.play();
    } );
    $( "#"+this.idPauseButton ).click(function() {
      vidCtrl.pause();
    } );
    $( "#"+this.idSeekBar ).mousedown(function() {seekBarMng.mousePressed();} );
    $( "#"+this.idSeekBar ).mouseup(function() {seekBarMng.mouseReleased();} );
    $( "#"+this.idSeekBar ).change(function() {
      vidCtrl.setCurrentFrame($( "#"+that.idSeekBar ).val());
    });
    $( "#"+this.idPrevAnnotedButton ).click(function() {vidCtrl.prevAnnotedFrame();} );
    $( "#"+this.idNextAnnotedButton ).click(function() {vidCtrl.nextAnnotedFrame();} );
    $( "#"+this.idBeginSelect).change(function(){
      // console.log('change Begin')
      vidCtrl.setBeginSelect(this.value);})
    $( "#"+this.idEndSelect).change(function(){
      // console.log('change End')
      vidCtrl.setEndSelect(this.value);})
    $( "#"+this.idPartialButton ).click(function() {
      // console.log('changePartialPlaying')
      pp=vidCtrl.getPartialPlaying();
      vidCtrl.setPartialPlaying(!pp);} );
  }

  play(){
    $( "#"+this.idPlayButton ).css('display', 'none');
    $( "#"+this.idPauseButton ).css('display', 'block');
  }

  pause(){
    $( "#"+this.idPauseButton ).css('display', 'none');
    $( "#"+this.idPlayButton ).css('display', 'block');

  }
}
