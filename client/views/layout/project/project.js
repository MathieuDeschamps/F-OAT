import './project.html';
import {Projects} from '../../../../lib/collections/Project.js';
import { Form } from '../../components/class/Form.js'
import { Parser } from '../../components/class/Parser.js'
import { Writer } from '../../components/class/Writer.js'
import {TimeLine} from "../../components/class/TimeLine.js"
import {XMLGenerator} from '../../components/XMLGenerator/XMLGenerator.js';

var em;
var vidctrllistener;
var deleteprojectlistener;

// function which checked if the current has the right write on the proejct
hasRightToWrite = function(){
  var idProject = Router.current().params._id
  var project = Projects.findOne(idProject)
  if(!project){
    return false;
  }
  var username = Meteor.user().username
  var participant = $(project.participants).filter(function(i,p){
    return p.username == username && p.right == "Write"
  })
  if(project.owner == username || participant.length > 0){
    return true
  }else{
    return false
  }
}

projectExists = function(){
  var idProject = Router.current().params._id;
  var project = Projects.findOne(idProject);
  if(!project){
    return false
  }
  return true;
}

Template.project.onCreated(()=>{
  Session.set('projectReady',0);
});

Template.project.onRendered(()=>{
  if(projectExists()){
    var pathXML = '/tmp/' + Router.current().params._id + '/annotation.xml'
    var pathExtractor

    if(!em){
      em = new EventDDP('test',Meteor.connection);
      em.addListener('hello',()=>{
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
            var timeLineData

            // update the forms of the editor
            $(xmlxsdObjAnnotations).each(function(i,form){
              form.XMLObject = $($.parseXML(XMLDoc)).find(form.name)
              form.update()

            })
            // update the timeLine
            $(timeLines).each(function(i,timeLine){
              idTimeLine = "#timeLine" + i
              nameExtractor = timeLine.nameExtractor
              // console.log('xml', xml)
              timeLineData = Parser.getTimeLineData(XMLDoc,nameExtractor)
              // console.log("data: " , $(timeLineData).attr("data"))
              timeLine.nb_frame = $(timeLineData).attr('nbFrames');
              timeLine.entries = []
              $($(timeLineData).attr("data")).each(function(i,e){
                timeLine.entries.push(e.name)
              })
              timeLine.items = []
              $($(timeLineData).attr("data")).each(function(i,entry){
                $(entry.intervals).each(function(j,interval){
                  timeLine.items.push(interval)
                })
              })
              // console.log('timeLineData', timeLineData)
              timeLine.update()
            })

            //Video controler update :
            var nbFrames=0;
            extractors.forEach(function(extractor){
              console.log('nb Frame',extractor);
              var newNbFrames=Parser.getNbFrames(XMLDoc,extractor);
              console.log(newNbFrames);
              if (newNbFrames!=undefined){
                console.log(newNbFrames);
                nbFrames=Math.max(nbFrames,newNbFrames);
                console.log(nbFrames);
              }
            });
            if (nbFrames>0){
              vidCtrl.setNbFrames(nbFrames);
            }
            console.log("annotedFrames",Parser.getListTimeId(XMLDoc));
            vidCtrl.setAnnotedFrames(Parser.getListTimeId(XMLDoc));

          }
        });

      });
    }
    em.setClient({
      appId: Router.current().params._id,
      _id: Meteor.userId()
    });

    if(!eventDeleteProject){
      eventDeleteProject = new EventDDP('deleteProject',Meteor.connection);
    }
    if(!deleteprojectlistener){
      deleteprojectlistener = true;
      //Event emitted in dashboard.js
      eventDeleteProject.addListener('deleteProject',()=>{
        toastr.warning(TAPi18n.__('projectDeleted'));
        Router.go("/");
      });
    }
    eventDeleteProject.setClient({
      appId: Router.current().params._id,
      _id: Meteor.userId()
    });

