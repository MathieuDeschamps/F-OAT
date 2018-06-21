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
	$( "#seekBar" ).mouseenter(function(){
		// console.log('enter');
		$(this).parent().children('span').first()
			.css('border-top-left-radius', 50)
			.css('border-top-right-radius', 50)
			.css('border-bottom-right-radius', 50)
			.css('border-bottom-left-radius', 0)
			.css('height', 30)
			.css('width', 30)
			.css('top', -30)
			.css('margin-left', 2);
		$(this).parent().children('span').first().children('span').first()
			.css('font-size', 10)
			.css('color', '#fff')
			.css('margin-left', -1)
			.css('margin-top', 8);
	})
	$( "#seekBar" ).mouseout(function(){
		// console.log('out');
		$(this).parent().children('span').first()
			.css('height', 0)
			.css('width', 0)
			.css('top', 10)
			.css('margin-left', 7);
		$(this).parent().children('span').first().children('span').first()
			.css('font-size', 0)
			.css('margin-left', 7);
	})
	$( "#seekBar" ).change(function() {
		console.log("seekbar change");
		// var currentFrame = $( "#seekBar" ).parent();
		// currentFrame = $(currentFrame).children('span').first();
		// currentFrame = $(currentFrame).children('span').first().text();
		// $( "#seekBar" ).attr('value', currentFrame);
		// currentFrame = $( "#seekBar").val()
		// console.log("new value", currentFrame)
		vidCtrl.setCurrentFrame($( "#seekBar" ).val());
	});
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
