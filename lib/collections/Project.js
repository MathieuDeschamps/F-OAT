import { Mongo } from 'meteor/mongo';
export var Projects = new Mongo.Collection('projects');

//Function to return errors when creating a new project
validateProject = function(project){
  var errors = {};
  if (!project.name){
    errors.name = TAPi18n.__('errorProjectNameEmpty');
  }
  if(project.name.indexOf('/')!==-1){
    errors.name = TAPi18n.__('errorProjectNameWrong');
  }
  var user = Meteor.user();
  if(Projects.findOne({owner: user.username, name: project.name})){
    errors.name = TAPi18n.__('errorProjectNameExists');
  }
  if(project.url==='error'){
    errors.url = TAPi18n.__('errorProjectURL');
  }
  if(project.downUrl==="error" || project.downUrl===''){
    errors.downUrl = TAPi18n.__('errorProjectDownloadURLwithURL');
  }
  if(project.frameRate==='' || !project.frameRate){
    errors.frameRate = TAPi18n.__('errorProjectFrameRate');
  }
  if(project.duration==="error"){
    errors.duration = TAPi18n.__('errorProjectDuration');
  }
  return errors;
}
