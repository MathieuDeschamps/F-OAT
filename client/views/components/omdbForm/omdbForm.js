import { Template } from 'meteor/templating';
import {Projects} from '../../../../lib/collections/projects.js';
import {Writer} from '../../components/class/Writer.js'

import './omdbForm.html'

var API_KEY = 'ef18ae37';

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

  'click #searchMovie' (event,instance){
      var movie = $('#filmTitle').val();
      var errors = {}
      if(movie!='' && movie!=null){
        $('#searchMovie').attr('disabled',true);
        $('#searchLoading').addClass('active');
        var titles = [];
        Session.set('searchTitles',titles);
        $.get('https://www.omdbapi.com/?apikey='+API_KEY+'&s='+encodeURI(movie)+'&r=xml',function(data){
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

  'keyup #filmTitle' (event,instance){
    $('#filmTitle').attr('name','false');
    $('#modifyMovie').attr('disabled',true);
  },

  'click .select_title'(event,instance){
    var elm = event.target;
    var $elm = $(elm);
    $('#filmTitle').val($elm.attr('name'));
    $('#filmTitle').attr('name','true');
    $('#modifyMovie').removeAttr('disabled');
    Session.set('searchTitles',[]);
  }

});
