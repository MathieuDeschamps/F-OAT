export class Parser{

  // return a JSON object with the startTime and endTime of Scenes shots and frames
  static getTimelineData(xml,nameExtractor){
    if(xml == undefined || nameExtractor == undefined){
      console.log('getTimelineData : Illegal Argument Exception')
    }else{
      var XMLObject = $.parseXML(xml)
      // retrieve the list from XML file in jQuerry
      var listScenes = $(XMLObject).find('extractors').children(nameExtractor).find('scene')
      var listShots = $(XMLObject).find('extractors').children(nameExtractor).find('shot')
      var listFrames = $(XMLObject).find('extractors').children(nameExtractor).find('frame')

      // the object returns
      var timeline ={}
      timeline.frameRate = parseFloat($(XMLObject).find('header').find('video').attr('fps'))
      timeline.nbFrames= Parser.getNbFrames(xml, nameExtractor)
      timeline.data = []
      // add frame to the array
      for(i=0; i < listFrames.length; i++){
        timeline.data.push({ "entry" : 0 , "start" : parseInt($(listFrames[i]).attr('timeId')), "end" : parseInt($(listFrames[i]).attr('timeId')) });
      }
      // add shot to the array
      for(i=0; i < listShots.length; i++){
        timeline.data.push({ "entry" : 1 , "start" : parseInt($(listShots[i]).attr('startFrame')), "end" : parseInt($(listShots[i]).attr('endFrame')) });

      }
      // add shot to the array
      for(i=0; i < listScenes.length; i++){
        timeline.data.push({ "entry" : 2 , "start" : parseInt($(listScenes[i]).attr('startFrame')), "end" : parseInt($(listScenes[i]).attr('endFrame')) });
      }

      // console.log("getTimelineData",timeline)
      return timeline
    }
  }

  // TODO improve to deal the element which have the same tag
  // but not the same parents
  // return a JSON object with the start and end
  // static getTimelineData(xml,nameExtractor){
  //   var XMLObject = $.parseXML(xml)
  //   var result = []
  //   var data =[]
  //   var intervals = $(XMLObject).find('extractors').children(nameExtractor)
  //   var intervalName
  //   var start
  //   var end
  //   var added = false
  //   var frameRate = parseFloat($(XMLObject).find('header').find('video').attr('fps'))
  //   var nbFrame = Parser.getNbFrames(xml, nameExtractor)
  //
  //
  // //TODO timeId case
  //   intervals = $(intervals).find('[startFrame][endFrame]')
  //   $(intervals).each(function(i,interval){
  //     intervalName = interval.tagName
  //     start = parseInt($(interval).attr('startFrame'))
  //     end = parseInt($(interval).attr('endFrame'))
  //     $(data).each(function(i,e){
  //       if($(e).attr('name') == intervalName){
  //         data.push({'start': start, 'end': end})
  //         added = true
  //       }
  //     })
  //     if(!added){
  //       data.push({'name': intervalName, 'data' : [
  //         {'start' : start, 'end' : end}
  //       ]})
  //     }
  //   })
  //
  //   result.push({'frameRate': frameRate, 'nbFrame' : nbFrame, 'data': data})
  //   return result
  // }

  // return a JSON object with the list of extractors
  static getListExtractors(xml){
    if(xml == undefined){
      console.log('getListExtractors : Illegal Argument Exception')
    }else{
      var XMLDoc = $.parseXML(xml)
      var extractors= []
      $(XMLDoc).find('extractors').children().each(function(i,e){
        extractors[i] = e.tagName
      })
      return extractors
    }
  }

  // return int of the number of frames
  static getNbFrames(xml, nameExtractor){
    if(xml == undefined || nameExtractor == undefined){
      console.log('getNbFrames : Illegal Argument Exception')
    }else{
      var XMLObject = $.parseXML(xml)
      // init value
      var firstScene = ($(XMLObject).find('extractors').children(nameExtractor).find('scene'))[0]
      var startFrame =parseInt($(firstScene).attr('startFrame'))
      var endFrame = parseInt($(firstScene).attr('endFrame'))

      $(XMLObject).find('scene').each(function(i,scene){
        if(parseInt($(scene).attr('startFrame')) < startFrame){
          startFrame = parseInt($(scene).attr('startFrame'))
        }
        if(parseInt($(scene).attr('endFrame')) > endFrame){
          endFrame = parseInt($(scene).attr('endFrame'))
        }
      })
      // console.log('getNbFrames', endFrame - startFrame)
      return endFrame - startFrame
    }
  }

  // return the list of position
  static getOverlayData(xml){
    if(xml == undefined){
      console.log('getOverlayData : Illegal Argument Exception')
    }else{
      var XMLObject = $.parseXML(xml)
      var positions = $(XMLObject).find('extractors').find('position')
      var result = []
      var x
      var y
      var timeId
      var added = false

      $(positions).each(function(i,position){
        timeId = $(position).parents('[timeId]')[0]
        timeId = $(timeId).attr('timeId')

        x = parseFloat( $(position).attr('x'))
        y = parseFloat( $(position).attr('y'))
        $(result).each(function(i,e){
          if($(e).attr('timeId') == timeId){
            e.position.push({'x': x, 'y': y})
            added = true
          }
        })

        if(!added){
          result.push({"timeId": timeId, "position":[
            {"x": x, "y": y}
          ]})
        }

      })

      return result
    }
  }

  // return a sort set of int with the list of all the timeId
  static getListTimeId(xml){
    if(xml == undefined){
      console.log('getNbFrames : Illegal Argument Exception')
    }else{
      var XMLObject = $.parseXML(xml)
      var timeId
      var result = []
      $(XMLObject).find('frame').each(function(i,frame){

        timeId = parseInt($(frame).attr('timeId'))
        // add the element once
        if($.inArray(timeId, result) == -1){
          if($(result).find(timeId).length ==  0){
            result.push(timeId)
          }
        }
      })
      //sort the set
      result.sort(function compareNumbers(a, b) {
        return a - b;
      })
      // console.log('getListTimeId', result)
      return result
    }
  }

}
