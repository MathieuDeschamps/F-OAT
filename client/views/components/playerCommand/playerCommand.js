import { Template } from 'meteor/templating';

import './playerCommand.html'
import '../videoPlayer/videoPlayer.js';

var vidPlayerCommandListener;

Template.project.onRendered(function(){
	var idsCommands = [7];
	idsCommands[0] = "playButton";
	idsCommands[1] = "pauseButton";
	idsCommands[2] = "seekBar";
	idsCommands[3] = "currentFrame";
	idsCommands[4] = "prevAnnotedButton";
	idsCommands[5] = "nextAnnotedButton";
	idsCommands[6] = "beginSelect";
	idsCommands[7] = "endSelect";
	idsCommands[8] = "partialButton";
	var playerCommand = new PlayerCommand(idsCommands);
	vidCtrl.setPlayerCommand(playerCommand);
	Tracker.autorun(function doWhenVideoPlayerRendered(computation) {
		if(Session.get('videoPlayer') === 1) {
			if(!vidPlayerCommandListener){
				vidPlayerCommandListener = true;
				//Event emitted in videoPlayer.js
				eventDDPVideo.addListener('playerCommand',()=>{
					setTimeout(function(){
						playerCommand.render();
					},50);
				});
				computation.stop();
			}
		}
	});

	playerCommand.render();
});
