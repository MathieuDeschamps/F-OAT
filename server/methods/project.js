import {Projects} from '../../lib/collections/Project.js';
var crypto = require('crypto');

/**
Method callable from the client for a project
*/
Meteor.methods({
  /**
  Create the xml file of a project
  @id : the id of the project
  @buffer : content of the file
  @nameV : name of file without .mp4
  */
  createFile: function(id, buffer, nameV){

    //Write the file on server
    var fs = Npm.require("fs");
    var dir = "/tmp/"+id;
    var dirSi = "/tmp/signature";

    //Create a directory for the project if it doesn't exist
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    if (!fs.existsSync(dirSi)){
      fs.mkdirSync(dirSi);
    }
    //By default, write file in .meteor/local/build/programs/server/ but we write in tmp.
    fs.writeFile(dir+"/"+id, buffer, 'base64', function(err) {
      if(err) {
        throw (new Meteor.Error(500, 'Failed to save file.', err));
      }
      else{
        console.log("File saved successfully!")
      }
    });

    //Création du hacher avec la foction MD5 en utlilisant les données de la vidéo "buffer"
    let si = JSON.stringify({signature: crypto.createHash('md5').update(buffer).digest("hex")});
    //Creation du fichier pour la signature des videos
    fs.writeFile(dirSi+"/"+nameV+ ".json", si, function(err) {
      if(err) {
        throw (new Meteor.Error(500, 'Failed to save file.', err));
      }
      else{
        console.log("File saved successfully!")
      }
    });

    createFileXML(id);

  },

  /**
  Create the xml file of a project
  @project : the project to wich we want to cretae an xml fime
  */
  createXMLFile: function(id){
      createFileXML(id);
  },

  //Function that insert a project in db and returns the id of the inserted project
  saveDocument: function(project){
    return Projects.insert(project);
  },

  /**
  Save the new xml file of a project
  @project : the project modified
  @buffer : the content of XML that needs to be saved
*/
  updateXML: function(project,buffer){
    var fs = Npm.require("fs");
    var dir = "/tmp/"+project._id;

    fs.writeFile(dir+"/annotation.xml", buffer, function(err) {
      if(err) {
        throw (new Meteor.Error(500, 'Failed to save file.', err));
      }
      else{
        console.log("File saved successfully!")
      }
    });
  }
});

createFileXML = function(id){
  var fs = Npm.require("fs");
  //  var dir = "/tmp/"+project._id;
  var dir = "/tmp/"+id;

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  var buff = generateContent(Projects.findOne({_id: id}), id);
  fs.writeFile(dir+"/"+"annotation.xml",buff,function(err){
    if(err) {
      throw (new Meteor.Error(500, 'Failed to save file.', err));
    }
    else{
      console.log("File saved successfully!");
    }
  });
}

/**
* Function that create the basic XML file of a project.
*/
generateContent = function(project, id){
    var builder = require('xmlbuilder');
    var date = moment().format('MMMM Do YYYY');
    var doc = builder.create('root',{version: '1.0', encoding: 'UTF-8', standalone:'no'})
      .ele('project')
        .att('author',project.owner)
        .att('date', date)
        .ele('video')
          .att('id','1')
          .att('fps','25.0')
          .att('url',project.url)
        .up()
      .up()
      .ele('extractors')
        .ele('shot-extract')
      .up()
    .end({ pretty: true });
    return doc.toString();
}
