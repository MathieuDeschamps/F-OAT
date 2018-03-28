import { Logger } from 'meteor/ostrio:logger';
import {Projects } from "../lib/collections/Project.js";
import {Extractors} from "../lib/collections/extractors.js";
log = new Logger;


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
  this.response.statusCode =200;
  this.response.end("OK!");

})
.post( function() {
  this.response.statusCode =403;
  this.response.end("Forbidden");
})
.put( function() {
  //shitty example
  this.response.statusCode = 208;
  this.response.message = {titi : "ahahah"};

  const msg = '{"name":"John", "age":"22"}';

  var jsonObj = JSON.parse(msg);

  // convert JSON object to String
  var jsonStr = JSON.stringify(jsonObj);

  // read json string to Buffer
  const buf = new  Buffer(jsonStr);
  this.response.end(buf);
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

}else{

  Router.onBeforeAction(function(){
    //console.log("coucou");
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
