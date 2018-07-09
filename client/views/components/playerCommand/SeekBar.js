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
	}

	updateVideoControler(){
		var currentFrame = vidCtrl.getCurrentFrame();
 		$( "#"+this.idCurrentFrame ).val();
		if (this.follow == 1){
			$( "#seekBar" ).val(currentFrame);
		}
		//this.refresh();
		//console.log($( "#seekBar" ).val().toString());
	}
}
