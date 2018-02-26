import './project.html';
import {Projects} from '../../../../lib/collections/Project.js';

Template.project.onRendered(()=>{
  // var path = '/tmp/' + Router.current().params._id + '/annotation.xml'
  //
  // Meteor.call("getXml",path,(err,result)=>{
  //   if(err){
  //     alert(err.reason);
  //   }else{
  //     Session.set('xmlDoc', result.data)
  //     console.log('project.js', Session)
  //   }
  // })
})

Template.project.events({

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
    }
});

Template.project.helpers({});
