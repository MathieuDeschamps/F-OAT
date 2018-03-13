import {Projects} from '../../lib/collections/Project.js';
var crypto = require('crypto');

/**
Method callable from the client for a project
*/
Meteor.methods({
  /**
  Create the xml file of a project
  @project : the project to wich we want to cretae an xml fime
  */
  createFile: function(a){
    console.log(a.id);
    console.log(a.name);
    //Write the file on server
    var fs = Npm.require("fs");
    //var dir = "/tmp/"+project._id;
    var dir = "/tmp/"+a.id;
    var dirSi = "/tmp/signature";

    //Create a directory for the project if it doesn't exist
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    if (!fs.existsSync(dirSi)){
      fs.mkdirSync(dirSi);
    }
    //By default, write file in .meteor/local/build/programs/server/ but we write in tmp.
    fs.writeFile(dir+"/"+a.id, a.buffer, 'base64', function(err) {
      if(err) {
        throw (new Meteor.Error(500, 'Failed to save file.', err));
      }
      else{
        console.log("File saved successfully!")
      }
    });

    //Création du hacher avec la foction MD5 en utlilisant les données de la vidéo "buffer"
    let si = JSON.stringify({signature: crypto.createHash('md5').update(a.buffer).digest("hex")});
    //Creation du fichier pour la signature des videos
    fs.writeFile(dirSi+"/"+a.name+ ".json", si, function(err) {
      if(err) {
        throw (new Meteor.Error(500, 'Failed to save file.', err));
      }
      else{
        console.log("File saved successfully!")
      }
    });

    fs.writeFile(dir+"/"+"annotation.xml","",function(err){
      if(err) {
        throw (new Meteor.Error(500, 'Failed to save file.', err));
      }
      else{
        console.log("File saved successfully!");
      }
    });

  },

  /**
  Create the xml file of a project
  @project : the project to wich we want to cretae an xml fime
  */
  createXMLFile: function(id){
    var fs = Npm.require("fs");
    //  var dir = "/tmp/"+project._id;
     var dir = "/tmp/"+id;

    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    fs.writeFile(dir+"/"+"annotation.xml","",function(err){
      if(err) {
        throw (new Meteor.Error(500, 'Failed to save file.', err));
      }
      else{
        console.log("File saved successfully!");
      }
    });
  },

  //Function that insert a project in db and returns the id of the inserted project
  saveDocument: function(project){
    return Projects.insert(project);
  },
});
