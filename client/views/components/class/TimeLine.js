import * as d3 from "d3";
export class TimeLine {

    // Constants
    static LINE_HEIGHT(){ return 30}
    static EXT_MARGIN(){ return 5}
    static MY_COLOR(){ return ['#f9a825', '#1565c0']}
    // static MY_SELECTED_COLOR(){ return ['#f0f', '#ff0']}
    static MY_SELECTED_COLOR(){ return ['#f57f17', '#0d47a1']}
    static SCALE_MIN(){return 30}
    static X_AXIS_HEIGTH(){ return 20}
    static TRBL(){
      /*top right bottom left */
      return [20, 15, 10, 5]
    }

    /*
    @name name of the extractor
    @nbFrames number of frame of the video
    @data used to build the time line
    @divId id of the html div which will contain the timeline
    @visualizer the visaulizer which created the overlay
    */
    constructor(name, nbFrames, data, divId, visualizer){
      this.div_id = divId;
      this.xmlxsdForm = undefined;
      this.name_extractor = name;
      this.nb_frames = nbFrames;
      if(typeof vidCtrl !== 'undefined' &&
        typeof vidCtrl.frameRate !== 'undefined'){
        this.frame_rate = vidCtrl.frameRate;
        vidCtrl.attach(this, 1);
      }
      else{
        this.frame_rate = 30;
      }
      this.visualizer = visualizer;
      this.entries = [];
      this.index_used_rect = -1;
      this.current_frame = 1;
      var that = this;
      $(data).each(function(i,e){
        that.entries.push(e.name);
      })
      this.items = [];
      $(data).each(function(i,entry){
        $(entry.intervals).each(function(j,interval){
          that.items.push(interval);
        })
      })
      this.id_entries =  this.div_id+'_entries';
      this.id_chart =  this.div_id+'_chart';
      // the scale of x axis set by draw
      this.x1 = undefined

      this.draw();
    }

    setXMLXSDForm(xmlxsdForm){
      this.xmlxsdForm = xmlxsdForm;
    }

    equals(object){
      var result = false;
      if(typeof this === typeof object){
        result = this.div_id === object.div_id &&
          this.name_extractor === object.name_extractor &&
          this.nb_frames === object.nb_frames &&
          this.frame_rate === object.frame_rate;
      }
      return result;
    }

    getScale(){
      if(this.nb_frames<2000){
        return 1;
      }
      else if(this.nb_frames<10000){
       return (this.frame_rate / 100);
      }
      else if(this.nb_frames<50000){
        return (this.frame_rate / 200);
      }
      else if(this.nb_frames<100000){
        return (this.frame_rate / 500);
      }
      else{
        return (this.frame_rate / 1000);
      }
    }

