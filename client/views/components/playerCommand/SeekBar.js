export class SeekBar {
	constructor(videoControler, idCurrentFrame){
		this.videoCtrl=videoControler;
		this.idCurrentFrame = idCurrentFrame
		this.follow=1;
	}

	mousePressed(){
		this.follow = 0;
	}

	mouseReleased(){
		this.follow = 1;
		this.refresh();
	}

	update(){
		var currentFrame = vidCtrl.getCurrentFrame();
		console.log("seekBar update", currentFrame);
		$( "#"+this.idCurrentFrame ).text(currentFrame);
		if (this.follow == 1){
			$( "#seekBar" ).val(currentFrame);
		}
		//this.refresh();
		//console.log($( "#seekBar" ).val().toString());
	}

	refresh(){
		$( "#seekBar" ).val(this.videoCtrl.getCurrentFrame());
	}
}