Meteor.call("getXml",pathXML,(errXML,result)=>{
  if(errXML){
    alert(errXML.reason);
  }else{
    Session.set('XMLDoc', result.data)
    var XMLDoc = result.data
    var XMLParsed = $.parseXML(result.data)
    // build the extractors
    var extractors = Parser.getListExtractors(XMLDoc)
    var extractorHtml
    var timeLineData
    // global table which will contains the form objects
    xmlxsdObjAnnotations = [extractors.lenght]
    xsdArray = [extractors.lenght]
    xmlArray = [extractors.lenght]
    timeLines = [extractors.lenght]
    console.log('extractors', extractors)
    // add the extractor list and build the forms
    $(extractors).each(function(i,extractor){
      // extractorHtml = '<p><input class="filled-in" id="annontation_'+ i + '" index="'+ i+ '"  type="checkbox"/>'
      // extractorHtml += '<label for="annontation_'+ i + '">' + $(extractor).attr('name') + '</label></p>'
      // $('#configAnnotation').append(extractorHtml)
      // console.log('extractor', extractor)
      pathExtractor  = '/tmp/'+ extractor[0].tagName + '/' + $(extractor).attr('version') + '/descriptor.xsd'
      Meteor.call("getXml",pathExtractor,(errXSD,resultExtractor)=>{
        if(errXSD){
          // console.log('path', pathExtractor)
          alert(errXSD.reason);
        }else{
          // build the forms for the editor
          var tmpXML = $(XMLParsed).find('extractors').children().filter(function(){
            return ($(this).prop('tagName') === $(extractor).prop('tagName') &&
                $(this).attr('version') === $(extractor).attr('version'))

          })
          if(tmpXML.length === 1){
            xmlArray[i] = tmpXML
          }
          // console.log('tmpXML',tmpXML[0])
          // var tmpXml = $(XMLParsed).find('extractors').children(extractor[0].tagName)
          // console.log('tmpXml', tmpXml)
          // xmlArray[i]= $(tmpXml).filter(function(){
          //   if($(this).attr('version') === $(extractor).attr('version')){
          //     return true
          //   }
          // })
          // console.log('xmlArrayi', xmlArrayi)
          xsdArray[i] = $.parseXML(resultExtractor.data)
          // console.log('XMLArray', XMLArray)
          // console.log('XSDArray', XSDArray)
          // console.log("vidctrl",vidCtrl);

          if(i+1 === extractors.length){
            Session.set('projectReady', 1)
          }
          // build the timeLine
          // timeLineData = Parser.getTimeLineData(XMLDoc,extractor[0].tagName);
          // $("#timeLines").append("<div id='timeLine" + i + "' class='row' ></div>");
          // timeLines[i] = new TimeLine($(extractor).attr('name'),
          //   $(timeLineData).attr('nbFrames'),$(timeLineData).attr('data'),
          //   i);
          //
          // $("#timeLine" + i).children('svg').css('min-width','70rem')
          // $('svg').css('margin-bottom', '2.5rem')
        }
      })
    })


            //Wait for video player to be rendered before doing that
            Tracker.autorun(function doWhenVideoPlayerRendered(computation) {
              if(Session.get('videoPlayer') === 1) {

                // VideoControler init
                var nbFrames=0;
                extractors.forEach(function(extractor){
                  // console.log('nb Frame',extractor);
                  var newNbFrames=Parser.getNbFrames(XMLDoc,extractor);
                  // console.log(newNbFrames);
                  if (newNbFrames!=undefined){
                    // console.log(newNbFrames);
                    nbFrames=Math.max(nbFrames,newNbFrames);
                    // console.log(nbFrames);
                  }
                });
                if (nbFrames>0){
                  vidCtrl.setNbFrames(nbFrames);
                }
                console.log("annotedFrames",Parser.getListTimeId(XMLDoc));
                vidCtrl.setAnnotedFrames(Parser.getListTimeId(XMLDoc));

                if(!vidctrllistener){
                  vidctrllistener = true;
                  //Event emitted in videoPlayer.js
                  eventDDPVideo.addListener('videoCtrl',()=>{
                    var nbFrames=0;
                    extractors.forEach(function(extractor){
                      // console.log('nb Frame',extractor);
                      var newNbFrames=Parser.getNbFrames(XMLDoc,extractor);
                      console.log(newNbFrames);
                      if (newNbFrames!=undefined){
                        console.log(newNbFrames);
                        nbFrames=Math.max(nbFrames,newNbFrames);
                        console.log(nbFrames);
                      }
                    });
                    if (nbFrames>0){
                      vidCtrl.setNbFrames(nbFrames);
                    }
                    console.log("annotedFrames",Parser.getListTimeId(XMLDoc));
                    vidCtrl.setAnnotedFrames(Parser.getListTimeId(XMLDoc));
                  });
                }

                computation.stop();
              }
            });

          }
        });
      }
    })

    Template.project.onDestroyed(()=>{
      //put wrong values for the event => unsuscribe the user for the channel of this project
      if(em!=null){
        em.setClient({
          appId: -1,
          _id: -1
        });
      }

      if(eventDeleteProject!=null){
        eventDeleteProject.setClient({
          appId: -1,
          _id: -1
        });
      }

      Session.set('projectReady', 0);

    });

    Template.project.helpers({
      // used to display or not the save button

      projectExists(){
        return projectExists();
      },

      hasRightToWrite(){
        return hasRightToWrite()
      },

      uploadIsDone(){
        var idProject = Router.current().params._id;
        var idUpload = "upload_"+idProject;
        var upload = Session.get(idUpload);
        if(!upload){
          return true;
        }
        return (upload==100);
      },

      uploading(){
        var idProject = Router.current().params._id;
        var idUpload = "upload_"+idProject;
        var upload = Session.get(idUpload);
        $("#myBar").width(upload+"%");

        return upload;
      },

  file(){
    return Projects.findOne(Router.current().params._id).url;
  }
});

