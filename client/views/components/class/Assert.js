export class Assert{
  static equals(string,expectedValue, actualsValue){
    var result = true
    var style =  'color: white; font-weight:bold;'

    if(expectedValue instanceof Array && actualsValue instanceof Array){
      result = Assert.equalsArray(expectedValue, actualsValue)
    }else{
      result = (expectedValue === actualsValue)
    }
    if(result){
      style += 'background-color: green;'
      console.log('%c v ',style ,string,': ', expectedValue, '===', actualsValue);
    }else{
      style += 'background-color: red;'
      console.log('%c x ',style ,string,': ', expectedValue, '!==', actualsValue);
    }
  }

  static notEquals(){
    var result = true
    var style =  'color: white; font-weight:bold;'
    if(expectedValue instanceof Array && actualsValue instanceof Array){
      result = Assert.equalsArray(expectedValue, actualsValue)
    }else{
      result = (expectedValue === actualsValue)
    }
    if(false){
      style += 'background-color: green;'
      console.log('%c v ', style, string, ': ', expectedValue, '===', actualsValue,);
    }else{
      style += 'background-color: red;'
      console.log('%c x ', style, string, ': ', expectedValue, '!==', actualsValue);
    }
  }

  static equalsArray(expectedArray, actualsArray){
    if(expectedArray.length !== actualsArray.length){
      return false
    }
    for(var i = 0, l=expectedArray.length; i < l; i++){
      // check if we have nested arrays
      if(expectedArray[i] instanceof Array && actualsArray[i] instanceof Array){
        if(! Assert.equalsArray(expectedArray[i], actualsArray[i])){
          return false
        }
      }else if(expectedArray[i] !== actualsArray[i]){
        return false
      }
    }
    return true;
  }

}
