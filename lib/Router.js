import { Logger } from 'meteor/ostrio:logger';
import {Projects } from "../lib/collections/Project.js";
import {Extractors} from "../lib/collections/extractors.js";
log = new Logger;
fs = require("fs");
cheerio = require("cheerio");


Router.configure({
  layoutTemplate: 'mainLayout',
  notFoundTemplate: "notFound"
});



Router.route('/', {
  name: 'dashboard'
});

Router.route('/options',{
  name: 'options'
});

Router.route('/noRight',{
  name: 'noRight'
});

Router.route('/newProject',{
  name: 'newproject'
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

  }
});

Router.route('/team/:_id',{
  name:'team'
});


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
  //shitty example
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
  var response = this.response;
  var json = JSON.parse(this.request.body);

  // get old ressource ans parse it
  var old_xml_string = fs.readFileSync("/tmp/"+this.params._id+"/annotation.xml","utf8");
  var old_xml = cheerio.load(old_xml_string,{
    xml:{
      normalizeWhitespace :false,
    }
  });

  old_xml('shot-extract').remove();
  old_xml(json.data).appendTo('extractors');

 //Write the file on server

 var dir = "/tmp/"+this.params._id;

 //Create a directory for the project if it doesn't exist
 if (!fs.existsSync(dir)){
   fs.mkdirSync(dir);
 }

 fs.writeFile(dir+"/annotation.xml",old_xml.html(), function(err) {
   if(err) {
     console.log("Failed to save ressource for project: "+id);
     response.statusCode = 500;
     response.end("Failed to save ressource");
   }
   else{
     console.log("File saved successfully! id: "+id);
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

  Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({
    extended: false
  }));
  Router.onBeforeAction( Iron.Router.bodyParser.raw({type: '*/*', only: ['creditReferral'], verify: function(req, res, body){ req.rawBody = body.toString(); }, where: 'server'}));
  Router.onBeforeAction( Iron.Router.bodyParser.urlencoded({ extended: false }), {where: 'server'});

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
  {except: ['register']});

}
