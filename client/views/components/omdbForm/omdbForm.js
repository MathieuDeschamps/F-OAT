import { Template } from 'meteor/templating';
import {Projects} from '../../../../lib/collections/projects.js';
import {Writer} from '../../components/class/Writer.js'

import './omdbForm.html'

Template.omdbForm.onCreated(function(){
  Session.set('searchTitles',[]);
  Session.set('postSearchErrors',{});
});

Template.omdbForm.helpers({

  errorSearchMessage : function(field){
    return Session.get('postSearchErrors')[field];
  },

  errorSearchClass : function(field){
    return !!Session.get('postSearchErrors')[field] ? 'has-error' : '';
  },

  searchTitles: function(){
    return Session.get('searchTitles');
  }

});


Template.omdbForm.events({
  //Click on the search button will give a list of titles that matches the title given
  'click #searchMovie' (event,instance){
      var movie = $('#filmTitle').val();
      var errors = {}
      if(movie!='' && movie!=null){
        $('#searchMovie').attr('disabled',true);
        $('#searchLoading').addClass('active');
        var titles = [];
        Session.set('searchTitles',titles);
        console.log("METEOR SETTINGS",Meteor.settings.public);
        console.log("METEOR SETTINGS",Meteor.settings.public.omdbapi_key);

        //Do a search request on omdbapi with the title given by user
        $.get('https://www.omdbapi.com/?apikey='+Meteor.settings.public.omdbapi_key+'&s='+encodeURI(movie)+'&r=xml',function(data){
          var results = $(data).find('root').children('result[title]');
          if(results.length==0){
            errors.search = TAPi18n.__('errorSearch');
            $('#searchMovie').removeAttr('disabled');
            $('#searchLoading').removeClass('active');
            return Session.set('postSearchErrors',errors);
          }
          else{
            $(results).each(function(i,result){
              titles.push({title: $(result).attr('title'), date: $(result).attr('year')});
            });
          }
          $('#searchMovie').removeAttr('disabled');
          $('#searchLoading').removeClass('active');
          Session.set('searchTitles',titles);
        });
      }
      else{
        errors.search = TAPi18n.__('errorSearchNull');
      }
      return Session.set('postSearchErrors',errors);
  },

  //Avoid user to validate if the title is just what he wrote and not what he selected in the list
  'keyup #filmTitle' (event,instance){
    $('#filmTitle').attr('name','false');
    $('#modifyMovie').attr('disabled',true);
  },

  //Click on one of the options given in the list of title from research
  'click .select_title'(event,instance){
    var elm = event.target;
    var $elm = $(elm);
    $('#filmTitle').val($elm.attr('name'));
    $('#filmTitle').attr('name','true');
    $('#modifyMovie').removeAttr('disabled');
    Session.set('searchTitles',[]);
  }

});
