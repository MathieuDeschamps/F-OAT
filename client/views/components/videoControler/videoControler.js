export class videoControler {
	constructor(vid,frameRate,annotedFrame){
		this.vid=vid;
		//this.vidLength=this.vid.duration;
		this.attachedObject=[];
		this.attachedObjectFrequency=new Map();
		// beginVid et endVid : numéros de frame de début et fin de la sélection.
		this.beginVid=0;
		this.frameRate=frameRate;
		this.partialPlaying=false;
		
		that=this;
		this.settingInterval=setInterval(function(){
			if (vid.readyState > 0) {
				that.endVid=that.timeToFrame(vid.duration);
				that.beginSelect=0;
				that.endSelect=that.endVid;
				clearInterval(that.settingInterval);
			}
		},50);
		
		
		
		this.annotedFrame=annotedFrame;
	}
	
	// Lecture de la vidéo
	play(){
		if (this.beginSelect!=this.endSelect|| !this.partialPlaying){
			this.vid.play();
			that=this;
			this.updateInterval=setInterval(function(){
				that.notify();
			},1/this.frameRate);
		}
	}
	
	// Mise en pause de la vidéo.
	pause(){
		clearInterval(this.updateInterval);
		this.vid.pause();
	}
	
	
	// Frame-Time management
	
	// Conversion 
	
	// Retourne le temps correspondant au numéro de frame
	frameToTime(numFrame){
		return ((numFrame-1)/this.frameRate);
	}
	
	// Retourne le numéro de frame correspondant au temps
	timeToFrame(time){
		return Math.round(time*this.frameRate)+1;
	}
	
	
	// Current element 
	
	// Retourne le temps courant de la vidéo
	getCurrentTime(){
		return this.vid.currentTime;
	}
	
	// Retourne le numéro de la frame courante de la vidéo
	getCurrentFrame(){
		return this.timeToFrame(this.vid.currentTime);
	}	
	
	// Retourne le numéro de la frame courante de la vidéo
	setCurrentFrame(newCurrentFrame){
		this.vid.currentTime=this.frameToTime(newCurrentFrame);
	}
	
	// 
	getVidDuration(){
		return this.vid.duration;
	}
	
	
	// Observer pattern methods : 
	
	notify(){
		// Gestion de la lecture partielle
			if (this.partialPlaying){
				// Affichage d'une frame. On met en pause.
				if (this.beginSelect==this.endSelect){
					this.setCurrentFrame(this.beginSelect);
					this.pause();
				}
				else {
					if (this.getCurrentFrame()>this.endSelect||this.getCurrentFrame()<this.beginSelect){
						this.setCurrentFrame(this.beginSelect);
					}
				}
			}
		
		var curFrame=this.getCurrentFrame();
		// On notifie les objets qui sont abonnés au contrôleur vidéo.
		for(var i=0; i<this.attachedObject.length;i++){
			if (curFrame % this.attachedObjectFrequency(this.attachedObject[i])==1){
				this.attachedObject[i].notify(curFrame);
				
			}
		};
	}
	
	// Abonnement d'un objet (les tableaux js sont dynamiques)
	attach(object){
		this.attachedObject[this.attachedObject.length]=object;
		this.attachedObjectFrequency.set(object,1);
	}
	
	attach(object,frequency){
		this.attachedObject[this.attachedObject.length]=object;
		this.attachedObjectFrequency.set(object,frequency);
	}
	
	
	// Desabonnement d'un objet 
	detach(object){
		var i=this.attachedObject.indexOf(object);
		if (i!=-1){
			// La fonction splice(i,j) enlève les j éléments d'un tableau à partir de l'indice i.
			this.attachedObject.splice(i,1);
			this.attachedObjectFrequency.delete(object);
		}
	}
	
	
	
	
	// partial playing management : 
	
	// Définition de l'intervalle de lecture
	setPlayingInterval(begin,end){
		this.setBeginSelect(begin);
		this.setEndSelect(end);
	}
	
	setBeginSelect(begin){
		if (begin>=1 && begin<=this.endVid){
			this.beginSelect=begin;
			if (this.endSelect<begin){
				this.endSelect=begin;
			}
		}
	}
	
	setEndSelect(end){
		if (end>=1 && end<=this.endVid){
			this.endSelect=end;
			if (this.beginSelect>end){
				this.beginSelect=end;
			}
		}
	}
	
	// Mode de lecture partielle.
	setPartialPlaying(pp){
		this.partialPlaying=pp;
	}
		
	getPartialPlaying(){
		return this.partialPlaying;
	}

	
	nextAnnotedFrame(){
		var i=0,
			j=this.annotedFrame.length-1,
			currentFrame=this.getCurrentFrame(),k;
		
		if (currentFrame < this.annotedFrame[0]){
			this.setCurrentFrame(this.annotedFrame[0]);
			return true
		}
		if (currentFrame >= this.annotedFrame[j]){
			return false;
		}
		while ((i+1)!=j){
			k=~~((i+j)/2);
			if (this.annotedFrame[k]<= currentFrame){
				i=k;
			}
			else{
				j=k;
			}
		}
		if (this.annotedFrame[j]>this.endSelect && this.partialPlaying)
			{return false}
		this.setCurrentFrame(this.annotedFrame[j]);
		return true;
	}
	prevAnnotedFrame(){
		var i=0,
			j=this.annotedFrame.length-1,
			currentFrame=this.getCurrentFrame(),k;
		if (currentFrame <= this.annotedFrame[0]){
			return false
		}
		if (currentFrame > this.annotedFrame[j]){
			this.setCurrentFrame(this.annotedFrame[j]);
			return true;
		}
		while ((i+1)!=j){
			k=~~((i+j)/2);
			if (this.annotedFrame[k]< currentFrame){
				i=k;
			}
			else{
				j=k;
			}
		}
		if (this.annotedFrame[i]<this.beginSelect && this.partialPlaying)
			{return false}
		this.setCurrentFrame(this.annotedFrame[i]);
		return true;
	}
	
	/*
	Private method?
	*/
	getCurrentAnnotedFrameIndice(){
		var i=0,
			j=this.annotedFrame.length-1,
			currentFrame=this.getCurrentFrame(),
			k;
		if (j==0){
			return -2; // No annoted frame
		}
		if (currentFrame < this.annotedFrame[0]){
			return -1;
		}
		if (currentFrame >= this.annotedFrame[j]){
			return j;
		}
		while ((i+1)!=j){
			k=~~((i+j)/2);
			if (this.annotedFrame[k]<= currentFrame){
				i=k;
			}
			else{
				j=k;
			}
		}
		return i;
	}
	
	getCurrentAnnotedFrame(){
		this.annotedFrame[this.getCurrentAnnotedFrameIndice()];
	}
		
}