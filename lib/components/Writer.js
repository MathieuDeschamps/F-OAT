import { Parser } from '../components/Parser.js'

export class Writer{

  // add a actor to the xmlDoc and return the XML into String
  static addActor(xml, actor){

    var xmlDoc = $.parseXML(xml)
    var parseActor = $.parseXML(actor)

    var id = $(parseActor).find('actor').attr('id')
    if(id == undefined){
      alert('Invalid actor id : ' + id)
    }else{
      if($(xmlDoc).find("actor[id='"+ id + "']").length != 0){
        alert('Invalid actor.')
      }else{

       if($(xmlDoc).find('header').find('actor').length == 0){
         // add the first actor in the header
         $(xmlDoc).find('header').prepend(actor)
       }
       else{
          var nearId = $(xmlDoc).find('header').find('actor').attr('id')
          var gap = Math.abs(id - $(xmlDoc).find('header').find('actor').attr('id'))
          // retrieve the nearest actor id
           $(xmlDoc).find('header').find('actor').each(function(i,actorI){
             if(Math.abs($(actorI).attr('id') - id) < gap){
               nearId = $(actorI).attr('id')
               gap = Math.abs($(actorI).attr('id') - id)
             }
           })

           // insert before
           if( id < nearId){
             $(xmlDoc).find('header').find("actor[id='"+ nearId + "']").before(actor)
           }

           // insert after
           if( nearId < id){
            $(xmlDoc).find('header').find("actor[id='"+ nearId + "']").after(actor)
           }
         }
       }

      // convert XML document to String
      // TODO fix error console
      // var result
      // if (window.ActiveXObject){
      // result = xmlDoc.xml;
      // }else{
      //   result  = (new XMLSerializer()).serializeToString(xml);
      // }
      // console.log('addActor', result)
      // return result

      return xmlDoc
     }
   }

  // delete a actor and these notes ands return the XML into a String
  static deleteActor(xml, id){
    var xmlDoc =  $.parseXML(xml)

    if(id == undefined || Parser.getMaxIdActor(xml) < id){
      alert('Invalid actor id : ' + id)
    }
    $(xmlDoc).find("actor[refId = '" + id + "']").remove()
    $(xmlDoc).find("actor[id = '" + id + "']").remove()

      // convert XML document to String
      // TODO fix error console
    //   var result
    //   if (window.ActiveXObject){
    //     result = xmlDoc.xml;
    //   }else{
    //    result  = (new XMLSerializer()).serializeToString(xmlDoc);
    //   }
    // console.log('deleteActor', result)
    // return result
    return xmlDoc

  }

  // add a frame to the xmlDoc to the right place(timeId) and return the XML into a String
  static addFrame(xml, frame){

    var xmlDoc =  $.parseXML(xml)
    var parseFrame = $.parseXML(frame)
    var timeId = $(parseFrame).find('frame').attr('timeId')
    if(timeId == undefined){
      alert('No timeId attribut.')
    }else{
      var getFrame = Parser.getFrames(xml, timeId)
      if(getFrame.frame != undefined || Parser.getNbFrames(xml) < timeId){
        alert('Invalid frame number.')
      }else{
        var startFrame
        $(xmlDoc).find('shot').each(function(i,shot){
          if($(shot).attr('startFrame') <=  timeId && $(shot).attr('endFrame') >= timeId){
            startFrame = $(shot).attr('startFrame')
          }
        })

        var previousTimeId  = $(Parser.getShotFrames(xml, timeId).previousFrame).attr('timeId')
        var nextTimeId = $(Parser.getShotFrames(xml, timeId).nextFrame).attr('timeId')

        // first frame of the shot
        if(previousTimeId == undefined && nextTimeId == undefined){
          $(xmlDoc).find("shot[startFrame='" + startFrame + "']").append(frame)
        }

        if(previousTimeId != undefined){
          $(xmlDoc).find("frame[timeId='" + previousTimeId + "']").after(frame)
        }

        if(previousTimeId == undefined && nextTimeId != undefined){
          $(xmlDoc).find("frame[timeId='" + nextTimeId + "']").before(frame)
        }

        // convert XML document to String
        // TODO fix error console
        // var result
        // if (window.ActiveXObject){
        //  result = xmlDoc.xml;
        // }else{
        //   var XMLS = new XMLSerializer()
        //  result  = (new XMLSerializer()).serializeToString($(xmlDoc)[0]);
        // }
        // console.log('addFrame', result)
        // return result
        return xmlDoc
      }
    }
  }
}
