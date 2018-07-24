import { PlayerCommand } from '../playerCommand/PlayerCommand.js'
import { TimeLine} from '../VisualizerTool/TimeLine.js'

export class VideoControler {
	constructor(vid,frameRate, duration){

		// Balise vidéo
		this.vid=vid;

		// Framerate
		this.frameRate=frameRate;
		this.duration=duration;
		// Plage de lecture (pour le mode partialPlaying)
		this.beginVid=1;
		this.endVid=parseInt(this.frameRate * this.duration)
		// Commande du lecteur
		this.playerCommand=undefined;

		// Récupération du nombre de frame à partir du framerate
		// On utilise un intervalle qui vérifie si la vidéo est prête à être lue.
		var that=this;


		// Mode lecture
		this.mode="full";
		this.partialPlaying=false;
		if(this.playerCommand instanceof PlayerCommand){
			$("#"+this.playerCommand.idPartialButton).prop('checked',false);
		}
		this.isPlaying=false;


		// Pour le pattern observer
		this.updateInterval=null;
		this.attachedObject=[];
		this.attachedObjectFrequency=new Map();


		// Frame annotée
		this.annotedFrame=[];

		// TimeLine qui a le focus du vidéo controleur
		this.focusedTimeLine = undefined;
		this.isFocusedTimeLine = false;
	}

	setEndVid(end){
		this.endVid=end;
	}

	setNbFrames(nbFrame){
		this.setEndVid(nbFrame);
		if (this.endSelect==undefined){
			this.endSelect=nbFrame;
		}else{
			this.endSelect=Math.min(this.endSelect,nbFrame);
		}
		this.nbFramesSetted=true;
	}

	setAnnotedFrames(annotedFrame){
		this.annotedFrame=annotedFrame;
		// console.log('annotedFrame',this.annotedFrame);
	}

	setPlayerCommand(playerCommand){
		if(playerCommand instanceof PlayerCommand){
			this.playerCommand = playerCommand;
		}
	}
	// Frame-Time management

	// Conversion

	// Retourne le temps correspondant au numéro de frame
	frameToTime(numFrame){
		return ((Number(numFrame)-1)/this.frameRate);
	}

	// Retourne le numéro de frame correspondant au temps
	timeToFrame(time){
		return Math.round(Number(time)*this.frameRate)+1;
	}

	// Current element

	// Retourne le temps courant de la vidéo
	getCurrentTime(){
		return this.vid.currentTime;
	}

	// Retourne le numéro de la frame courante de la vidéo
	getCurrentFrame(){
		return this.timeToFrame(this.vid.getCurrentTime());
	}

	// Redéfinit le numéro de la frame courante de la vidéo
	setCurrentFrame(newCurrentFrame){
			this.vid.setCurrentTime(this.frameToTime(newCurrentFrame));
			this.vid.pause();
			if (this.isPlaying){
				this.play();
			}
			var that = this;
			// add a delay before notify the observers
			// which lasts the time to set the current time
			// the value of the delay is arbitary
			setTimeout(function() {
				// console.log('currentFrame expected: ', newCurrentFrame, ' real: ', that.getCurrentFrame());
				that.notifyAttachedObjects();
			}, 200);
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
		//// console.log(this.mode,this.beginSelect,this.endSelect);
	}

