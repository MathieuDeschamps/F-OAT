import { Meteor } from 'meteor/meteor';
import { FilesCollection } from 'meteor/ostrio:files';
export const Videos = new FilesCollection({
  collectionName: 'videos',
  allowClientCode: false, // Disallow remove files from Client
});
