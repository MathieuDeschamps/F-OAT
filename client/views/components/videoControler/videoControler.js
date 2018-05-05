export class videoControler {
	constructor(vid,frameRate,annotedFrame){
		
		// Balise vidéo
		this.vid=vid;		
		
		// Framerate
		this.frameRate=frameRate;
				
		// Plage de lecture (pour le mode partialPlaying)
		this.beginVid=1;
		this.endVid=1;
		
		// Récupération du nombre de frame à partir du framerate
		// On utilise un un intervalle qui vérifie si la vidéo est prête à être lu.
		var that=this;
		
		this.settingInterval=setInterval(function(){
			if (that.vid!=undefined && that.vid.readyState > 0) {
				that.endVid=that.timeToFrame(that.vid.duration);
				that.beginSelect=1;
				that.endSelect=that.endVid;
				clearInterval(that.settingInterval);
			}
		},50);
		
		
		
		
		// Mode lecture
		this.mode="full";
		this.partialPlaying=false;
		this.isPlaying=false;
		
		$(this.vid).on('timeupdate', function() {
			if (!that.isPlaying || that.mode=='freeze'){
				that.pause();
				that.notifyAttachedObjects();
			}
			/*if (that.mode=='freeze'){
				that.vid.currentTime=that.frameToTime(that.beginSelect);
			}*/
		});
		
		
		
		// Pour le pattern observer
		this.updateInterval=null;
		this.attachedObject=[];
		this.attachedObjectFrequency=new Map();

		
		// Frame annotée
		this.annotedFrame=annotedFrame;
		
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
	
	// Redéfinit le numéro de la frame courante de la vidéo
	setCurrentFrame(newCurrentFrame){
		//this.vid.currentTime=this.frameToTime(newCurrentFrame);
		this.vid.play();
		if (!this.isPlaying){
			var that=this;
			this.vid.addEventListener('playing',function(){that.pause();});
		}
		this.vid.setCurrentTime(this.frameToTime(newCurrentFrame));
		
	}
	
	// Longueur de la vidéo
	getVidDuration(){
		return this.vid.duration;
	}	
	
	// Nombre de frames de la vidéo
	getNbFrame(){
		return this.endVid;
	}
	
	// Définition du mode de lecture
	setMode(){
		var oldMode=this.mode;
		if (this.partialPlaying){
			if (this.beginSelect<this.endSelect){
				this.mode="partial";
			}else{
				this.mode="freeze";
			}
		}else{
			this.mode="full";
		}
		if (oldMode!=this.mode && this.isPlaying || this.mode=="freeze"){
			this.configMode();
		}
		//console.log(this.mode,this.beginSelect,this.endSelect);
	}
	
	
	// Configuration du mode de lecture
	configMode(){
		clearInterval(this.updateInterval);
		var that=this;
		switch (this.mode){
			case "full" : 
				this.updateInterval=setInterval(function(){that.fullPlay()},1/this.frameRate);
				break;
			case "partial" : 
				this.updateInterval=setInterval(function(){that.partialPlay()},1/this.frameRate);
				break;
			case 'freeze' :
				//this.isPlaying=false;
				this.pause();
				this.setCurrentFrame(this.beginSelect);
				break;
		}
	}
	
	// Notification des objets abonnés (Pattern Observer)
	notifyAttachedObjects(){	
		var curFrame=this.getCurrentFrame();
		var that=this;
		// On notifie les objets qui sont abonnés au contrôleur vidéo.
		this.attachedObject.forEach(function(object){
			if (curFrame % that.attachedObjectFrequency.get(object)==1){
				object.notify(curFrame);
			}
		});
	}
	
	// Fonction de l'intervalle en mode full
	fullPlay(){
		this.notifyAttachedObjects();
	}
	
	// Fonction de l'intervalle en mode partial
	partialPlay(){
		if (this.getCurrentFrame()>this.endSelect||this.getCurrentFrame()<this.beginSelect){
			this.setCurrentFrame(this.beginSelect);
		}
		this.notifyAttachedObjects();		
		//console.log("partial");
	}
	
	// Lecture de la vidéo
	play(){
		if (this.mode!="freeze"){
			this.isPlaying=true;
			this.vid.play();
		}
		this.configMode();
	}
	
	// Mise en pause de la vidéo.
	pause(){
		this.vid.pause();
		this.isPlaying=false;
		clearInterval(this.updateInterval);
		this.vid.removeEventListener('playing');
	}
	
	// Définition de l'intervalle de lecture
	setPlayingInterval(begin,end){
		begin=Number(begin);
		end=Number(end);
		if (begin>=1 &&  begin <= end && end<=this.endVid){
			this.beginSelect=begin;
			this.endSelect=end;
		}
		this.setMode();
	}
	
	setBeginSelect(begin){
		begin=Number(begin);
		if (begin>=1 && begin<=this.endVid){
			this.beginSelect=begin;
			if (this.endSelect<this.beginSelect){
				this.endSelect=this.beginSelect;
			}
		}
		this.setMode();
	}
	
	setEndSelect(end){
		end=Number(end);
		if (end>=1 && end<=this.endVid){
			this.endSelect=end;
			if (this.beginSelect>this.endSelect){
				this.beginSelect=this.endSelect;
			}
		}
		this.setMode();
	}
	
	// Mode de lecture partielle
	setPartialPlaying(pp){
		this.partialPlaying=pp;
		this.setMode();
	}
		
	getPartialPlaying(){
		return this.partialPlaying;
	}
	
	// Abonnement d'un objet (les tableaux js sont dynamiques)
	attach(object,frequency){
		this.attachedObject[this.attachedObject.length]=object;
		this.attachedObjectFrequency.set(object,frequency);
		//console.log("attached object",this.attachedObject)
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

	
	// Passer à la prochaine frame annotée
	nextAnnotedFrame(){
		var i=0,
			j=this.annotedFrame.length-1,
			currentFrame=this.getCurrentFrame(),
			k;
		
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

	// Passer à la précédente frame annotée
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
	
	// Renvoie l'indice dans this.annotedFrame de la frame annotée courante
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
	
	// Renvoie la frame annotée courante
	getCurrentAnnotedFrame(){
		var i= this.getCurrentAnnotedFrameIndice();
		if (i>=0){
			return this.annotedFrame[i];
		}
	}
		
}