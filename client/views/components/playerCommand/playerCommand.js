import { Template } from 'meteor/templating';
// import { PlayerCommand } from './PlayerCommand.js'

import './playerCommand.html'
import '../videoPlayer/videoPlayer.js';

//vidPlayerCommandListener is used to only set once the listener
var vidPlayerCommandListener;

Template.playerCommand.onRendered(function(){
	var idsCommands = new Array(9);
	idsCommands[0] = "playButton";
	idsCommands[1] = "pauseButton";
	idsCommands[2] = "seekBar";
	idsCommands[3] = "currentFrame";
	idsCommands[4] = "prevAnnotedButton";
	idsCommands[5] = "nextAnnotedButton";
	idsCommands[6] = "beginSelect";
	idsCommands[7] = "endSelect";
	idsCommands[8] = "partialButton";
	var playerCommand;
	this.playerCommandTracker = Tracker.autorun(function doWhenVideoPlayerRendered(computation) {
		if(Session.get('videoPlayer') === 1 && Session.get('projectReady') === 1 ) {
			playerCommand = new PlayerCommand(vidCtrl, idsCommands);
			vidCtrl.setPlayerCommand(playerCommand);
			if(!vidPlayerCommandListener){
				vidPlayerCommandListener = true;
				//Event emitted in videoPlayer.js
				eventDDPVideo.addListener('playerCommand',()=>{
					setTimeout(function(){
						playerCommand.render();
					},50);
				});
			}
			playerCommand.render();
			computation.stop();
		}
	});
});

Template.project.onDestroyed(function(){
	// stop the tracker when the template is destroing
	if(typeof this.playerCommandTracker !== 'undefined' &&
		!this.playerCommandTracker.stopped){
			this.playerCommandTracker.stop();
	}
})
