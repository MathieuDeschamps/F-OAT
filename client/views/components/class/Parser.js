export class Parser{

// TODO update with the new format
  // return a JSON object with the startTime and enTime of Scenes shots and frames
  static getTimelineData(xml){
    var xmlDoc = $.parseXML(xml)
    // retrieve the list from XML file in jQuerry
    var listScenes = $(xmlDoc).find('Scene')
    var listShots = $(xmlDoc).find('shot')
    var listFrames = $(xmlDoc).find('frame')

    // the object returns
    var timeline ={}
    timeline.frameRate = parseFloat($(xmlDoc).find('header').find('video').attr('fps'))
    timeline.nbFrames= Parser.getNbFrames(xml)
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

  // return a JSON object with the list of extractors
  static getListExtractors(xml){
    var XMLDoc = $.parseXML(xml)
    var extractors= []
    $(XMLDoc).find('extractors').children().each(function(i,e){
      extractors[i] = e.tagName
    })
    return extractors

  }

  // TODO update with the new format
  // return a JSON object with the previous frame and the next frame
  static getFrames(xml,numFrame){
    var xmlDoc = $.parseXML(xml)
    if(numFrame == undefined || Parser.getNbFrames(xml) + 1 < numFrame){
      alert('Invalid frame number : ' + numFrame)
    }

    var result = {}
    result.previousFrame = {}
    result.nextFrame = {}

    var indexPrevious
    var indexNext
    // gap beteween the frames
    var gapPrevious = Parser.getNbFrames(xml)
    var gapNext = Parser.getNbFrames(xml)
    // init the gap value with the nb of frame

    var frames = $(xmlDoc).find('frame') .each(function(i,frame){
      // get indexPrevious (inclus elle même ?)
      if($(frame).attr('timeId') < numFrame && Math.abs(numFrame - parseInt($(frame).attr('timeId'))) < gapPrevious){
          gapPrevious = Math.abs(numFrame - parseInt($(frame).attr('timeId')))
          indexPrevious = i
      }
      // get indexNext
      if($(frame).attr('timeId') > numFrame && Math.abs(numFrame - parseInt($(frame).attr('timeId'))) < gapNext){
          gapNext = Math.abs(numFrame - parseInt($(frame).attr('timeId')))
          indexNext = i
      }
    })

    result.previousFrame = frames[indexPrevious]
    result.nextFrame = frames[indexNext]

    // console.log('getFrames ' + numFrame,result)
    return result
  }

  // TODO update with the new format
  // return int of the number of frames
  static getNbFrames(xml){
    var xmlDoc = $.parseXML(xml)
    // init value
    var firstScene = ($(xmlDoc).find('Scene'))[0]
    var startFrame =parseInt($(firstScene).attr('startFrame'))
    var endFrame = parseInt($(firstScene).attr('endFrame'))
    $(xmlDoc).find('Scene').each(function(i,scene){
      if($(scene).attr('startFrame') < startFrame){
        startFrame = parseInt($(scene).attr('startFrame'))
      }
      if($(scene).attr('endFrame') > endFrame){
        endFrame = parseInt($(scene).attr('endFrame'))
      }
    })
    // console.log('getNbFrames', endFrame - startFrame)
    return endFrame - startFrame
  }

  // TODO update with the new format
  // return a JSON object with the previous frame and the next frame in the shot
  static getShotFrames(xml, numFrame){
    var xmlDoc = $.parseXML(xml)

    if(numFrame == undefined || Parser.getNbFrames(xml) + 1< numFrame){
      alert('Invalid frame number : ' + numFrame)
    }

    var result = {}
    result.previousFrame = {}
    result.nextFrame = {}
    var indexPrevious
    var indexNext
    // gap beteween the frames
    var gapPrevious
    var gapNext
    var shot
    // retrieve the shot with the previous and next frame
    $(xmlDoc).find('shot').filter(function(){
          if($(this).attr('startFrame') <= numFrame && $(this).attr('endFrame') >= numFrame){
            shot = this
          }
    })
    // init the gap value
    gapPrevious = parseInt($(shot).attr('endFrame')) - parseInt($(shot).attr('startFrame'))
    gapNext = gapPrevious

    // console.log("getFrames:shot", shot)

    // found and add the previous and next frane
    $(shot).find('frame').each(function(i,frame){
      // get indexPrevious
      if(parseInt($(frame).attr('timeId')) < parseInt(numFrame) && Math.abs(numFrame - parseInt($(frame).attr('timeId'))) < gapPrevious){
          gapPrevious = Math.abs(numFrame - parseInt($(frame).attr('timeId')))
          indexPrevious = i
          //console.log("getShotFrames:indexPrevious",indexPrevious)
      }
      // get indexNext
      if(parseInt($(frame).attr('timeId')) > parseInt(numFrame) && (Math.abs(numFrame - parseInt($(frame).attr('timeId')))< gapNext)){
          gapNext = Math.abs(numFrame - parseInt($(frame).attr('timeId')))
          indexNext = i
      }
    })
    result.previousFrame = $(shot).find('frame')[indexPrevious]
    result.nextFrame = $(shot).find('frame')[indexNext]

    // console.log('getShotFrames ' + numFrame ,result)
    return result
  }

  // TODO update with the new format
  // return a JSON object with the frame or the previous frame and the next frame
  static getFrame(xml, numFrame){
    var xmlDoc = $.parseXML(xml)
    if(numFrame == undefined || Parser.getNbFrames(xml) + 1< numFrame){
      alert('Invalid frame number : ' + numFrame)
    }

    var result = {}
    // get the frame
     result =  $(xmlDoc).find('frame[timeId="' + numFrame + '"]')
    if(result == undefined){
      return Parser.getFrames(xml,numFrame)
    }
    else{
        // console.log('getFrame ' + numFrame, result)
        return result
    }

  }

  // TODO update with the new format
  // return a sort array int with the list of all the timeId
  static getListTimeId(xml){

    var xmlDoc = $.parseXML(xml)
    var result = []
    $(xmlDoc).find('frame').each(function(i,frame){
      result.push(parseInt($(frame).attr('timeId')))
    })
    //sort array
    result.sort(function compareNumbers(a, b) {
      return a - b;
    })
    // console.log('getListTimeId', result)
    return result
  }

  // TODO update with the new format
  // return a JSON object with the frame, id  and the data
  static getFramesActors(xml){
    var xmlDoc = $.parseXML(xml)
    var listFrames = $(xmlDoc).find('frame')
    var	actorFrame =$(xmlDoc).find('frame').find('actor')
    var actorsFramesArray = []
    var frame, refId, data
    for(i=0; i < listFrames.length; i++){
    // iterate on the actors in every frames
      $(listFrames[i]).children('actor').each(function (i, actor){
          frame =  parseInt($(listFrames[i]).attr('timeId'))
          id = parseInt($(actor).attr('refId'))
          data = actor
          actorsFramesArray.push({"frame": frame, "id": id, "data": data})

          })
        }

    // console.log('getFramesActor',actorsFramesArray)
    return actorsFramesArray
  }

  // TODO update with the new format
  // return a JSON object with the shot where the actor is present
	static getShotsActor(xml, id){
    var xmlDoc = $.parseXML(xml)
    if(id == undefined || Parser.getMaxIdActor(xml) < id){
      alert('Invalid actor id : ' + id)
    }

    // retrieve the list of information on the actor
    var	actorFrame =$(xmlDoc).find('frame').find('actor')
    var listShots = $(xmlDoc).find('shot')

    // define the object return
    var shotsArray = {}
    shotsArray.data = []
    var isPresent = false
    // add the shots to the array
    for(i=0; i < listShots.length; i++){
    isPresent = false
    $(listShots[i]).children('frame').children('actor').each(function (index, actor){
    if($(actor).attr('refId') == id){
      isPresent = true
    }
    })
    if(isPresent){
      shotsArray.data.push({"start" : parseInt($(listShots[i]).attr('startFrame')),
                      "end" : parseInt($(listShots[i]).attr('endFrame'))});
    }
    }
    // console.log('getShortsActor ' + id,shotsArray)
    return shotsArray
	}

  // TODO update with the new format
  //return a JSON object of an actor
  static getActor(xml, id){
    var xmlDoc = $.parseXML(xml)
    if(id == undefined || Parser.getMaxIdActor () < id){
      alert('Invalid actor id : ' + id)
    }

    var result = {}
    result = $(xmlDoc).find('header').find("actor[id='" + id + "']")

    // console.log("getActor " + id ,result)
    return result

  }

  // TODO update with the new format
  // return the max id actor
  static getMaxIdActor(xml){
    var xmlDoc = $.parseXML(xml)
    var maxIndex = -1
    $(xmlDoc).find('header').find('actor').each(function(i,actor){
      if($(actor).attr('id')>maxIndex){
        maxIndex = $(actor).attr('id')
      }
    })
    // console.log("maxIndex",maxIndex)
    return maxIndex
  }


}
