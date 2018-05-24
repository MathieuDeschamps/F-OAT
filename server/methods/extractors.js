import {Extractors} from '../../lib/collections/extractors.js';

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('extractors', function extractorsPublication() {
    return Extractors.find();
  });
}

Meteor.methods({

  addExtractor: (extractor , user)=>{

    var old = Extractors.findOne({$or: [{name: extractor.name}, {ip: extractor.ip}]});
    if(old){
      return -1;
    }
    Extractors.insert({name :   extractor.name, ip: extractor.ip, owner: user.username});
    return 1;
  },

  removeExtractor: (name, user)=>{

    return Extractors.remove({name: name, owner: user.username});
  },

  updateExtractor: (extractor)=>{
    return Extractors.update({_id:extractor._id, owner: extractor.owner},{$set:{name: extractor.name, ip: extractor.ip}});
  },
});
