export class Stack{
	constructor(){
		this.array=[];
		this.length=0;
	}
	
	pop(){
		this.length--;
		return this.array.pop();
	}
	
	push(x){
		this.array.push(x);
		this.length++;
		console.log(x,(this.array)[this.length-1]);
		console.log(this.array);
	}
	
	topElt(){
		return this.array[this.length-1];
	}
	
	empty(){
		return (length==0);
	}
	
	append(object){
		for(var i=0;i<object.length;i++){
			console.log(i,object[i]);
			this.push(object[i]);
			console.log(this);
		}
	}

}