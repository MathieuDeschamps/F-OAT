import { Template } from 'meteor/templating';

import './seekBarManager.js'
import './playerCommand.html'
import '../videoPlayer/videoPlayer.js';

var vidPlayerCommandListener;

renderPlayerCommand = function(){
	$( "#playButton" ).click(function() {vidCtrl.play();} );
	$( "#pauseButton" ).click(function() {vidCtrl.pause();} );
	$( "#seekBar" ).mousedown(function() {seekBarMng.mousePressed();} );
	$( "#seekBar" ).mouseup(function() {seekBarMng.mouseReleased();} );
	$( "#seekBar" ).change(function() {console.log("seekbar change");vidCtrl.setCurrentFrame($( "#seekBar" ).val());} );
	$( "#partialButton" ).click(function() {
		pp=vidCtrl.getPartialPlaying();
		vidCtrl.setPartialPlaying(!pp);} );
	$( "#nextAnnotedButton" ).click(function() {vidCtrl.nextAnnotedFrame();} );
	$( "#prevAnnotedButton" ).click(function() {vidCtrl.prevAnnotedFrame();} );
}
Template.project.onRendered(function(){

	Tracker.autorun(function doWhenVideoPlayerRendered(computation) {
		if(Session.get('videoPlayer') === 1) {
			if(!vidPlayerCommandListener){
				vidPlayerCommandListener = true;
				//Event emitted in videoPlayer.js
				eventDDPVideo.addListener('playerCommand',()=>{
					setTimeout(function(){
						renderPlayerCommand();

					},50);
				});
				computation.stop();
			}
		}
	});
	
	renderPlayerCommand();
});

Template.playerCommand.events({
	'change .selection'(event) {
		const target = event.target;
		const value = target.value;
		if (target.id=="beginSelect"){
			vidCtrl.setBeginSelect(value);
		}
		if (target.id=="endSelect"){
			vidCtrl.setEndSelect(value);
		}
	},

	/*'submit .#endSelect'(event) {
		const target = event.target;
		const value = target.number.value;
		vidCtrl.setEndSelect(value);

	},*/
});
