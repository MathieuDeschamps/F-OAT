import { XMLSelector } from '../XMLFilter/XMLSelector.js'
import { VideoControler } from '../VideoControler/VideoControler.js'
import { XMLXSDForm } from '../VisualizerTool/XMLXSDForm.js'
import * as d3 from 'd3';
export class TimeLine {

  // Constants
  static LINE_HEIGHT(){ return 30}
  static LINE_HEIGHT_SCROLL_BAR(){ return 15}
  static EXT_MARGIN(){ return 5}
  static MY_COLOR(){ return ['#9fa8da','#ffc107']}
  // static MY_SELECTED_COLOR(){ return ['#f0f', '#ff0']}
  static MY_SELECTED_COLOR(){ return ['#7986cb','#ffa000']}
  static SCALE_MIN(){return 30}

  /*
  @name: name of the extractor
  @nbFrames: number of frame of the video
  @data: used to build the time line
  @divId: id of the html div which will contain the timeline
  @visualizer: the visaulizer which created the overlay
  */
  constructor(name, nbFrames, xsdObj, data, divId, visualizer){
    this.name_extractor = name;
    this.nb_frames = nbFrames;
    this.xsd_obj = xsdObj;
    this.div_id = divId;
    this.xmlxsdForm = undefined;
    if(vidCtrl instanceof VideoControler &&
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
    this.chart_id = this.div_id+'_chart';
    var chart_div = $('<div/>');
    $(chart_div).addClass('divtimeline');
    $(chart_div).addClass('indigo');
    $(chart_div).addClass('lighten-5');
    $(chart_div).attr('id', this.chart_id);
    $('#'+this.div_id).append(chart_div);

    var filter_title = $('<h5/>');
    $(filter_title).addClass('indigo-text');
    $(filter_title).text(TAPi18n.__('filter')+' '+this.name_extractor +' :');
    $('#'+this.div_id).append(filter_title);

    this.filter_id = this.div_id+'_filter';
    var filter_div = $('<div/>');
    $(filter_div).addClass('divborder-config');
    $(filter_div).addClass('indigo');
    $(filter_div).addClass('lighten-5');
    $(filter_div).attr('id', this.filter_id);
    $('#'+this.div_id).append(filter_div);

    // these attributs following attributs are intiliased by draw
    this.scale_x1 = undefined;
    this.scale_x2 = undefined;
    // var first_draw = true;
    this.brush = undefined;
    this.main = undefined
    this.mini = undefined;

    this.draw();

    var xmlSelector = new XMLSelector(this.xsd_obj, this.name_extractor, this.filter_id);
    var xmlFilter = xmlSelector.getXMLFilter();
    xmlFilter.attach(this);
    this.visualizer.setTimeLineBuilderXMLFilter(xmlFilter);
    xmlSelector.generateSelector();
  }

  setXMLXSDForm(xmlxsdForm){
    if(xmlxsdForm instanceof XMLXSDForm){
      this.xmlxsdForm = xmlxsdForm;
    }
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

  /* Draw the time line in the div id
  */
  draw(){
    var that = this;
    var my_color = TimeLine.MY_COLOR();
    var my_selected_color = TimeLine.MY_SELECTED_COLOR();
    var that = this;

    var margin_left = 0;
    var max_length  = -1;
    var size = 0;
    this.entries.forEach(function(entry){
      if(entry.length < 10){
        size = 14
      }else{
        size =  9
      }
      if(parseInt(max_length) < entry.length){
        max_length = entry.length;
        margin_left = parseInt(entry.length * size)
      }
    })

    var margin = {top: 30, right: 20, bottom: 30, left: margin_left};

    var height_main = TimeLine.LINE_HEIGHT() * this.entries.length;
    var height_mini = TimeLine.LINE_HEIGHT_SCROLL_BAR() * this.entries.length;
    var height_total = height_main + height_mini + margin.top + margin.bottom + margin.bottom;

    $('#'+this.div_id).addClass('row')

    $('#'+this.chart_id).addClass('row')
    .css('height', height_total);
    var width_total = 0

    // Use the width of the parent which is render before the current div
    width_total = parseInt($('#'+this.div_id).parent().width())

    var width_main = width_total - margin.left - margin.right;

    // scales
    this.scale_x1 = d3.scaleLinear()
        .domain([1, this.nb_frames])
        .range([0, width_main]);
    this.scale_x2 = d3.scaleLinear()
        .domain([1, this.nb_frames])
        .range([0, width_main]);
    var scale_y1 = d3.scaleLinear()
        .domain([0, this.entries.length])
        .range([0, height_main]);
    var scale_y2 = d3.scaleLinear()
        .domain([0, this.entries.length])
        .range([0, height_mini]);

    // axis
    var axis_x1 = d3.axisBottom(this.scale_x1);
    var axis_x2 = d3.axisBottom(this.scale_x2);

    //brush
    this.brush = d3.brushX(this.scale_x2)
        .extent([[0,0],[width_main, height_mini]])
        .on('brush end', brushed);

    // zoom
    var zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width_main, height_main]])
        .extent([[0, 0], [width_main, height_main]])
        .on('zoom', zoomed);