	// Configuration du mode de lecture
	configMode(){
		clearInterval(this.updateInterval);
		var that=this;
		switch (this.mode){
			case "full" :
				this.updateInterval=setInterval(function(){that.fullPlay()},1000/this.frameRate);
				break;
			case "partial" :
				this.updateInterval=setInterval(function(){that.partialPlay();},1000/this.frameRate);
				// console.log('config Mode period : ',1000/this.frameRate);
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
		var that=this;
		var currentFrame=this.getCurrentFrame();
		// On notifie les objets qui sont abonnés au contrôleur vidéo.
		this.attachedObject.forEach(function(object){
			if (currentFrame % that.attachedObjectFrequency.get(object)==0){
				object.updateVideoControler();
				// console.log('object', object)
			}
		});
	}

	/*
	notifying new current frame without taking care of frequency.
	*/
	forcedNotifyAttachedObjects(numFrame){
		var that=this;
		// On notifie les objets qui sont abonnés au contrôleur vidéo.
		this.attachedObject.forEach(function(object){
			object.updateVideoControler(numFrame);
		});
	}

	// Fonction de l'intervalle en mode full
	fullPlay(){
		newCurrentFrame = this.getCurrentFrame()
		this.notifyAttachedObjects(newCurrentFrame);
		// console.log("full");
	}

	// Fonction de l'intervalle en mode partial
	partialPlay(){
		// console.log('partialPlay',this.getCurrentFrame(),this.beginSelect,this.endSelect)
		if (this.getCurrentFrame()>this.endSelect||this.getCurrentFrame()<this.beginSelect){
			this.setCurrentFrame(this.beginSelect);
		}else{
			this.notifyAttachedObjects(this.getCurrentFrame());
		}
		// console.log("partial");
	}

	// Lecture de la vidéo
	play(){
		if(this.mode==="freeze"){
			this.setPartialPlaying(false);
		}
		// console.log('play',this.mode);
		// if (this.mode!=="freeze"){
			this.vid.play();
			this.isPlaying=true;
		// }
		if(this.playerCommand instanceof PlayerCommand){
			this.playerCommand.play();
		}
		this.configMode();
	}

	// Mise en pause de la vidéo.
	pause(){
		this.vid.pause();
		this.isPlaying=false;
		if(this.playerCommand instanceof PlayerCommand){
			this.playerCommand.pause();
		}
		clearInterval(this.updateInterval);
		this.vid.removeEventListener('playing');
		// var newCurrentFrame = this.getCurrentFrame();
		// this.notifyAttachedObjects(newCurrentFrame);
	}

	// Définition de l'intervalle de lecture
	setPlayingInterval(begin,end){
		begin=Number(begin);
		end=Number(end);
		if (begin>=1 &&  begin <= end && (this.endVid==undefined || end<=this.endVid)){
			this.beginSelect=begin;
			this.endSelect=end;
			if(this.playerCommand instanceof PlayerCommand){
				$("#"+this.playerCommand.idBeginSelect).val(begin);
				$("#"+this.playerCommand.idEndSelect).val(end);
			}
		}
		this.setMode();
	}

	setBeginSelect(begin){
		begin=Number(begin);
		if (begin>=1 && (this.endVid==undefined || begin<=this.endVid )){
			this.beginSelect=begin;
			if(this.playerCommand instanceof PlayerCommand){
			$("#"+this.playerCommand.idBeginSelect).val(begin);
		}
			if (this.endSelect==undefined || this.endSelect<this.beginSelect){
				this.endSelect=this.beginSelect;
				if(this.playerCommand instanceof PlayerCommand){
					$("#"+this.playerCommand.idEndSelect).val(this.beginSelect);
				}
			}
		}

		this.setMode();
	}

	setEndSelect(end){
		end=Number(end);
		if (end>=1 && (this.endVid==undefined || end<=this.endVid )){
			this.endSelect=end;
			if(this.playerCommand instanceof PlayerCommand){
				$("#"+this.playerCommand.idEndSelect).val(end);
			}
			if (this.beginSelect==undefined || this.beginSelect>this.endSelect){
				this.beginSelect=this.endSelect;
				if(this.playerCommand instanceof PlayerCommand){
					$("#"+this.playerCommand.idBeginSelect).val(this.endSelect);
				}
			}
		}
		// console.log('setEndSelect',end,this.endVid,this.endSelect);
		this.setMode();
	}

	// Mode de lecture partielle
	setPartialPlaying(pp){
		this.partialPlaying=pp;
		if(this.playerCommand instanceof PlayerCommand){
			$("#"+this.playerCommand.idPartialButton).prop('checked',pp);
		}
		if(this.partialPlaying &&
			this.playerCommand instanceof PlayerCommand &&
			!this.isFocusedTimeLine){
				this.setTimeLineFocus(this.focusedTimeLine);
		}
		// Timeline lost focus when disabled partialPlay
		if(!this.partialPlaying &&
			 this.focusedTimeLine instanceof TimeLine &&
			 this.isFocusedTimeLine){
				 // console.log('vidCtrl lostFocus')
			this.focusedTimeLine.lostFocus();
			this.isFocusedTimeLine = false;
		}
		this.setMode();
	}

	getPartialPlaying(){
		return this.partialPlaying;
	}

	// Abonnement d'un objet (les tableaux js sont dynamiques)
	attach(object,frequency){
		this.attachedObject[this.attachedObject.length]=object;
		this.attachedObjectFrequency.set(object,frequency);
		// console.log("attached object",this.attachedObject)
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

	// Desabonnement de tous les objets
	detachAll(){
		this.attachedObject = []
		this.attachedObjectFrequency = new Map();
	}

	// Passer à la prochaine frame annotée
	nextAnnotedFrame(){
		// console.log('nextAnnotedFrame')
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
		// console.log('prevAnnotedFrame')
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

	//
	setTimeLineFocus(timeLine){
		if(timeLine instanceof TimeLine){
			if(this.focusedTimeLine instanceof TimeLine && this.isFocusedTimeLine){
				this.focusedTimeLine.lostFocus();
			}
			this.isFocusedTimeLine = true;
			this.focusedTimeLine = timeLine;
			// this.focusedTimeLine.takeFocus();
		}

	}
}
