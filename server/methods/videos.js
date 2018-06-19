import {Videos} from '../../lib/collections/videos.js';
import {Projects} from '../../lib/collections/Project.js'
/**
  Publish collection Videos
*/
if (Meteor.isServer) {
  Meteor.publish('videos', function () {
    return Videos.find().cursor;
  });
}

Meteor.methods({
  /**
  Remove the video from collection and update fileId in project
  */
  removeVideo : function(idProject){
    check(idProject,String);
    var fileId = Projects.findOne(idProject).fileId;
    Videos.remove(fileId);
    return Projects.update({_id : idProject}, {$set: {"fileId": null}});
  }

})
