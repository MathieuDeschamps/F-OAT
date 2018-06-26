export class TimeLine {

    // Constants
    static LINE_HEIGHT(){ return 30}
    static EXT_MARGIN(){ return 5}
    static MY_COLOR(){ return ["#f9a825", "#1565c0"]}
    // static MY_SELECTED_COLOR(){ return ["#f0f", '#ff0']}
    static MY_SELECTED_COLOR(){ return ["#f57f17", '#0d47a1']}
    static SCALE_MIN(){return 30}
    static TRB(){
      /*top right bottom
        the
      */
      return [20, 15, 30]
    }

    constructor(name, xmlxsdForm, nbFrames, data, divId, visualizer){
      this.div_id = divId;
      this.xmlxsdForm = xmlxsdForm
      this.name_extractor = name;
      this.nb_frames = nbFrames;
      this.frame_rate = 30
      this.visualizer = visualizer;
      this.entries = []
      this.index_used_rect = -1;
      this.used_color = "";
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

      this.draw()
    }

    equals(object){
      var result = false;
      if(typeof this === typeof object){
        result = this.div_id === object.div_id &&
          this.name_extractor === object.name_extractor &&
          this.nb_frames === object.nb_frames &&
          this.frame_rate === object.frame_rate;
      }
      return result
    }

    draw(){
      var my_color = TimeLine.MY_COLOR();
      var my_selected_color = TimeLine.MY_SELECTED_COLOR();
      var trb = TimeLine.TRB();

      var width_total;
      if(this.nb_frames<2000){
        width_total = Math.max(this.nb_frames,600);
      }
      else if(this.nb_frames<10000){
        width_total = this.nb_frames * (this.frame_rate / 100);
      }
      else if(this.nb_frames<50000){
        width_total = this.nb_frames * (this.frame_rate / 200);
      }
      else if(this.nb_frames<100000){
        width_total = this.nb_frames * (this.frame_rate / 500);
      }
      else{
        width_total = this.nb_frames * (this.frame_rate / 1000);
      }
      var leftSpace = 0
      this.entries.forEach(function(entry){
        if(entry.length *  10 > leftSpace){
          leftSpace = entry.length * 10;
        }
      })

      var scaleData = []
      for(var i = 0; i < this.nb_frames; i++){
        if((i / this.frame_rate) % TimeLine.SCALE_MIN() == 0){
          var min = Math.trunc((i / this.frame_rate) / 60)
          var sec = (i / this.frame_rate) % 60
          sec = ("0" + sec).slice(-2);
          scaleData.push({'time_id':i,'label':min + ":" + sec})
        }
      }
      var height_total = (TimeLine.LINE_HEIGHT() * (this.entries.length)) + 40;
      var gen_height = (TimeLine.LINE_HEIGHT() * this.entries.length) - (2 * TimeLine.EXT_MARGIN());
      var gen_width = width_total - 2 * TimeLine.EXT_MARGIN() - trb[1] - leftSpace;
      var prec_timeLine = -1; // timeLine de l'ancien rectangle

      var debut = 0;
      var fin = this.nb_frames;

      $("#" + this.div_id).css('height', height_total + 10)
                          .css('overflow-x', 'auto')
                          .css('overflow-y', 'hidden')
                          .css('width', '90%')

      //generer la timeLine dans sa div
      var time_line = d3.select("#" + this.div_id)
              .append("svg")

      $("#" + this.div_id).find('svg').css('width',width_total)
              .css('height',height_total)
              .css('position','relative');

      time_line.append('rect')
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', width_total)
              .attr('height', height_total)
              .style('fill', '#f2f2f2');

      var gen = time_line.append("g")
              .attr("transform", "translate(" + (leftSpace + TimeLine.EXT_MARGIN()) + "," + (trb[0] + TimeLine.EXT_MARGIN()) + ")")
              .attr("width", gen_width)
              .attr("height", gen_height)
              .attr("class", "general");

      var y1 = d3.scale.linear()
              .domain([0, this.entries.length])
              .range([0, gen_height]);

      var x1 = d3.scale.linear()
              .domain([0, this.nb_frames])
              .range([0, gen_width]);

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
      var that = this;
      rect.enter().append("rect")
              .attr("x", function (d) {
                  return x1(d.start + 0.1);
              })
              .attr("y", function (d) {
                  return y1(d.index + 0.1);
              })
              .attr("width", function (d) {
                  return Math.max(x1(d.end - 0.1) - x1(d.start), 5);
              })
              .attr("height", function (d) {
                  return y1(0.8);
              })
              .attr("index", function (d, i) {
                  return i;
              })
              .style("fill", function (d, i) {
                if(that.index_used_rect === i){
                  return my_selected_color[d.index % my_selected_color.length];
                }else{
                  return my_color[d.index % my_color.length];
                }
              })
              .attr("stroke", "lightgray")
              .on("click", function(d, i){ that.blockPlay(d, this)});

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
              .attr("x", -trb[1])
              .attr("y", function (d, i) {
                  return y1(i + .5);
              })
              .attr("dy", ".5ex")
              .attr("text-anchor", "end");

      gen.selectAll('.scaleText')
              .data(scaleData)
              .enter().append("text")
              .text(function(d){
                return d.label;
              })
              .attr("x", function(d){
                return x1(d.time_id)
              })
              .attr("y", height_total - trb[2]);

    }

    /* Event trigger when click on a rect of the time line
    @item contains the data of the xml to the rectangle
    @target is the html of the rectangle
    */
    blockPlay(item, target){
      var my_color = TimeLine.MY_COLOR();
      var my_selected_color =  TimeLine.MY_SELECTED_COLOR();

      if(typeof vidCtrl.focusTimeLine !== 'undefined'){

        vidCtrl.focusTimeLine.lostFocus();
      }

      if (this.index_used_rect !== parseInt($(target).attr('index')) || (!vidCtrl.getPartialPlaying())) {
        $(target).css("fill", my_selected_color[item.index % my_selected_color.length]);
        this.used_color = my_color[item.index % my_color.length];
        this.index_used_rect = parseInt($(target).attr('index'));
        this.xmlxsdForm.displayForm(item.stack)
        vidCtrl.setPlayingInterval(item.start, item.end);
        vidCtrl.setPartialPlaying(true);
        vidCtrl.focusTimeLine = this;
        // vidCtrl.play();
      } else {
        vidCtrl.setPlayingInterval(1, this.nb_frames);
        vidCtrl.setPartialPlaying(false);
      }

    };

    /* Called when this time line lost the focus of the video controleur
    for an another time line
    */
    lostFocus(){
      if (this.index_used_rect !== -1) {
        var used_rect = $('#'+this.div_id).find('rect[index="'+this.index_used_rect+'"]')
        if(used_rect.length > 0){
          $(used_rect).css("fill", this.used_color);
        }
      }
    }

    /* Observer pattern : update function
    */
    update() {
      var data = this.visualizer.getTimeLineData();
      this.entries = []
      var that = this
      $(data).each(function(i,e){
        that.entries.push(e.name)
      });
      this.items = []
      $(data).each(function(i,entry){
        $(entry.intervals).each(function(j,interval){
          that.items.push(interval)
        })
      })
      $('#' + this.div_id).empty()
      this.draw();
      if(this.index_used_rect !== -1) {
        var currentItem = this.items[this.index_used_rect];
        $(this.index_used_rect).css('fill', this.used_color)
        vidCtrl.setPartialPlaying(true);
        console.log('currentItem', currentItem);
        vidCtrl.setPlayingInterval(currentItem.start, currentItem.end);
      }
    }
}
