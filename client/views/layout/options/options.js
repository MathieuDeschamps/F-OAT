import './options.html'
import {Extractors} from '../../../../lib/collections/extractors.js';

import { Template } from 'meteor/templating';

var regex = RegExp('^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]):([0-9]{1,5})$');


Template.options.helpers({

  extractors: ()=>{
    return Extractors.find({owner : Meteor.user().username});
  },

});

Template.options.events({

  'click #submit' (event, instance){

    //ip RegExp
    var ipExtractor = $('.ip').val();
    var nameExtractor = $('.name').val();


      var extractor = {name: nameExtractor, ip: ipExtractor};

      if(!extractor.name){
        toastr.error(TAPi18n.__('errorExtractorEmpty'));
      }
      if(!extractor.ip){
        toastr.error(TAPi18n.__('errorExtractorIPEmpty'));
      }

      else if(!regex.test(extractor.ip)){
          toastr.error(TAPi18n.__('errorExtractorIPWrong'));
      }
      else{
        Meteor.call('addExtractor',extractor,Meteor.user(),(err,result)=>{
          if(err){
            toastr.error(err.reason);
          }
          else{

            if(result < 0){
                toastr.error(TAPi18n.__('errorExtractorExists'));
            }else{
                toastr.success(TAPi18n.__('successExtractor'));
            }

          }
        });
      }

  },

  'click #delete' (event,instance){
    var elm = event.target;
    var $elm = $(elm);
    Meteor.call('removeExtractor',$elm.attr('name'),Meteor.user(),function(err,res){
      if(err){
        toastr.error(err.reason);
      }
      else{
        toastr.success(TAPi18n.__('successExtractorRemoved'));
      }
    });
  },

  'click #update' (event, instance){

    var $elm = $(event.target).closest('tr');
    var extractor = {_id:$elm.find("#id").val() ,name: $elm.find("#name").val(), ip: $elm.find('#ip').val(), owner: Meteor.user().username};
    if(!regex.test(extractor.ip)){
        toastr.error(TAPi18n.__('errorExtractorIPWrong'));
    }else{
      Meteor.call('updateExtractor',extractor,function(err,res){
        if(err){
          toastr.error(err.reason);
        }
        else{
          if(res<0){
            toastr.error(TAPi18n.__('errorExtractorExists'));
          }
          else{
            toastr.success(TAPi18n.__('successExtractorUpdate'));
          }
        }
      });
    }


  }

});