    var chart = d3.select('#'+this.chart_id)
        .append('svg')
        .attr('width', width_total)
        .attr('height', height_total)
        .attr('class', 'chart')
        .call(zoom);

    chart.append('defs').append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', width_main)
        .attr('height', height_main);

    // chart title
    chart.append('text')
        .text(this.name_extractor)
        .attr('x', 0)
        .attr('y', margin.right)
        .attr('text-anchor', 'start')
        .attr('dy', '.5ex')
        .style('font-size', '20px')
        .style('font-weight', 'bold');


    this.main = chart.append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
        .attr('width', width_main)
        .attr('height', height_main)
        .attr('class', 'main');

    this.mini = chart.append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + (height_main + margin.top + margin.bottom) + ')')
        .attr('width', width_main)
        .attr('height', height_mini)
        .attr('class', 'mini');


    //main texts
    this.main.append('g').selectAll('.laneText')
        .data(this.entries)
        .enter().append('text')
        .text(function(d){;return d;})
        .attr('x', -margin.right)
        .attr('y', function(d, i) {return scale_y1(i + .5);})
        .attr('dy', '.5ex')
        .attr('text-anchor', 'end')
        .attr('class', 'laneText');

    // main axis x
    this.main.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate('+0+', '+(height_main+1)+')')
        .call(axis_x1);

    var itemRects = this.main.append("g")
        .attr("clip-path", "url(#clip)");

    //main read line
    this.main.append('line')
        .attr('class', 'read_line')
        .attr('x1', that.scale_x1(that.current_frame))
        .attr('x2', that.scale_x1(that.current_frame))
        .attr('y1', scale_y1.range()[0])
        .attr('y2', scale_y1.range()[1])
        .attr('stroke', 'black');

    //mini texts
    this.mini.append('g').selectAll('.laneText')
        .data(this.entries)
        .enter().append('text')
        .text(function(d) {return d;})
        .attr('x', -margin.right)
        .attr('y', function(d, i) {return scale_y2(i + .5);})
        .attr('dy', '.5ex')
        .attr('text-anchor', 'end')
        .attr('class', 'laneText')


    //mini item rects
    this.mini.append('g').selectAll('miniItems')
        .data(this.items)
        .enter().append('rect')
        .attr('class', function(d) {return 'miniItem' + d.index;})
        .attr('x', function(d) {return that.scale_x1(d.start);})
        .attr('y', function(d) {return scale_y2(d.index + .5) - 5;})
        .attr('width', function(d) {return Math.max(that.scale_x1(d.end - 0.1) - that.scale_x1(d.start), 2);})
        .attr('height', TimeLine.LINE_HEIGHT_SCROLL_BAR() - TimeLine.EXT_MARGIN())
        .style('fill', function (d, i) {return my_color[d.index % my_color.length];})
        .style('display', function(d){
          if(d.isDisplayed){return 'block';}
          else{return 'none';}
        });
    //mini read line
    this.mini.append('line')
        .attr('class', 'read_line')
        .attr('x1', that.scale_x2(that.current_frame))
        .attr('x2', that.scale_x2(that.current_frame))
        .attr('y1', 0)
        .attr('y2', height_mini)
        .attr('stroke', 'black');


    // mini axis x
    this.mini.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate('+0+', '+(height_mini+1)+')')
        .call(axis_x2);

    // brush container
    this.mini.append('g')
        .attr('class', 'brush')
        .attr('height', height_mini)
        .call(that.brush)
        .call(that.brush.move, this.scale_x1.range());

    function brushed(){
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      var rects;
      var s = d3.event.selection || that.scale_x2.range();
      that.scale_x1.domain(s.map(that.scale_x2.invert, that.scale_x2));
      that.main.select(".axis--x").call(axis_x1);
      var min = that.scale_x1.domain()[0]
      var max = that.scale_x1.domain()[1]
      that.moveReadLine();
      drawMainRect(min, max);

      // update zoom
      chart.call(zoom.transform, d3.zoomIdentity
        .scale(width_main / (s[1] - s[0]))
        .translate(-s[0], 0));
    }

    function zoomed(){
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore brush-by-zoom
        var t = d3.event.transform;
        that.scale_x1.domain(t.rescaleX(that.scale_x2).domain());
        that.main.select(".axis--x").call(axis_x1);
        var min = that.scale_x1.domain()[0]
        var max = that.scale_x1.domain()[1]

        that.moveReadLine();
        drawMainRect(min, max);

        // update the brush
        that.mini.select('.brush').call(that.brush.move, [that.scale_x2(min), that.scale_x2(max)])

      }

    function drawMainRect(min, max){
        // filter the rect to display on main
        var visItems = that.items.filter(function(d) {
          return d.start < max &&
          d.end > min;
        });

        //update old rect
        var rects = itemRects.selectAll("rect")
        .data(visItems, function(d){
          return d.id
        })
        .attr('class', function(d) {return 'mainItem' + d.index;})
        .attr('x', function(d) {return that.scale_x1(d.start);})
        .attr('width', function(d) {return Math.max(that.scale_x1(d.end - 0.1) - that.scale_x1(d.start), 5);})

        // add the new rect
        rects.enter().append('rect')
        .attr('class', function(d) {return 'mainItem' + d.index;})
        .attr('x', function(d) {return that.scale_x1(d.start);})
        .attr('y', function(d) {return scale_y1(d.index + .5) - 5;})
        .attr('width', function(d) {return Math.max(that.scale_x1(d.end - 0.1) - that.scale_x1(d.start), 5);})
        .attr('height', TimeLine.LINE_HEIGHT() - TimeLine.EXT_MARGIN())
        .attr('index', function(d){return d.index;})
        .attr('number', function (d) {return d.id;})
        .style('fill', function (d) {return getRectColor(d);})
        .style('display', function(d){
          if(d.isDisplayed){return 'block';}
          else{return 'none';}
        })
        .on('click', function(d){ that.blockPlay(d, this)});

        // remove the unneeded rect
        rects.exit().remove();
      }

    function getRectColor(item){
        if(that.index_used_rect === item.id  &&
          vidCtrl.focusedTimeLine instanceof TimeLine &&
          vidCtrl.isFocusedTimeLine &&
          vidCtrl.focusedTimeLine.equals(that))
        {
          var my_selected_color = TimeLine.MY_SELECTED_COLOR();
          return my_selected_color[item.index % my_selected_color.length];
        }else{
          var my_color = TimeLine.MY_COLOR();
          return my_color[item.index % my_color.length];
        }
      }
  }

  /* Event trigger when click on a rect of the time line
  @item: contains the data of the xml to the rectangle
  @target: is the html of the rectangle
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
        if(this.xmlxsdForm instanceof XMLXSDForm){
          this.xmlxsdForm.displayForm(item.stack);
        }
        if(item.start < item.end){
          vidCtrl.setPlayingInterval(item.start, item.end);
          vidCtrl.setPartialPlaying(true);
          vidCtrl.setCurrentFrame(item.start);
          // vidCtrl.play();
        }else if(item.start === item.end){
          vidCtrl.setCurrentFrame(item.start);
          vidCtrl.setPartialPlaying(false);
          vidCtrl.pause();
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
      var used_rect = $('#'+this.chart_id).find('rect[number="'+this.index_used_rect+'"]')
      if(used_rect.length > 0){
        var index_color = parseInt($(used_rect).attr('index'));
        var my_color = TimeLine.MY_COLOR();
        $(used_rect).css('fill', my_color[index_color % my_color.length]);
      }
    }
  }

  /* Observer pattern : update function
  */
  updateVideoControler(){
    this.current_frame = vidCtrl.getCurrentFrame();
    this.moveReadLine();

  }

  /* Observer pattern : update function
  */
  updateVisualizer() {
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
    $('#' + this.chart_id).find('svg').remove();
    var domain_x1 = this.scale_x1.domain();
    this.moveReadLine();
    this.draw();
    // update the brush
    that.mini.select('.brush').call(that.brush.move, [that.scale_x2(domain_x1[0]), that.scale_x2(domain_x1[1])])

    // update the selected main rectangle
    if(this.index_used_rect !== -1 &&
      vidCtrl.focusedTimeLine instanceof TimeLine &&
      vidCtrl.isFocusedTimeLine &&
      vidCtrl.focusedTimeLine.equals(this)){
      var current_item = $(this.items).filter(function(i, item){
        if(item.id === that.index_used_rect){
          return item
        }
      })[0];
      if(current_item.start < current_item.end  && vidCtrl.isPlaying ){
        vidCtrl.setPartialPlaying(true);
        vidCtrl.setPlayingInterval(current_item.start, current_item.end);
        vidCtrl.play();
      }else if(current_item.start === current_item.end){
        vidCtrl.setPartialPlaying(false);
        vidCtrl.setCurrentFrame(current_item.start)
      }
    }
  }

  /* Observer pattern : update function
  */
  updateXMLFilter(){
    this.updateVisualizer();
  }

  /* move the read lines of the time line
   on the current frame of the video controler
  */
  moveReadLine(){
      this.current_frame = vidCtrl.getCurrentFrame();
      // move the read line of main
      var x1 = this.scale_x1(this.current_frame);
      var main_read_line =   $('#'+this.chart_id).find('.read_line:eq(0)')

      // update the brush when the read line is out of the main  windows
      // or every 10 seconds
      // and the brush is not in full size
      if((x1 < this.scale_x1.range()[0] || x1 > this.scale_x1.range()[1] ||
         this.current_frame % (this.frame_rate * 10) === 0) &&
         vidCtrl.isPlaying &&
         this.current_frame < this.nb_frames &&
         this.current_frame > 1 &&
         !(this.scale_x1.domain()[0] === this.scale_x2.domain()[0] &&
         this.scale_x1.domain()[1] === this.scale_x2.domain()[1])
       ){
        var old_min = this.scale_x1.domain()[0];
        var old_max = this.scale_x1.domain()[1];
        var half_brush_size = (old_max - old_min) / 2 ;

        var new_min = this.current_frame - half_brush_size;
        if(new_min < this.scale_x2.domain()[0])new_min = this.scale_x2.domain()[0];

        var new_max = this.current_frame + half_brush_size;
        if(new_max > this.scale_x2.domain()[1])new_max = this.scale_x2.domain()[1];

        if(new_min >= new_max){
          new_min = old_min;
          new_max = old_max;
        }
        this.mini.select('.brush').call(this.brush.move, [this.scale_x2(new_min), this.scale_x2(new_max)])
      }

      if(x1 < this.scale_x1.range()[0] || x1 > this.scale_x1.range()[1]){
        $(main_read_line).css('opacity', 0)
      }else{
        $(main_read_line).css('opacity', 100)
      }
      $(main_read_line).attr('x1', x1)
          .attr('x2', x1);

      // move the read line of mini
      var x2 = this.scale_x2(this.current_frame);
      $('#'+this.chart_id).find('.read_line:eq(1)')
          .attr('x1', x2)
          .attr('x2', x2);

    }

}
