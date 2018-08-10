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

    // generate a id for the extractor with a letter at the beginning
    var idExtractor = "";
    var alphanum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    do{
      idExtractor += alphanum.charAt(Math.floor(Math.random() * alphanum.length - 11));
      for (var i = 1; i < 17; i++){
        idExtractor += alphanum.charAt(Math.floor(Math.random() * alphanum.length));
      }

    }while(Extractors.findOne(idExtractor));


    var exist = true
    Extractors.insert({_id : idExtractor, name :   extractor.name, ip: extractor.ip, owner: user.username});
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
    var old = Extractors.findOne({$and:[{_id: {$ne : extractor._id}}, {$or: [{name: extractor.name}, {ip: extractor.ip}]}]});
    if(old){
      return -1;
    }
    Extractors.update({_id:extractor._id, owner: extractor.owner},{$set:{name: extractor.name, ip: extractor.ip}});
    return 1;
  },
});