    /* Draw the time line in the div id
    */
    draw(){
      var that = this;
      var my_color = TimeLine.MY_COLOR();
      var my_selected_color = TimeLine.MY_SELECTED_COLOR();
      var that = this;
      var scale = this.getScale();

      var width_total = (this.nb_frames * scale);
      width_total += TimeLine.TRBL()[1] + TimeLine.TRBL()[3];
      var gen_width = width_total - 2 * TimeLine.EXT_MARGIN() - TimeLine.TRBL()[1] - TimeLine.TRBL()[3];

      var height_total = (TimeLine.LINE_HEIGHT() * (this.entries.length) + TimeLine.X_AXIS_HEIGTH());
      height_total += TimeLine.TRBL()[0] + TimeLine.TRBL()[3];
      var gen_height = (TimeLine.LINE_HEIGHT() * this.entries.length) - (2 * TimeLine.EXT_MARGIN());
      var prec_timeLine = -1; // time line of the old rectanlge

      var debut = 0;
      var fin = this.nb_frames;


      var $entries = $('<div/>').attr('id', this.id_entries);
      var $chart = $('<div/>').attr('id', this.id_chart);
      $('#'+this.div_id).append($entries);
      $('#'+this.div_id).append($chart);

      $('#'+this.div_id).addClass('row')
          .css('background-color', '#f2f2f2');
      $('#'+this.id_entries).css('height', height_total)
          .addClass('col s2');

      // div height is the height of the svg + height horizontal scroll bar
      $('#'+this.id_chart).css('height', height_total)
          .addClass('col s10')
          .css('overflow-x', 'auto')
          .css('overflow-y', 'hidden');

      this.x1 = d3.scaleLinear()
          .domain([0, this.nb_frames])
          .range([0, gen_width]);

      var xAxis = d3.axisBottom()
        	.scale(that.x1)
          .tickSize(1);

      var y1 = d3.scaleLinear()
          .domain([0, this.entries.length])
          .range([0, gen_height]);

      var yAxis = d3.axisLeft()
          .scale(y1)
          .tickSize(1);

      // generate the two div one for the caption and one for the chart
      var entries = d3.select('#'+this.id_entries)
          .append('svg');

      var chart = d3.select('#'+this.id_chart)
          .append('svg')
          .style('width',width_total)
          .style('height',height_total)
          .style('position','relative');

      var zoom = d3.zoom()
          .scaleExtent([1, this.frame_rate])
          .on('zoom', zoomed)
        chart.call(zoom);

      $('#'+this.id_chart).find('svg')

      var gen = chart.append('g')

      gen.attr('transform', 'translate(' + (TimeLine.TRBL()[3] + TimeLine.EXT_MARGIN()) + ',' + (TimeLine.TRBL()[0] + TimeLine.EXT_MARGIN()) + ')')
          .style('width', gen_width)
          .style('height', gen_height)
          .attr('class', 'general');

      // add x axis
      chart.append('g')
        .classed('x axis', true).call(xAxis)
        .attr('transform', 'translate('+TimeLine.TRBL()[3]+', '+ y1(this.entries.length + 1) +')')

      function zoomed(){
          // chart.style('width', new_width);

          // update the scale
          chart.select('.x.axis').call(xAxis);
          // redraw the read line
          gen.select('#read_line').attr('x1', that.x1(that.current_frame))
          .attr('x2', that.x1(that.current_frame));


          // redraw the rectangles
          gen.selectAll('rect')
          .data(that.items)
          .attr('x', function (d) {
            return that.x1(d.start + 0.1);
          })
          .attr('y', function (d) {
            return y1(d.index + 0.1);
          })
          .attr('width', function (d) {
            return Math.max(that.x1(d.end - 0.1) - that.x1(d.start), 5);
          })
          .attr('height', function (d) {
            return y1(0.8);
          })

        }

      gen.selectAll('.entryLines')
          .data(this.entries)
          .enter().append('line')
          .attr('x1', 0)
          .attr('y1', function (d, i) {
              return y1(i + 1);
          })
          .attr('x2', gen_width)
          .attr('y2', function (d, i) {
              return y1(i + 1);
          })
          .attr('stroke', 'lightgray');

      var rect = gen.selectAll('rect')
          .data(this.items);


      rect.enter().append('rect')
          .attr('x', function (d) {
              return that.x1(d.start + 0.1);
          })
          .attr('y', function (d) {
              return y1(d.index + 0.1);
          })
          .attr('width', function (d) {
              return Math.max(that.x1(d.end - 0.1) - that.x1(d.start), 5);
          })
          .attr('height', function (d) {
              return y1(0.8);
          })
          .attr('number', function (d, i) {return i;})
          .attr('index', function(d){
            return d.index
          })
          .style('fill', function (d, i) {return my_color[d.index % my_color.length];
          })
          .attr('stroke', 'lightgray')
          .on('click', function(d, i){ that.blockPlay(d, this)});

      gen.append('line')
          .attr('id', 'read_line')
          .attr('x1', that.x1(that.current_frame))
          .attr('y1', 0)
          .attr('x2', that.x1(that.current_frame))
          .attr('y2', gen_height)
          .attr('stroke', 'gray');

      entries.append('text')
          .text(this.name_extractor)
          .attr('x', 0)
          .attr('y', 15)
          .attr('text-anchor', 'start')
          .attr('dy', '.5ex')
          .style('font-size', '20px')
          .style('font-weight', 'bold');

      entries.selectAll('.entryText')
          .data(this.entries)
          .enter().append('text')
          .text(function (d) {
              return d;
          })
          .attr('x',  0)
          .attr('y', function (d, i) {
              return ((TimeLine.LINE_HEIGHT() * (i + 1)) + 5);
          })
          .attr('text-anchor', 'start');
    }

