import { Logger } from 'meteor/ostrio:logger';
import {Projects } from "../lib/collections/projects.js";
import {Extractors} from "../lib/collections/extractors.js";
log = new Logger;
fs = require("fs");
cheerio = require("cheerio");

/*
  Configure the router to set main and not found templates
*/
Router.configure({
  layoutTemplate: 'mainLayout',
  notFoundTemplate: "notFound"
});


Router.route('/', {
  name: 'dashboard',
  waitOn: function(){
    // waitOn makes sure that this publication is ready before rendering your template
    return Meteor.subscribe("projects");
  }
});

Router.route('/options',{
  name: 'options',
  waitOn: function(){
    return Meteor.subscribe("extractors");
  },
});

Router.route('/noRight',{
  name: 'noRight'
});

Router.route('/newProject',{
  name: 'newproject',
  waitOn: function(){
    return [
      Meteor.subscribe('projects'),
      Meteor.subscribe("users")
    ]
  },
});

Router.route("/testPlayer",{
  name: 'testPlayer'
});

Router.route('/project/:_id',{
  name:'project',
  data: function(){
    return {
      project: Projects.findOne(this.params._id)
    }
  },
  waitOn: function(){
    return [
      Meteor.subscribe("projects"),
      Meteor.subscribe("videos")
    ]
  }
});

Router.route('/team/:_id',{
  name:'team',
  waitOn: function(){
    return Meteor.subscribe("projects");
  }
});

Router.route('/help',{
  name:'help'
})

Router.route('/login',{
  name: 'login'
});

Router.route('/register',{
  name: 'register'
});

// RESTfull route use by extractors for getting video file if needed

Router.route( "/api/video/:_id", { where: "server" } )
.get( function() {
  var fs = Npm.require("fs");
  this.response.statusCode =200;
  this.response.writeHead(200, {
    'Content-Type': 'video',
    "Content-Disposition": "attachment; filename= test.txt"
  });
  var read = fs.createReadStream("/home/boby/Bureau/2471_scooter-skatepark.mp4");
  read.on('data',function(chunk){
    console.log("lu un chunk de taille : "+chunk.length);
  });

  read.on('end',function(){
    console.log("fini");
  });

  read.pipe(this.response);

})
.post( function() {
  this.response.statusCode =403;
  this.response.end("Forbidden");
})
.put( function() {
  this.response.statusCode = 208;
  this.response.end("forbidden");

})
.delete( function() {

  // Its forbidden to delete a resource
  this.response.statusCode = 403;
  this.response.end("Forbidden");

});



// RESTfull route use by extractors for sending us XML files
Router.route( "/api/project/:_id", { where: "server" } )
.get( function() {
  this.response.statusCode =403;
  this.response.end("Forbidden");

})
.post( function() {
  this.response.statusCode =403;
  this.response.end("Forbidden");
})
.put( function() {
  console.log("debut put!");
  var id = this.params._id;
  var project = Projects.findOne(id);
  var response = this.response;
  var stringify = JSON.stringify(this.request.body);
  var json = JSON.parse(stringify);
  // get old ressource and parse it
  var old_xml_string = fs.readFileSync("/tmp/"+this.params._id+"/annotation.xml","utf8");
  var old_xml = cheerio.load(old_xml_string,{
    xml:{
      normalizeWhitespace :false,
    }
  });
  var extractor = Extractors.findOne(json.idExtractor);
  var version = json.version;

  old_xml(json.idExtractor).remove();
  var new_data = '\t\t<'+json.idExtractor+' name="'+extractor.name+'" version="'+version+'">\n\t\t</'+json.idExtractor+'>\n';
  old_xml(new_data).appendTo('extractors');
  old_xml(json.data).appendTo(json.idExtractor);
  //Write the file on server

  var dir = "/tmp/"+this.params._id;

  //Create a directory for the project if it doesn't exist
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }


  fs.writeFile(dir+"/annotation.xml",old_xml.html(), Meteor.bindEnvironment(function (err) {
    if(err) {
      console.log("Failed to save ressource for project: "+id);
      response.statusCode = 500;
      response.end("Failed to save ressource");
    }
    else{
      var date = moment().calendar();
      var val = "Project "+project.name+" : Extraction "+extractor.name+" done.";
      Meteor.call('addNotifications',id,date,val);
      console.log("File saved successfully! id: "+id);
      response.statusCode = 200;
      response.end("OK");
    }
  }));


})
.delete( function() {

  // Its forbidden to delete a resource
  this.response.statusCode = 403;
  this.response.end("Forbidden");

});



Router.route( "/api/descriptor/:_version", { where: "server" } )
.get( function() {
  this.response.statusCode =403;
  this.response.end("Forbidden");
})
.post( function() {
  this.response.statusCode =403;
  this.response.end("Forbidden");
})
.put( function() {
  console.log("debut put descriptor!");
  var version = this.params._version;
  var response = this.response;
  var stringify = JSON.stringify(this.request.body);
  var json = JSON.parse(stringify);
  var idExtractor = json.idExtractor;

  //Write the file on server

  var dir = "/tmp/"+idExtractor;


  //Create a directory for the extractor if it doesn't exist
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  //Create a directory for the version if it doesn't exist
  dir = dir+"/"+version;
  if(!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  //Check if the file descriptor.xsd already exists in this version
  fs.access(dir+"/descriptor.xsd", fs.F_OK, (err) => {
    if(err){
      console.log("descriptor version "+version+" does not exists, put descriptor.xsd");

      fs.writeFile(dir+"/descriptor.xsd",json.data, function(error,res){
        if(error) {
          console.log("Failed to save descriptor xsd for extractor: "+idExtractor+" version "+version);
          response.statusCode = 500;
          response.end("Failed to save ressource");
        }
        else{
          console.log("File saved successfully! extractor id : "+idExtractor+" version "+version);
          response.statusCode = 200;
          response.end("OK");
        }
      });
    }
    else{
      console.log("descriptor version "+version+" already exists");
      response.statusCode = 200;
      response.end("OK");
    }
  });


})
.delete( function() {

  // Its forbidden to delete a resource
  this.response.statusCode = 403;
  this.response.end("Forbidden");

});

if (Meteor.isServer) {
  //Change the limit of data that can be sent to the router and raw data for xml
  Router.onBeforeAction( Iron.Router.bodyParser.json({limit: '50mb'}), {except: ['creditReferral'], where: 'server'});
  Router.onBeforeAction( Iron.Router.bodyParser.raw({type: '*/*', only: ['creditReferral'], verify: function(req, res, body){req.rawBody = body.toString();}, where: 'server'}));

}else{

  Router.onBeforeAction(function(){
    if (!Meteor.user()) {
      // if the user is not logged in, render the Login template
      this.render('login');
    } else {
      // otherwise don't hold up the rest of hooks or our route/action function
      // from running
      this.next();
    }
  },
  {except: ['register','help']});

}
