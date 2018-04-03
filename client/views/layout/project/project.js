import './project.html';
import { Form } from '../../components/class/Form.js'
import {Projects} from '../../../../lib/collections/Project.js';
import { Parser } from '../../components/class/Parser.js'
var em;

Template.project.onRendered(()=>{

  if(!em){
    em = new EventDDP('test',Meteor.collection);
    em.addListener('hello',()=>{
      // TODO move to the right place with the right code
      //maybe in editor.js event save
      console.log('je me met à jour!');
    });
  }
  em.setClient({
    appId: Router.current().params._id,
    _id: Meteor.userId()
  })
  console.log(em)
  var pathXML = '/tmp/' + Router.current().params._id + '/annotation.xml'
  var pathExtractor

  Meteor.call("getXml",pathXML,(errXML,result)=>{
    if(errXML){
      alert(errXML.reason);
    }else{
      Session.set('XMLDoc', result.data)
      var XMLDoc = result.data
      var XSDObject
      // build the extractors
      var extractors = Parser.getListExtractors(XMLDoc)
      var extractor
      // global table which will contains the form objects
      forms = [extractors.lenght]
      // add the extractor list and build the forms
      $(extractors).each(function(i,nameExtractor){
        extractor = '<p><input class="filled-in"  id="'+ i + '"  type="checkbox" mark="false"/>'
        extractor += '<label for="'+ i + '">' + nameExtractor + '</label></p>'
        $('#extractors').append(extractor)
        pathExtractor  = '/tmp/'+ nameExtractor + '/descriptor.xml'
        Meteor.call("getXml",pathExtractor,(errXSD,resultExtractor)=>{
          if(errXSD){
            alert(errXSD.reason);
          }else{
            XSDObject = resultExtractor.data
            forms[i] = new Form(i, nameExtractor,
              $($.parseXML(XMLDoc)).find(nameExtractor),
               $.parseXML(XSDObject),
              'nav-' + i,'hidden-' + i, 'form-'+ i)
              forms[i].buildForm('forms')
            }
          })
        })
      }
    });
  })
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

    // check button event display form
  'click .filled-in'(event,instance){
    //toggle
    var id = $(event.currentTarget).attr('id')
    if($(event.currentTarget).attr('marked') == 'true'){
      $(event.currentTarget).attr('marked', 'false')
      $('#extractor' + id).attr('style', 'display:none')
      $('#timeLine' + id).attr('style', 'display:none')
    }else{
      $(event.currentTarget).attr('marked', 'true')
      $('#extractor' + id).attr('style', 'display:block')
      $('#timeLine' + id).attr('style', 'display:block')
    }
  },

/*  Code du merge, à garder pour le moment et à réutiliser dès que les extracteurs sont utilisables.
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
                  Meteor.call("getXml","/home/elliot/Documents/cours_meteor/F-OAT/server/xmlFiles/testmerge3.xml",(err,result)=>{
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
                        Meteor.call("updateXML",project,oMX.Get(1),(err,result)=>{
                          if(err){
                            alert(err.reason);
                          }
                        });
                      }
                    }
                  });
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
                      Meteor.call("updateXML",project,oMX.Get(1),(err,result)=>{
                        if(err){
                          alert(err.reason);
                        }
                      })
                    }
                  }});
                }
              }});
            }*/
          });

          Template.project.helpers({
          });
