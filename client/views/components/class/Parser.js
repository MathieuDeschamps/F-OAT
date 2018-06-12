export class Parser{


  // TODO improve to deal the element which have the same tag
  // but not the same parents
  // return a JSON object with the start and end
  static getTimeLineData(xml){
    if(xml == undefined){
      console.log('getTimeLineData : Illegal Argument Exception')
    }else{
      var XMLObject = xml
      var result = []
      var data =[]
      var intervals = XMLObject
      var intervalName
      var start
      var end
      var added = false
      var nbFrames = Parser.getNbFrames(xml)

      intervals = $(intervals).find('[startFrame][endFrame],[timeId]')

      $(intervals).each(function(i,interval){
        intervalName = interval.tagName
        if($(interval).attr('timeId') != undefined){
          start = parseInt($(interval).attr('timeId'), 10)
          end = parseInt($(interval).attr('timeId'), 10)
        }else{
          start = parseInt($(interval).attr('startFrame'), 10)
          end = parseInt($(interval).attr('endFrame'), 10)
        }
        $(data).each(function(i,e){
          if($(e).attr('name') == intervalName){
            e.intervals.push({'index': i,  'start': start, 'end': end})
            added = true
          }
        })
        if(!added){
          data.push({'name': intervalName, 'intervals' : [
            {'index': data.length, 'start' : start, 'end' : end}
          ]})
        }
        added = false
      })

      result.push({'nbFrames' : nbFrames, 'data': data})

      // console.log('getTimelineData', result)
      return result
    }
  }

  // return a JSON object with the list of extractors
  static getListExtractors(xml){
    if(xml == undefined){
      console.log('getListExtractors : Illegal Argument Exception')
    }else{
      var XMLDoc = $.parseXML(xml)
      var extractors= []
      $(XMLDoc).find('extractors').children().each(function(i,e){
        extractors[i] = $(e).clone().empty()
      })
      return extractors
    }
  }

  // return int of the number of frames
  static getNbFrames(xml){
    if(xml == undefined){
      console.log('getNbFrames : Illegal Argument Exception')
    }else{
      var XMLObject = xml
      // init value
  	  var intervals=$(XMLObject).find('[startFrame][endFrame],[timeId]');
      var startFrame
      var endFrame
      var tmpStrat
      var tmpEnd
      $(intervals).each(function(i,interval){

        if($(interval).attr('timeId') != undefined){
          tmpStrat = parseInt($(interval).attr('timeId'), 10)
          tmpEnd = parseInt($(interval).attr('timeId'), 10)
        }else{
          tmpStrat = parseInt($(interval).attr('startFrame'), 10)
          tmpEnd = parseInt($(interval).attr('endFrame'), 10)
        }

        if(i == 0){
          startFrame = tmpStrat
          endFrame = tmpEnd
        }else{
          if(tmpStrat < startFrame){
              startFrame = tmpStrat
          }
          if(tmpEnd > endFrame){
            endFrame = tmpEnd
          }
        }

      })
      if(isNaN(endFrame - startFrame + 1)){
        return 0
      }else{
        // console.log('getNbFrames', endFrame - startFrame)
        return endFrame - startFrame + 1
      }
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
            e.positions.push({'x': x, 'y': y})
            added = true
          }
        })

        if(!added){
          result.push({"timeId": timeId, "positions":[
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

        timeId = parseInt($(frame).attr('timeId'), 10)
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
