import {Extractors} from '../../lib/collections/extractors.js';

/**
  Publish collection Extractors
*/
if (Meteor.isServer) {
  Meteor.publish('extractors', function extractorsPublication() {
    return Extractors.find();
  });
}

/**
  Method callable from the client for an extractor
*/
Meteor.methods({

  /** Insert an extractor in db if in doesn't already exists
      @extractor : extractor to insert
      @user : owner of the extractor
  */
  addExtractor: (extractor , user)=>{
    check(extractor.name,String);
    check(extractor.ip,String);
    check(user.username,String);
    var old = Extractors.findOne({$or: [{name: extractor.name}, {ip: extractor.ip}]});
    if(old){
      return -1;
    }
    Extractors.insert({name :   extractor.name, ip: extractor.ip, owner: user.username});
    return 1;
  },

  /** Remove an extractor from db if the owner of this extractor asks for it
  @name : name of the extractor
  @user : owner of the extractor
  */
  removeExtractor: (name, user)=>{
    check(name,String);
    check(user.username,String);
    return Extractors.remove({name: name, owner: user.username});
  },

  /** Update extractor data (name and ip)
  @extractor : extractor to update with its new data
  */
  updateExtractor: (extractor)=>{
    check(extractor.name,String);
    check(extractor.ip,String);
    check(extractor._id,String);
    check(extractor.owner,String);
    return Extractors.update({_id:extractor._id, owner: extractor.owner},{$set:{name: extractor.name, ip: extractor.ip}});
  },
});
