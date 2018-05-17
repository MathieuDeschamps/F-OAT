import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Projects} from '../../../../lib/collections/Project.js';
import './newProject.html';

Template.newproject.onCreated(function(){
    Session.set('postSubmitErrors',{});
});

Template.newproject.helpers({
  errorMessage: function(field){
    return Session.get('postSubmitErrors')[field];
  },
  errorClass: function(field){
    return !!Session.get('pos tSubmitErrors')[field] ? 'has-error' : '';
  },
   users(){
      var regexp = new RegExp(Session.get('search/keyword'));
      return Meteor.users.find({username: regexp});
   }
});

Template.newproject.events({

    'click #newProjectForm' (event,instance){
        event.preventDefault();
        var _projectName = $('.projectName').val();
        var _projectUrl = $('.url').val();
        var _downUrl = $('.downUrl').val();

        var _projectFile = $('#selectedFile')[0].files[0];

        /*var _participant = $('.participant').val();*/
        var _participant = $('#participant').val();

        var _participant2 = [];

        if (participant =! [])
          for(var i=0; i<_participant.length;i++){
            _participant2.push({username: _participant[i],
              rigth: 'Read'});
            }//endfor

        var _url = 'error';
        //If we give an URL for the project
        if(!_projectFile){
            _url = _projectUrl;
            if(_url!='' && !_downUrl){//we need a download link for the video
                _downUrl = 'error';
                //toastr.warning("We need a download link!");
                //return;
            }
        }

        //Else, if we give a file for the project
        else if(!_projectUrl){
            _url = _projectFile.name;
            ext = ['mp4','avi','mkv','wmv','mov'];
            if(!checkExtension(ext,_url)){
                _url = 'errorExt';
            }
            if(_downUrl!=''){
              _downUrl = 'errorFile'
            }
        }

        var ownerId = Meteor.user();
        var project = {
            name: _projectName,
            owner: ownerId.username,
            url: _url,
            downUrl: (_downUrl ? _downUrl : null),
            participants:_participant2,
            notifications:[]
        };

        //We verify the name and the url of the project (not null and not already used)

        var errors = validateProject(project);
        if(errors.name || errors.url || errors.file || errors.downUrl){
            return Session.set('postSubmitErrors',errors);
        }

        Meteor.call('saveDocument', project, function(err, res){
            if(err){
                alert("error insert");
            }else{
                if(_projectFile){
                    //Get the data of the file
                    reader = new FileReader();

                    //When reading file is done
                    reader.onload = function(event){
                        var nameV = project.url;
                        nameV = nameV.replace('.mp4', '');
                        var buffer = reader.result;
                        //Call a method from project.js on server side
                        Meteor.call('createFile', res, project, buffer, nameV , function(error, result){

                            if(error){
                                alert(error.reason);
                            }
                            else{
                                //Create a notification if the file has been uploaded
                                Projects.update({
                                    _id: res
                                }, {
                                    $push: {notifications: {date: new Date().toString(), value: "Your file "+project.url+" has been uploaded."}}
                                });
                            }
                        });
                    }
                    reader.readAsDataURL(_projectFile); //read the file as base64 dataURL
                    Router.go("/");
                }
                else{
                    Meteor.call('createXMLFile',res,function(error,result){
                      if(error){
                        alert(error.reason);
                      }
                    });
                    Router.go("/");
                }
            }
        });
    },
    'keyup #search': function(event) {
        Session.set('search/keyword', event.target.value);
    }
});


// This function is used to check that the file is a video
function checkExtension(verifExt, fileValue){
    var fileExtension = fileValue.substring(fileValue.lastIndexOf(".")+1, fileValue.lenght);
    fileExtension = fileExtension.toLowerCase();
    for (var ext of verifExt){
        if(fileExtension==ext){
            return true;
        }
    }
    return false;
}
