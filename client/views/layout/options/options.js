import './options.html'
import {Projects} from '../../../../lib/collections/Project.js';
import {Extractors} from '../../../../lib/collections/extractors.js';

import { Template } from 'meteor/templating';

var regex = RegExp('^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$');


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

    if(!regex.test(ipExtractor)){
        toastr.warning("The ip typed is invalid");
    }else{
      var extractor = {name: nameExtractor, ip: ipExtractor};
      Meteor.call('addExtractor',extractor,Meteor.user(),(err,result)=>{
        if(err){
          toastr.warning(err.reason);
        }
        else{

          if(result < 0){
              toastr.warning("Already exist");
          }else{
              toastr.success("Extractor added !");
          }

        }
      });
      }
  },

  'click #delete' (event,instance){
    var elm = event.target;
    var $elm = $(elm);
    Meteor.call('removeExtractor',$elm.attr('name'),Meteor.user());

  },

  'click #update' (event, instance){

    var $elm = $(event.target).closest('tr');
    console.log($elm);
    var extractor = {_id:$elm.find("#id").val() ,name: $elm.find("#name").val(), ip: $elm.find('#ip').val(), owner: Meteor.user().username};
    console.log(extractor);
    if(!regex.test(extractor.ip)){
        toastr.warning("The ip typed is invalid");
    }else{
      Meteor.call('updateExtractor',extractor)
    }


  }

});
