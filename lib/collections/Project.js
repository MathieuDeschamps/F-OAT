import { Mongo } from 'meteor/mongo';
export var Projects = new Mongo.Collection('projects');

//Function to return errors when creating a new project
validateProject = function(project){
  var errors = {};
  if (!project.name){
    errors.name = "Please fill in a name.";
  }
  if(project.name.indexOf('/')!==-1){
    errors.name = "Can't use '/' in your project name."
  }
  var user = Meteor.user();
  if(Projects.findOne({owner: user.username, name: project.name})){
    errors.name = "A project with this name already exists.";
  }
  if (!project.url){
    errors.url = "Please fill in a URL or give a file.";
  }
  if(project.url==="error"){
    errors.file = "Give an URL or a file, not both.";
  }
  if(project.url==="errorExt"){
    errors.file = "Your file should be a video (.mp4, .avi, .mkv, .wmv, .mov)";
  }
  if(project.downUrl==="error"){
    errors.downUrl = "If you give an URL, you need to give a download link too."
  }
  if(project.downUrl==="errorFile"){
    errors.downUrl = "If you give a file, dont give a download link."
  }
  return errors;
}
