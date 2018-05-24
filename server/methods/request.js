import { HTTP } from 'meteor/http'

Meteor.methods({

    /**
     * Http request which test if an ip define an extraction service server
     *
     * @param extractorUrl the url of the extractor we want to test
     * @returns {boolean} the extractor is a real one
     */
    testExtractor: (extractorUrl)=>{

        var url = "http://"+extractorUrl;
        const result = HTTP.call("GET",url);
        if(result.content === "Ici le service d'extraction"){
            return true;
        }else{
            return false;
        }
    },

    /**
     * Http request that ask the parameters of an extraction tool
     *
     * @param extractorUrl The url of the extractor we want to get the parameters
     * @returns {String} The string representation of a xsd file which contain the definition of the parameters
     */
    getExtractorsParam: (extractorUrl)=>{
        var url = "http://"+extractorUrl+"/outilParam";
        console.log(url);
        const result = HTTP.call('GET',url);
        console.log(result.content);
        return result.content;
    },

    /**
     *
     * Http request that send a request of annotations to an extraction service
     * @param _id the id of the project
     * @param params the params for the extractor
     * @param extractorUrl the url of the extractor
     * @returns {boolean} response's status code is 200
     */
    putRequest: (_id, params, extractorUrl)=>{
        var url = "http://"+extractorUrl+"/param/"+_id;
        const result = HTTP.call("PUT",url,{data:{param: params}});
        if(result.statusCode == 200){
            return true;
        }else{
            return false;
        }

    },

    /**
     * Http request that create a folder in a extraction service
     * @param _id the id of the project
     * @param extractorUrl the url of the extractor
     * @returns {boolean} the response's status ode is 200
     */
    initRequest: (_id,extractorUrl,_checksum,_downUrl)=>{

        var url = "http://"+extractorUrl+"/creation/"+_id;
        console.log(url);
        const result = HTTP.call("PUT",url,{data:{checksum: _checksum, url:_downUrl}});
        if(result.statusCode==200){
            return true;
        }else{
            return false;
        }

    },

})
