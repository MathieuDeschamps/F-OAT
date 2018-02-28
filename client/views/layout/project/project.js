import './project.html';
import {Projects} from '../../../../lib/collections/Project.js';
var em;

Template.project.onRendered(()=>{

if(!em){
  em = new EventDDP('test',Meteor.collection);
  em.addListener('hello',()=>{
    console.log('tralala1');
  });
}
  em.setClient({
    appId: Router.current().params._id,
    _id: Meteor.userId()
  })

  console.log(em);
});

Template.project.onDestroyed(()=>{

  //put wrong values for the event => unsuscribe the user for the channel of this project
  em.setClient({
    appId: -1,
    _id: -1
  });
});
Template.project.events({
    'click #ddp'(event,instance){
      alert("ok!");
      em.emit('hello');
    },
    //Test to merge XML file
    'click #testmerge1'(event,instance){
      var MergeXML = require('mergexml');
      var oMX = new MergeXML();
      var project = Projects.findOne(Router.current().params._id);
      //Récupération du fichier XML déjà créé sur le serveur
      Meteor.call("getXml","/tmp/"+project._id+"/annotation.xml",(err,result)=>{
        if(err){
          alert(err.reason);
        }else{
          oMX.AddSource(result.data);
          console.log(oMX.Get(1));
          if(oMX.error.code!==''){
            console.log('Merge Error annotation.xml '+oMX.error.text);
          }
          else{
            //Merge avec un nouveau fichier XML.
            Meteor.call("getXml","/home/elliot/Documents/cours_meteor/F-OAT/server/xmlFiles/testmerge1.xml",(err,result)=>{
              if(err){
                alert(err.reason);
              }else{
                oMX.AddSource(result.data);
                console.log(oMX.Get(1));
                if(oMX.error.code !== ''){
                  console.log("Merge Error new file "+oMX.error.text);
                }
                else if(oMX.count<2){
                  console.log("Merge Error : 2 files needed");
                }
                else{
                  Meteor.call("mergeXML",project,oMX.Get(1),(err,result)=>{
                    if(err){
                      alert(err.reason);
                    }
                  })
                }
            }});
          }
      }});
    },

    //Test2 to merge XML file
    'click #testmerge2'(event,instance){
      var MergeXML = require('mergexml');
      var oMX = new MergeXML();
      var project = Projects.findOne(Router.current().params._id);
      //Récupération du fichier XML déjà créé sur le serveur
      Meteor.call("getXml","/tmp/"+project._id+"/annotation.xml",(err,result)=>{
        if(err){
          alert(err.reason);
        }else{
          oMX.AddSource(result.data);
          if(oMX.error.code!==''){
            console.log('Merge Error annotation.xml '+oMX.error.text);
          }
          else{
            //Merge avec un nouveau fichier XML.
            Meteor.call("getXml","/home/elliot/Documents/cours_meteor/F-OAT/server/xmlFiles/testmerge2.xml",(err,result)=>{
              if(err){
                alert(err.reason);
              }else{
                oMX.AddSource(result.data);
                if(oMX.error.code !== ''){
                  console.log("Merge Error new file "+oMX.error.text);
                }
                else if(oMX.count<2){
                  console.log("Merge Error : 2 files needed");
                }
                else{
                  Meteor.call("mergeXML",project,oMX.Get(1),(err,result)=>{
                    if(err){
                      alert(err.reason);
                    }
                  })
                }
            }});
          }
      }});
    }*/m
});

Template.project.helpers({
});
