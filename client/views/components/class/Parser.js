export class Parser{


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


  // return a sort set of int with the list of all the timeId
  static getListTimeId(xml){
    if(xml == undefined){
      console.log('getNbFrames : Illegal Argument Exception')
    }else{
      var XMLObject = $.parseXML(xml)
      var timeId
      var result = []
      $(XMLObject).find('[timeId]').each(function(i,frame){

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
