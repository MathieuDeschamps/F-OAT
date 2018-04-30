export class XMLXSDAttr{
	constructor(value,xsdAttr){
		//this.xsdAttr=xsdAttr;
		console.log('XMLXSDAttr', value, xsdAttr);
		console.log('XMLXSDAttr',xsdAttr.table.getType(xsdAttr.type));
		this.type=xsdAttr.table.getType(xsdAttr.type);
		console.log('XMLXSDAttr - type',this.type);
		if (xsdAttr.default!=undefined){
			this.defaultValue=this.type.convert(xsdAttr.default);
		}
		console.log('XMLXSDAttr 1');
		if (xsdAttr.fixed!=undefined){
			this.fixedValue=this.type.convert(xsdAttr.fixed);
		}
		console.log('XMLXSDAttr 2');
		this.use=xsdAttr.use;
		console.log('XMLXSDAttr 4');
		this.setValue(value);	
		console.log('XMLXSDAttr',this);
	}

	setValue(value){
		if (value!=undefined){
			console.log("XMLXSDAttr - value to convert : ",value);
			var convertValue=this.type.convert(value);
			console.log("XMLXSDAttr - convertValue : ",convertValue);
			switch(this.use){
				case 'optional' :
					console.log("Ici");
					if (this.type.holds(convertValue)){
						if (this.fixedValue==undefined ||value==this.fixedValue){
							
							this.value=convertValue;
						}
					}
					break;
				case 'required' : 
					if (this.type.holds(convertValue)){
						if (this.fixedValue==undefined ||value==this.fixedValue){
							this.value=convertValue;
						}
					}else if (this.value==undefined && this.defaultValue!=undefined){
						this.value=this.defaultValue;
					}
					break;
				case 'prohibited':
					alert(this.name+' is prohibited here.');
			}
		}else{
			switch(this.use){
				case 'optional' :
					this.value=undefined;
					break;
				case 'required' : 
					if (this.fixedValue!=undefined){
						this.value=this.fixedValue;
					}else if (this.defaultValue!=undefined){
						this.value=this.defaultValue;
					}
					if (this.value==undefined){
						alert(this.name +' should have a value.');
					}
					break;
				case 'prohibited':
					this.value=undefined;
			}
		}			
	}
	
	accept(visitor){
		visitor.visitXMLXSDAttr(this);
	}
}