    /* Event trigger when click on a rect of the time line
    @item contains the data of the xml to the rectangle
    @target is the html of the rectangle
    */
    blockPlay(item, target){
      var my_color = TimeLine.MY_COLOR();
      var my_selected_color =  TimeLine.MY_SELECTED_COLOR();
      // save the index of the used rect because lostFocus rested
      var save_index_used_rect = this.index_used_rect;

      vidCtrl.setTimeLineFocus(this);

      if (save_index_used_rect !== parseInt($(target).attr('number')) || (!vidCtrl.getPartialPlaying())) {
        $(target).css('fill', my_selected_color[item.index % my_selected_color.length]);
        this.index_used_rect = parseInt($(target).attr('number'));
        if(typeof this.xmlxsdForm !== 'undefined'){
          this.xmlxsdForm.displayForm(item.stack);
        }
        vidCtrl.setPlayingInterval(item.start, item.end);
        vidCtrl.setPartialPlaying(true);
        if(item.start < item.end){
          vidCtrl.play();
        }
      } else {
        vidCtrl.setPlayingInterval(1, this.nb_frames);
        vidCtrl.setPartialPlaying(false);
      }

    };

    /* Called when this time line lost the focus of the video controleur
    */
    lostFocus(){
      if (this.index_used_rect !== -1) {
        var used_rect = $('#'+this.div_id).find('rect[number="'+this.index_used_rect+'"]')
        if(used_rect.length > 0){
          var my_color = TimeLine.MY_COLOR();
          var index_color = parseInt($(used_rect).attr('index'));
          $(used_rect).css('fill', my_color[index_color % my_color.length]);
        }
      }
    }

    /* Called when this time line take the focus of the video controleur
    */
    // takeFocus(){
    //   if (this.index_used_rect !== -1) {
    //     var used_rect = $('#'+this.div_id).find('rect[number="'+this.index_used_rect+'"]');
    //     if(used_rect.length > 0){
    //       var my_selected_color = TimeLine.MY_SELECTED_COLOR();
    //       var index_color = parseInt($(used_rect).attr('index'));
    //       console.log('index_color', index_color);
    //       $(used_rect).css('fill', my_selected_color[index_color % my_selected_color.length]);
    //     }
    //   }
    // }

    /* Observer pattern : update function
    */
    updateVideoControler(){
      var that = this;
      this.current_frame = vidCtrl.getCurrentFrame();
      this.moveReadLine();
      var half_chart_width = $('#'+this.id_chart).width()
      half_chart_width += TimeLine.TRBL()[1] +TimeLine.TRBL()[3]
      half_chart_width = half_chart_width / 2 + TimeLine.TRBL()[3];
      var scrollLeftValue = this.x1(this.current_frame) - half_chart_width;

      $('#'+this.id_chart).animate({
        scrollLeft: scrollLeftValue
        }, 1
      )
    }

    /* Observer pattern : update function
    */
    updateVisualizer() {
      var saveScrollLeftValue = $('#'+this.id_chart).prop('scrollLeft')
      var that = this;
      var data = this.visualizer.getTimeLineData();
      this.current_frame = vidCtrl.getCurrentFrame();
      this.entries = [];
      $(data).each(function(i,e){
        that.entries.push(e.name);
      });
      this.items = []
      $(data).each(function(i,entry){
        $(entry.intervals).each(function(j,interval){
          that.items.push(interval);
        })
      })
      $('#' + this.div_id).empty();
      this.draw();
      this.moveReadLine();
      $('#'+this.id_chart).animate({
        scrollLeft: saveScrollLeftValue
        }, 1
      )
      if(this.index_used_rect !== -1 &&
        typeof vidCtrl.focusedTimeLine !== 'undefined' &&
        vidCtrl.isFocusedTimeLine &&
        vidCtrl.focusedTimeLine.equals(this)){
        var current_item = this.items[this.index_used_rect];
        var my_selected_color = TimeLine.MY_SELECTED_COLOR();
        var used_rect = $('#'+this.div_id).find('rect[number="'+this.index_used_rect+'"]')
        $(used_rect).css('fill', my_selected_color[current_item.index % my_selected_color.length]);
        vidCtrl.setPlayingInterval(current_item.start, current_item.end);
        vidCtrl.setPartialPlaying(true);
        if(current_item.start < current_item.end  && vidCtrl.isPlaying ){
          vidCtrl.play();
        }
      }
    }

    moveReadLine(){
      x = this.x1(this.current_frame)
      $('#'+this.id_chart).find('#read_line').attr('x1', x)
                                            .attr('x2', x);
    }
}
