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
     * Htttp request that ask the parameters of an extraction tool
     *
     * @param extractorUrl The url of the extractor we want to get the parameters
     * @returns {String} The string representation of a xsd file which contain the definition of the parameters
     */
    getExtractorsParam: (extractorUrl)=>{
        var url = "http://"+extractorUrl+"/outilParam";
        console.log(url);
        const result = HTTP.call('GET',url);
        return result.content;
    },

    /**
     *
     * Http request that send a request of annotations to an extraction service
     * @param _id
     * @param params
     * @param extractorUrl
     * @returns {boolean}
     */
    putRequest: (_id, params, extractorUrl)=>{
        var url = "http://"+extractorUrl+"/param/"+id;
        const result = HTTP.call("PUT",url,{data:{param: params}});
        if(result.statusCode == 200){
            return true;
        }else{
            return false;
        }

    },

    /**
     * Http request that create a folder in a extraction service
     * @param _id
     * @param extractorUrl
     * @returns {boolean}
     */
    initRequest: (_id,extractorUrl)=>{

        var url = "http://"+extractorUrl+"/creation/"+id;
        const result = HTTP.call("PUT",url);
        if(result.statusCode==200){
            return true;
        }else{
            return false;
        }

    },

})