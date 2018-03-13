import {Projects} from '../../lib/collections/Project.js';
var crypto = require('crypto');

/**
Method callable from the client for a project
*/
Meteor.methods({
  /**
  Create the xml file of a project
  @id : the id of the project
  @project : the project to wich we want to create an xml file
  @buffer : content of the file
  */
  createFile: function(a){

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

  /**
  Save the merged xml files of a project
  @project : the project modified
  @buffer : the content of XML that needs to be saved
*/
  mergeXML: function(project,buffer){
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


generateContent = function(project, id){
    var builder = require('xmlbuilder');
    var doc = builder.create('root',{version: '1.0', encoding: 'UTF-8', standalone:'no'})
      .ele('version')
        .txt('0.1')
      .up()
      .ele('project')
        .att('path','/tmp/'+project._id)
        .ele('icons')
          .att('path', 'Icons')
        .up()
        .ele('video')
          .att('id','1')
          .att('path',project.url)
        .up()
      .up()
      .ele('header')
        .ele('video')
          .att('fps','25.0')
          .att('framing','16/9','id=1')
          .ele('file')
            .txt('/tmp/'+project._id+'/'+project.url)
          .up()
        .up()
      .up()
    .end({ pretty: true });
    return doc.toString();
}
