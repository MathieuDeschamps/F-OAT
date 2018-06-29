import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Projects} from '../../../../lib/collections/projects.js';
import {Writer} from '../../components/class/Writer.js'
import './team.html';

projectExists = function(){
  var idProject = Router.current().params._id;
  var project = Projects.findOne(idProject);
  if(!project){
    return false
  }
  return true;
}

var project;
var API_KEY = 'ef18ae37';

Template.team.onCreated(function(){
  Session.set("search/keyword","");
});


Template.team.onRendered(function(){
  if(projectExists()){
    project = Projects.findOne({_id : Router.current().params._id });
    if(Meteor.user().username != project.owner){
      Router.go('noRight');//current user can't access to this page
    }
    $('.single-select').material_select();
  }
});
Template.team.events({

  /**
  Remove a participants of the team
  */
  'click .delete' (event,instance){
    Meteor.call('removeParticipant',Router.current().params._id,this.username,function(err,res){
      if(err){
        toastr.warning(err.reason);
      }
      else{
        toastr.success(TAPi18n.__("participantRemoved"));
      }
    })
  },

  /**
  Update the right of a participant of the team
  */
  'click .rightChange' (event,instance){
    var $buttonEvent = $(event.target);
    var newRight = $buttonEvent.closest('tr').find('select').val();
    Meteor.call('changeRight',Router.current().params._id,this.username,newRight,(error,result)=>{
      if(error){
        alert(error.reason);
      }else if(result === 2){
        Router.go("/")
        toastr.success(TAPi18n.__('rightChanged'));
      }
      else{
        toastr.success(TAPi18n.__('rightChanged'));
      }
    })
  },

  /**
  Add a coworker to the team
  */
  'click .newCoworker' (event,instance){

    var newCoworker_name = $('.newCoworker_name').val();
    var newCoworker_right = $('select.newCoworkerRight').val();
    if(!newCoworker_name){
      $('#name').addClass("invalid");
    }else{
      $('#name').addClass("valid");
      Meteor.call("userNameExist",newCoworker_name,(err,result)=>{
        if(err){
          alert(err.reason);
        }else if(!result){
          toastr.warning(TAPi18n.__('errorUserNoExists'));
        }else{
          Meteor.call("getParticipants",Router.current().params._id,(err,result)=>{
            if(err){
              return;
            }
            var participants = Object.values(result);
            var present=false;
            participants.forEach(
              (item)=>{
                  if(item.username === newCoworker_name){
                    present = true;
                    return;
                  }
              }
            );
            if(!present && newCoworker_name != project.owner){
              Meteor.call("addParticipant",Router.current().params._id, newCoworker_name, newCoworker_right, function(error,result){
                if(error){
                  toastr.warning(error.reason);
                }
              });
            }else{
              toastr.warning(TAPi18n.__('errorUserAlready', {user :  newCoworker_name}));
            }
          });
        }
      });
    }
  },

  //On typing of search input
  'keyup #name': function(event) {
    Session.set('search/keyword', event.target.value);
  },

  'click .option' : function(event,instance){
    var _newParticipants = $('#participant').val();
    if(_newParticipants.length==1){
      $('.newCoworker_name').val(_newParticipants[0]);
    }
  },

  'click #modifyMovie'(event,instance){
    var movieTitle = $('#filmTitle').val();
    var movie = movieTitle.split(',');
    var idProject = Router.current().params._id;
    $.get('https://www.omdbapi.com/?apikey='+API_KEY+'&t='+encodeURI(movie[0])+'&y='+encodeURI(movie[1])+'&r=xml',function(data){
      var result = $(data).find('root').find('movie');
      result.removeAttr('poster')
            .removeAttr('metascore')
            .removeAttr('imdbRating')
            .removeAttr('imdbVotes')
            .removeAttr('imdbID');

      var xmltostring = Writer.convertDocumentToString(result[0],1);
      Meteor.call('modifyDefaultExtractor',idProject,xmltostring,function(error,result){
        if(error){
          toastr.warning(error.reason);
        }
        else{
          toastr.success(TAPi18n.__('titleChanged'));
          $('#filmTitle').val('');
          $('#modifyMovie').attr('disabled',true);

          //Call eventLiveUpdate to update the content for all users on page
          if(!eventLiveUpdate){
            eventLiveUpdate = new EventDDP('liveUpdate',Meteor.connection);
          }

          eventLiveUpdate.setClient({
            appId: Router.current().params._id,
            _id: Meteor.userId()
          });

          var extractor = result.id;
          var version = result.version.replace('.','-');
          var name = result.name;
          var xml = '<'+extractor+' name="'+name+'" version="'+version+'">';
          xml += '<'+name+'>';
          xml += xmltostring;
          xml += '</'+name+">";
          xml += "</"+extractor+">";
          var idVisualizer = extractor+"_"+version;
          eventLiveUpdate.emit("liveUpdate",idVisualizer,xml);

          eventLiveUpdate.setClient({
            appId: -1,
            _id: -1
          });
        }
      });
    });
  }
});


Template.team.helpers({
  Owner: function(){
    return Projects.findOne(Router.current().params._id).owner;
  },

  Project: function(){
    return Projects.findOne(Router.current().params._id);
  },

  projectExists(){
    return projectExists();
  },


  users(){
    var keyword = Session.get("search/keyword");
    if(keyword!=null && keyword!=""){
      var regexp = new RegExp("^"+Session.get('search/keyword'),"i");
      var owner = Meteor.userId();
      var users = Meteor.users.find({ $and : [{username: regexp},{_id: {$ne:owner}}]});
      return users;
    }
  }

});

Template.team.onDestroyed(function(){
  eventLiveUpdate.setClient({
    appId: -1,
    _id: -1
  });
});
