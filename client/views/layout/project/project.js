import './project.html';
import {Projects} from '../../../../lib/collections/Project.js';
import { Form } from '../../components/class/Form.js'
import { Parser } from '../../components/class/Parser.js'
import { Writer } from '../../components/class/Writer.js'
import {TimeLine} from "../../components/class/TimeLine.js"

var em;

// function which checked if the current has the right write on the proejct
hasRightToWrite = function(){
  var idProject = Router.current().params._id
  var project = Projects.findOne(idProject)
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

Template.project.onRendered(()=>{
  var pathXML = '/tmp/' + Router.current().params._id + '/annotation.xml'
  var pathExtractor

  if(!em){
    em = new EventDDP('test',Meteor.collection);
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
          var timelineData

          // update the forms of the editor
          $(forms).each(function(i,form){
            form.XMLObject = $($.parseXML(XMLDoc)).find(form.name)
            form.update()
          })
          // update the timeline
          $(".timeline").each(function(i,timeline){
            idTimeline = "#timeLine" + i
            nameExtractor = $(idTimeline).attr("extractor")
            timelineData = Parser.getTimelineData(xml,nameExtractor)
            timeline.items = $(timelineData).attr("data")
            timeline.nb_frame = $(timelineData).attr("nbFrames")
            //console.log('timelineData', timelineData)
            timeline.update()
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
  })

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
      var timelineData
      // global table which will contains the form objects
      forms = [extractors.lenght]
      timelines = [extractors.lenght]
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
            // build the forms for the editor
            XSDObject = resultExtractor.data
            forms[i] = new Form(i, nameExtractor,
              $($.parseXML(XMLDoc)).find(nameExtractor),
               $.parseXML(XSDObject),
              'nav-' + i,'hidden-' + i, 'form-'+ i)
            forms[i].buildForm('forms')

            // build the timeline
            timelineData = Parser.getTimelineData(XMLDoc,nameExtractor);
            $("#timeLines").append("<div id = 'timeLine" + i + "' class = 'row' style = 'display:none'></div>");
            timelines[i] = new TimeLine(nameExtractor,
            $(timelineData).attr('nbFrames'),$(timelineData).attr('data'),
            i);
          }
        })
      })

	  // VideoControler init
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
})

Template.project.onDestroyed(()=>{
    //put wrong values for the event => unsuscribe the user for the channel of this project
    em.setClient({
      appId: -1,
      _id: -1
    });
  });

Template.project.helpers({
    // used to display or not the save button
    hasRightToWrite(){
      return hasRightToWrite()
    }
});

Template.project.events({
  'click #saveForms'(event,instance){
    var XMLObject = $.parseXML(Session.get('XMLDoc'))
    var xml
    var result
    var timelineData
    var idTimeline
    var nameExtractor
    var idProject = Router.current().params._id
    var project = Projects.findOne(idProject)
    // check if the current user is the owner or a writer to the project
    var hasRight = hasRightToWrite()
    if(!hasRight){
      alert('Sorry, you does not have the right to modify this project.')
      $(forms).each(function(i,form){
        form.XMLObject = $(XMLObject).find('extractors').children(form.name)[0]
        form.update()
      })
    }else{
      $(forms).each(function(i,form){
        result = form.getXML()
        if(result !=  undefined){
          XMLObject = Writer.removeExtractor(XMLObject, form.name)
          XMLObject = Writer.addExtractor(XMLObject, result)
        }
      })
        xml = Writer.convertDocumentToString(XMLObject,0);
        Meteor.call("updateXML",project,xml,(err,result)=>{
          if(err){
            alert(err.reason);
          }else{
            // update the forms
            $(forms).each(function(i,form){
              // TODO maybe return the XML in result
              form.XMLObject = $(XMLObject).find('extractors').children(form.name)[0]
              form.update()
            })
            // update the timeLine
            $(timelines).each(function(i,timeline){
              idTimeline = "#timeLine" + i
              nameExtractor = $(idTimeline).attr("extractor")
              timelineData = Parser.getTimelineData(xml,nameExtractor)
             // console.log("data: " , $(timelineData).attr("data"))
              timeline.items = $(timelineData).attr("data");
              console.log('timelineData', timelineData)
              timeline.update()
            })
            console.log("ok!");
            em.emit('hello');
            // TODO call to update other elements

			// VideoControler update
			console.log("annotedFrames",Parser.getListTimeId(XMLDoc));
			vidCtrl.setAnnotedFrames(Parser.getListTimeId(XMLDoc));
          }
        });
      }
  },

  // check button event display form
  'click .filled-in'(event,instance){
    //toggle
    var id = $(event.currentTarget).attr('id')
    if($(event.currentTarget).attr('marked') == 'true'){
      $(event.currentTarget).attr('marked', 'false')
      $('#extractor' + id).attr('style', 'display:none')
      $('#timeLine' + id).css('display','none')
    }else{
      $(event.currentTarget).attr('marked', 'true')
      $('#extractor' + id).attr('style', 'display:block')
      $('#timeLine' + id).css('display', 'block');
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
