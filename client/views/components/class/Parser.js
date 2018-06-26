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
