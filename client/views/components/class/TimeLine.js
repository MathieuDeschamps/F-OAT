export class TimeLine {

    // Constants
    static LINE_HEIGHT(){ return 30}
    static EXT_MARGIN(){ return 5}
    static MY_COLOR(){ return ["#f9a825", "#1565c0"]}
    static MY_SELECTED_COLOR(){ return ["#f57f17", '#0d47a1']}
    static TRBL(){return [20, 15, 15, 60] /*top right bottom left*/}

    constructor(name, nbFrames, data, divId){
      this.div_id = divId;
      this.name_extractor = name
      rect_actif = -1;
      this.nb_frame = nbFrames;
      var debut = 0;
      var fin = this.nb_frame;
      this.entries = []
      var that = this
      $(data).each(function(i,e){
        that.entries.push(e.name)
      })
      this.items = []
      $(data).each(function(i,entry){
        $(entry.intervals).each(function(j,interval){
          that.items.push(interval)
        })
      })
      vidCtrl.setPlayingInterval(debut, fin);
      var my_color = TimeLine.MY_COLOR();
      var my_selected_color = TimeLine.MY_SELECTED_COLOR();
      var trbl = TimeLine.TRBL();
      console.log('nbFrame', this.nb_frame)
      // var width_total = this.nb_frame * 0.3;
      var width_total = 550
      var height_total = (TimeLine.LINE_HEIGHT() * this.entries.length ) + 20;
      gen_height = (TimeLine.LINE_HEIGHT() * this.entries.length ) - (2 * TimeLine.EXT_MARGIN());
      gen_width = width_total - 2 * TimeLine.EXT_MARGIN() - trbl[1] - trbl[3];
      used_rect = "";
      used_color = "";
      prec_timeLine = -1; // timeLine de l'ancien rectangle

      //donner le div du timeLine la meme taille que le timeLine generer
      $("#" + this.div_id).css('height', height_total + 10);
      $("#" + this.div_id).css('display', 'none')
      $('#' + this.div_id).css('overflow-x', 'scroll')
      $('#' + this.div_id).css('overflow-y', 'hidden')
      // $('#' + this.div_id).css('overflow', 'scroll')
      $("#" + this.div_id).css('width', '100%')


      //generer la timeLine dans sa div
      var time_line = d3.select("#" + this.div_id)
              .append("svg")
              // .style('display', 'none')
              .style("width", "550")
              .style("height", height_total)
              // .attr("width", "550")
              // .attr("height", height_total)
              // .style('overflow', 'hidden')
              // .style('overflow-y', 'scroll')
              // .attr('viewBox','0,0,'+width_total+','+height_total)
              // .attr("class", "chart");
      time_line.append('rect')
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', width_total)
              .attr('height', height_total)
              .style('fill', '#f2f2f2');
      var gen = time_line.append("g")
              .attr("transform", "translate(" + (trbl[3] + TimeLine.EXT_MARGIN()) + "," + (trbl[0] + TimeLine.EXT_MARGIN()) + ")")
              .attr("width", gen_width)
              .attr("height", gen_height)
              .attr("class", "general");
      var y1 = d3.scale.linear()
              .domain([0, this.entries.length])
              .range([0, gen_height]);

      var x1 = d3.scale.linear()
              .domain([0, this.nb_frame])
              .range([0, gen_width]);

      blockPlay = function (d, i) {
          var id;
          id = "rect" + i;
          //console.log("items[rect_actif]: " , items[rect_actif]);
          //$('#element_id .data[attribute=value]')
          //var rect = $(id);
          // var rect = $(id +" [timeLineid='" + idTimeLine + "']");
          var rect = $("[id=" + id + "][time_line_id='" + divId + "']");
          //console.log("rect: ",rect);
          //console.log("timeLineIdR = " , rectTimeId , " timeLineIdA = " , (Number(idTimeLine)) , " " , rectTimeId !== (Number(idTimeLine)));
          if (rect_actif !== -1) {
            rect.attr("style", "fill:" + my_color[that.items[rect_actif].index % my_color.length]);
          }
          if (prec_timeLine === -1) {
              prec_timeLine = divId;
          }
          //console.log("ra: ",rect_actif, " i: ", i , " pp: " , vidCtrl.getPartialPlaying());
          if ((rect_actif !== i) | prec_timeLine !== divId | (!vidCtrl.getPartialPlaying())) {
              if (used_rect !== "") {
                  used_rect.attr("style", "fill:" + used_color);
              }
              used_color = my_color[d.index % my_color.length];
              rect.attr("style", "fill:" + my_selected_color[d.index % my_selected_color.length]);
              used_rect = rect;
              rect_actif = i;
              prec_timeLine = divId;
              // (Number(idTimeLine)+ 1)
              vidCtrl.setPartialPlaying(true);
              vidCtrl.setPlayingInterval(d.start, d.end);
              // console.log("debut = " + d.start + " fin = " + d.end);
              vidCtrl.play();
          } else {
              // console.log("debut2 = " + debut + " fin2 = " + fin);
              vidCtrl.setPlayingInterval(debut, fin);
              vidCtrl.play();
              used_rect = "";
              rect_actif = -1;
              vidCtrl.setPartialPlaying(false);
          }
      };
      gen.selectAll(".entryLines")
              .data(this.entries)
              .enter().append("line")
              .attr("x1", 0)
              .attr("y1", function (d, i) {
                  return y1(i + 1);
              })
              .attr("x2", gen_width)
              .attr("y2", function (d, i) {
                  return y1(i + 1);
              })
              .attr("stroke", "lightgray");
      var rect = gen.selectAll("rect")
              .data(this.items);
      rect.enter().append("rect")
              .attr("x", function (d) {
                  return x1(d.start + 0.1);
              })
              .attr("y", function (d) {
                  return y1(d.index + 0.1);
              })
              // .attr("width", 10)
              .attr("width", function (d) {
                  // return Math.max(0, 10)
                  return Math.max(x1(d.end - 0.1) - x1(d.start), 5);
              })
              // .attr("height", 0.8)
              .attr("height", function (d) {
                  return y1(0.8);
              })
              .attr("id", function (d, i) {
                  return "rect" + i;
              })
              .attr("time_line_id", this.div_id)
              .attr("startframe", function (d) {
                  return d.start
              })
              .attr("endframe", function (d) {
                  return d.end
              })
              .attr("name", function (d) {
                  return that.entries[d.index];
              })
              .attr("class", 'elementTimeLine')
              .style("fill", function (d) {
                  return my_color[d.index % my_color.length];
              })
              .attr("stroke", "lightgray")
              .on("click", blockPlay);

      time_line.append("text")
              .text(this.name_extractor + " timeLine")
              .attr("x", 0)
              .attr("y", 15)
              .attr("text-anchor", "start")
              .attr("dy", ".5ex")
              .style("font-size", "20px")
              .style("font-weight", "bold");

      gen.selectAll(".entryText")
              .data(this.entries)
              .enter().append("text")
              .text(function (d) {
                  return d;
              })
              .attr("x", -trbl[1])
              .attr("y", function (d, i) {
                  return y1(i + .5);
              })
              .attr("dy", ".5ex")
              .attr("text-anchor", "end");
      // console.log("rect1: ", rect)
    }
    update() {

      $('#' + this.id_time_line).empty()
      var debut = 0
      vidCtrl.setPlayingInterval(debut, this.nbFrame);
      var my_color = TimeLine.MY_COLOR();
      var my_selected_color = TimeLine.MY_SELECTED_COLOR();
      var trbl = TimeLine.TRBL();

      var width_total = this.nb_frame * 0.3;
      var height_total = TimeLine.LINE_HEIGHT() * this.entries.length ;
      var that = this
      gen_height = height_total - 2 * TimeLine.EXT_MARGIN();
      gen_width = width_total - 2 * TimeLine.EXT_MARGIN() - trbl[1] - trbl[3];
      used_rect = "";
      used_color = "";
      prec_timeLine = -1; // timeLine de l'ancien rectangle

      //generer la timeLine dans sa div
      var time_line = d3.select("#" + this.id_time_line)
              .append("svg")
              .attr("width", width_total)
              .attr("height", height_total)
              // .attr("class", "chart");
      time_line.append('rect')
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', width_total)
              .attr('height', height_total + 20)
              .style('fill', '#f2f2f2');
      var gen = time_line.append("g")
              .attr("transform", "translate(" + (trbl[3] + TimeLine.EXT_MARGIN()) + "," + (trbl[0] + TimeLine.EXT_MARGIN()) + ")")
              .attr("width", gen_width)
              .attr("height", gen_height)
              .attr("class", "general");
      var y1 = d3.scale.linear()
              .domain([0, this.entries.length])
              .range([0, gen_height]);

      var x1 = d3.scale.linear()
              .domain([0, this.nb_frame])
              .range([0, gen_width]);

      blockPlay = function (d, i) {
          var id;
          id = "rect" + i;
          //console.log("items[rect_actif]: " , items[rect_actif]);
          //$('#element_id .data[attribute=value]')
          //var rect = $(id);
          // var rect = $(id +" [timeLineid='" + idTimeLine + "']");
          var rect = $("[id=" + id + "][time_line_id='" + divId + "']");
          //console.log("rect: ",rect);
          //console.log("timeLineIdR = " , rectTimeId , " timeLineIdA = " , (Number(idTimeLine)) , " " , rectTimeId !== (Number(idTimeLine)));
          if (rect_actif !== -1) {
              rect.attr("style", "fill:" + my_color[that.items[rect_actif].index % my_color.length]);
          }
          if (prec_timeLine === -1) {
              prec_timeLine = divId;
          }
          //console.log("ra: ",rect_actif, " i: ", i , " pp: " , vidCtrl.getPartialPlaying());
          if ((rect_actif !== i) | prec_timeLine !== divId | (!vidCtrl.getPartialPlaying())) {
              if (used_rect !== "") {
                  used_rect.attr("style", "fill:" + used_color);
              }
              used_color = my_color[d.index % my_color.length];
              rect.attr("style", "fill:" + my_selected_color[d.index % my_selected_color.length]);
              used_rect = rect;
              rect_actif = i;
              prec_timeLine = divId;
              // (Number(idTimeLine)+ 1)
              vidCtrl.setPartialPlaying(true);
              vidCtrl.setPlayingInterval(d.start, d.end);
              // console.log("debut = " + d.start + " fin = " + d.end);
              vidCtrl.play();
          } else {
              // console.log("debut2 = " + debut + " fin2 = " + fin);
              vidCtrl.setPlayingInterval(debut, fin);
              vidCtrl.play();
              used_rect = "";
              rect_actif = -1;
              vidCtrl.setPartialPlaying(false);
          }
      };
      gen.selectAll(".entryLines")
              .data(this.entries)
              .enter().append("line")
              .attr("x1", 0)
              .attr("y1", function (d, i) {
                  return y1(i + 1);
              })
              .attr("x2", gen_width)
              .attr("y2", function (d, i) {
                  return y1(i + 1);
              })
              .attr("stroke", "lightgray");
      var rect = gen.selectAll("rect")
              .data(this.items);
      rect.enter().append("rect")
              .attr("x", function (d) {
                  return x1(d.start + 0.1);
              })
              .attr("y", function (d) {
                  return y1(d.index + 0.1);
              })
              // .attr("width", 10)
              .attr("width", function (d) {
                  // return Math.max(0, 10)
                  return Math.max(x1(d.end - 0.1) - x1(d.start), 5);
              })
              // .attr("height", 0.8)
              .attr("height", function (d) {
                  return y1(0.8);
              })
              .attr("id", function (d, i) {
                  return "rect" + i;
              })
              .attr("time_line_id", this.div_id)
              .attr("startframe", function (d) {
                  return d.start
              })
              .attr("endframe", function (d) {
                  return d.end
              })
              .attr("name", function (d) {
                  return that.entries[d.index];
              })
              .attr("class", 'elementTimeLine')
              .style("fill", function (d) {
                  return my_color[d.index % my_color.length];
              })
              .attr("stroke", "lightgray")
              .on("click", blockPlay);

      time_line.append("text")
              .text(name + " timeLine")
              .attr("x", 0)
              .attr("y", 15)
              .attr("text-anchor", "start")
              .attr("dy", ".5ex")
              .style("font-size", "20px")
              .style("font-weight", "bold");

      gen.selectAll(".entryText")
              .data(this.entries)
              .enter().append("text")
              .text(function (d) {
                  return d;
              })
              .attr("x", -trbl[1])
              .attr("y", function (d, i) {
                  return y1(i + .5);
              })
              .attr("dy", ".5ex")
              .attr("text-anchor", "end");
      // console.log("rect1: ", rect)

    }
}
