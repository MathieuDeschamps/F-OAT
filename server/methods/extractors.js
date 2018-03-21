import {Extractors} from '../../lib/collections/extractors.js';

Meteor.methods({

  addExtractor: (extractor , user)=>{

    var old = Extractors.findOne({$or: [{name: extractor.name}, {ip: extractor.ip}]});
    console.log("extractor: ");
    console.log(extractor);
    if(old){
      return -1;
    }
    Extractors.insert({name :   extractor.name, ip: extractor.ip, owner: user.username});
    return 1;
  },
})
