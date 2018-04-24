import { HTTP } from 'meteor/http'

export class Requests {

  static getParam(urlExtractor){
    var url = urlExtractor+"/outilParam";
    console.log(url);
    HTTP.call('GET',url,(error,result)=>{
      if(error){
        return error.reason;
      }else{
        console.log(result.data);
        return result;
      }
    });
  };

  static creation(urlExtractor,id){
    var url = urlExtractor+"/outilParam";

    HTTP.call('PUT',url,(error,result)=>{

    });
  }

}
