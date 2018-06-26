export class seekBarManager {
	constructor(videoControler){
		this.videoCtrl=videoControler;
		this.follow=1;
	}

	mousePressed(){
		this.follow = 0;
	}

	mouseReleased(){
		this.follow = 1;
	}

	notify(currentFrame){
		//console.log("seekBar");
		if (this.follow == 1){
			$( "#seekBar" ).val(currentFrame);
		}
		//this.refresh();
		//console.log($( "#seekBar" ).val().toString());
	}
}
