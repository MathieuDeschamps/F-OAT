import {Videos} from '../../lib/collections/videos.js';

/**
  Publish collection Videos
*/
if (Meteor.isServer) {
  Meteor.publish('videos', function () {
    return Videos.find().cursor;
  });
}