Template.project.events({
  'click #saveForms'(event,instance){
    var XMLObject = $.parseXML(Session.get('XMLDoc'))
    var xml
    var result
    var timeLineData
    var idTimeLine
    var nameExtractor
    var idProject = Router.current().params._id
    var project = Projects.findOne(idProject)
    // check if the current user is the owner or a writer to the project
    var hasRight = hasRightToWrite()
    if(!hasRight){
      toastr.warning(TAPi18n.__('errorProjectRight'));
      $(xmlxsdObjAnnotations).each(function(i,form){
        form.XMLObject = $(XMLObject).find('extractors').children(form.name)[0]
        // form.update()
      })
    }else{
      $(xmlxsdObjAnnotations).each(function(i,xmlxsdObjAnnotation){
        var gen=new XMLGenerator(xmlxsdObjAnnotation);
  			console.log(gen.generateXML());
  			var annotationXML=gen.generateXML();
        console.log('xml',xmlArray[i])
        // result = form.getXML()
        // if(result !=  undefined){
        //   XMLObject = Writer.removeExtractor(XMLObject, form.name)
        //   XMLObject = Writer.addExtractor(XMLObject, result)
        // }
      })
      // xml = Writer.convertDocumentToString(XMLObject,0);
      // Meteor.call("updateXML",project,xml,(err,result)=>{
      //   if(err){
      //     alert(err.reason);
      //   }else{
      //     // update the forms
      //     $(xmlxsdObjAnnotations).each(function(i,form){
      //       // TODO maybe return the XML in result
      //       form.XMLObject = $(XMLObject).find('extractors').children(form.name)[0]
      //       form.update()
      //     })
      //     // update the timeLine
      //     $(timeLines).each(function(i,timeLine){
      //       idTimeLine = "#timeLine" + i
      //       nameExtractor = timeLine.nameExtractor
      //       console.log("nameExtractor" , nameExtractor)
      //       // console.log('xml', xml)
      //       timeLineData = Parser.getTimeLineData(xml,nameExtractor)
      //       // console.log("data: " , $(timeLineData).attr("data"))
      //       timeLine.nb_frame = $(timeLineData).attr('nbFrames');
      //       timeLine.entries = []
      //       $($(timeLineData).attr("data")).each(function(i,e){
      //         timeLine.entries.push(e.name)
      //       })
      //       timeLine.items = []
      //       $($(timeLineData).attr("data")).each(function(i,entry){
      //         $(entry.intervals).each(function(j,interval){
      //           timeLine.items.push(interval)
      //         })
      //       })
      //       // console.log('timeLineData', timeLineData)
      //       timeLine.update()
      //     })
      //     console.log("ok!");
      //     em.emit('hello');
      //     // TODO call to update other elements
      //
      //     // VideoControler update
      //     console.log("annotedFrames",Parser.getListTimeId(xml));
      //     vidCtrl.setAnnotedFrames(Parser.getListTimeId(xml));
      //   }
      // });
    }
  },

  // // check button event display form
  // 'click .filled-in'(event,instance){
  //   //toggle
  //   var index = $(event.currentTarget).attr('index')
  //   // console.log('id', index);
  //   if($(event.currentTarget).prop('checked')){
  //     $('#' + index + '_formConfigAnnontation').css('display', 'block')
  //     $('#time_line_' + index).css('display','block')
  //   }else{
  //     $('#' + index + '_formConfigAnnontation').css('display', 'none')
  //     $('#time_line_' + index).css('display', 'none');
  //   }
  // },

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
