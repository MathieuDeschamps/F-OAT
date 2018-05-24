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
  if (!project.url){
    errors.url = TAPi18n.__('errorProjectURLorFile');
  }
  if(project.url==="error"){
    errors.file = TAPi18n.__('errorProjectURLandFile');
  }
  if(project.url==="errorExt"){
    errors.file = TAPi18n.__('errorProjectFileExtension');
  }
  if(project.downUrl==="error"){
    errors.downUrl = TAPi18n.__('errorProjectDownloadURLwithURL');
  }
  if(project.downUrl==="errorFile"){
    errors.downUrl = TAPi18n.__('errorProjectDownloadURLwithFile');
  }
  return errors;
}
