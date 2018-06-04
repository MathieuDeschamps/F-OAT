import {Projects} from '../../lib/collections/Project.js';
var crypto = require('crypto');

/**
  Publish collection Projects
*/
if (Meteor.isServer) {
  Meteor.publish('projects', function projectsPublications() {
    return Projects.find();
  });
}

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
  createFile: function(id, project, buffer, nameV){

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
    fs.writeFile(dir+"/"+project.url, buffer, 'base64', function(err) {
      if(err) {
        throw (new Meteor.Error(500, 'Failed to save file.', err));
      }
      else{
        console.log("File saved successfully!")
      }
    });

    //Création du hacher avec la foction MD5 en utlilisant les données de la vidéo "buffer"
    let si = JSON.stringify({signature: crypto.createHash('sha1').update(buffer).digest("hex")});
    //Creation du fichier pour la signature des videos
    fs.writeFile(dirSi+"/"+nameV+ ".json", si, function(err) {
      if(err) {
        throw (new Meteor.Error(500, 'Failed to save file.', err));
      }
      else{
        console.log("File saved successfully!")
      }
    });


  },

  /**
  Create the xml file of a project
  @project : the project to wich we want to create an xml file
  */
  createXMLFile: function(id){
      createFileXML(id);
  },

  /**Insert a project in db and returns the id of the inserted project
    @project : project to insert in db
  */
  insertProject: function(project){
    return Projects.insert(project);
  },

  /**Remove a project from db
  @id : id of the project to remove
  */
  removeProject:function(id){
    check(id,String);
    return Projects.remove({_id: id});
  },


  /**Add a notification for all users of a project
  @id : id of the project
  @newDate : date of the notification
  @newValue : Text of the notification
  */
  addNotifications: function(id,newDate,newValue){
    check(id,String);
    check(newDate,String);
    check(newValue,String);
    var project = Projects.findOne(id);

    //Add notification to the owner
    Meteor.users.update({username : project.owner},{
      $push: {notifications: {date: newDate, value: newValue}}
    });

    //Add notification to every collaborator
    project.participants.forEach(function(part){
      Meteor.users.update({username : part.username},{
        $push: {notifications: {date: newDate, value: newValue}}
      });
    });
  },

  /**Remove a notification of a user
  @id : id of the user
  @newDate : date of the notification
  @newValue : Text of the notification
  */
  removeNotification: function(id,dateToRemove,valueToRemove){
    check(id,String);
    check(dateToRemove,String);
    check(valueToRemove,String);
    return Meteor.users.update({ _id : id}, {$pull: {notifications: {$and : [{date: dateToRemove},{value : valueToRemove}]}}});
  },

  /**Update the fileId of a project if it's using a file
  @projectId : id of the project
  @fileId : id of the file in Videos collection
  */
  modifyFileId:function(projectId,fileId){
    check(projectId,String);
    check(fileId,String);
    return Projects.update({_id : projectId}, {$set: {"fileId": fileId}});
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

/** Create the XML file linked to a project
    @id : id of the project
*/
createFileXML = function(id){
  var fs = Npm.require("fs");
  //  var dir = "/tmp/"+project._id;
  var dir = "/tmp/"+id;

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  var buff = generateContent(Projects.findOne({_id: id}));
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
generateContent = function(project){
    var builder = require('xmlbuilder');
    var date = moment().format('MMMM Do YYYY');
    var doc = builder.create('root',{version: '1.0', encoding: 'UTF-8', standalone:'no'})
      .ele('project')
        .att('author',project.owner)
        .att('date', date)
        .ele('video')
          .att('id','1')
          .att('url',project.url)
        .up()
      .up()
      .ele('extractors')
      .up()
    .end({ pretty: true });
    return doc.toString();
}
