import { Template } from 'meteor/templating';

import './playerCommand.html'
import '../videoPlayer/videoPlayer.js';


Template.project.onRendered(function(){
	$( "#playButton" ).click(function() {vidCtrl.play();} );
	$( "#pauseButton" ).click(function() {vidCtrl.pause();} );
	$( "#partialButton" ).click(function() {
		pp=vidCtrl.getPartialPlaying();
		console.log(!pp);
		vidCtrl.setPartialPlaying(!pp);} );
	$( "#nextAnnotedButton" ).click(function() {vidCtrl.nextAnnotedFrame();} );
	$( "#prevAnnotedButton" ).click(function() {vidCtrl.prevAnnotedFrame();} );
	
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