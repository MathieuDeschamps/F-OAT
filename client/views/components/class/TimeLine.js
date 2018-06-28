export class TimeLine {

    // Constants
    static LINE_HEIGHT(){ return 30}
    static EXT_MARGIN(){ return 5}
    static MY_COLOR(){ return ['#f9a825', '#1565c0']}
    // static MY_SELECTED_COLOR(){ return ['#f0f', '#ff0']}
    static MY_SELECTED_COLOR(){ return ['#f57f17', '#0d47a1']}
    static SCALE_MIN(){return 30}
    static SCROLL_HEIGTH(){ return 16}
    static TRBL(){
      /*top right bottom
        the
      */
      return [20, 15, 30, 5]
    }

    constructor(name, xmlxsdForm, nbFrames, data, divId, visualizer){
      this.div_id = divId;
      this.xmlxsdForm = xmlxsdForm
      this.name_extractor = name;
      this.nb_frames = nbFrames;
      if(typeof vidCtrl !== 'undefined' &&
        typeof vidCtrl.frameRate !== 'undefined'){
        this.frame_rate = vidCtrl.frameRate;
        // time line refresh every 30 secondes of the video
        var frequency = 1;
        vidCtrl.attach(this, frequency);
      }
      else{
        this.frame_rate = 30;
      }
        this.visualizer = visualizer;
      this.entries = []
      this.index_used_rect = -1;
      this.used_color = '';
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
      this.id_entries =  this.div_id+'_entries';
      this.id_chart =  this.div_id+'_chart';
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

    getScale(){
      if(this.nb_frames<2000){
        return 1
      }
      else if(this.nb_frames<10000){
       return (this.frame_rate / 100);
      }
      else if(this.nb_frames<50000){
        return (this.frame_rate / 200);
      }
      else if(this.nb_frames<100000){
        retrun (this.frame_rate / 500);
      }
      else{
        return (this.frame_rate / 1000);
      }
    }

    draw(){
      var my_color = TimeLine.MY_COLOR();
      var my_selected_color = TimeLine.MY_SELECTED_COLOR();
      var that = this;
      var scale = this.getScale();

      var width_total = TimeLine.TRBL()[3] + (this.nb_frames * scale);
      var gen_width = width_total - 2 * TimeLine.EXT_MARGIN() - TimeLine.TRBL()[1] - TimeLine.TRBL()[3];
      var scaleData = []
      for(var i = 0; i < this.nb_frames; i++){
        if((i / this.frame_rate) % TimeLine.SCALE_MIN() == 0){
          var min = Math.trunc((i / this.frame_rate) / 60)
          var sec = (i / this.frame_rate) % 60
          sec = ('0' + sec).slice(-2);
          scaleData.push({'time_id':i,'label':min + ':' + sec})
        }
      }
      var height_total = (TimeLine.LINE_HEIGHT() * (this.entries.length)) + 40;
      var gen_height = (TimeLine.LINE_HEIGHT() * this.entries.length) - (2 * TimeLine.EXT_MARGIN());
      var prec_timeLine = -1; // timeLine de l'ancien rectangle

      var debut = 0;
      var fin = this.nb_frames;


      var $entries = $('<div/>').attr('id', this.id_entries);
      var $chart = $('<div/>').attr('id', this.id_chart);


      $('#'+this.div_id).append($entries);
      $('#'+this.div_id).append($chart);
      $('#'+this.div_id).addClass('row')
                        .css('background-color', '#f2f2f2');
      // div height is the height of the svg + height horizontal scroll bar
      $('#'+this.id_entries).css('height_total', height_total + TimeLine.SCROLL_HEIGTH())
                      .addClass('col s2')
      // div height is the height of the svg + height horizontal scroll bar
      $('#'+this.id_chart).css('height', height_total + TimeLine.SCROLL_HEIGTH())
                      .addClass('col s10')
                      .css('overflow-x', 'auto')
                      .css('overflow-y', 'hidden')
      //generer la timeLine dans sa div
      var chart = d3.select('#'+this.id_chart)
              .append('svg')
      var entries = d3.select('#'+this.id_entries)
              .append('svg');

      $('#'+this.id_chart).find('svg').attr('width',width_total)
              .attr('height',height_total + TimeLine.SCROLL_HEIGTH())
              .css('position','relative');

      var gen = chart.append('g')
              .attr('transform', 'translate(' + (TimeLine.TRBL()[3] + TimeLine.EXT_MARGIN()) + ',' + (TimeLine.TRBL()[0] + TimeLine.EXT_MARGIN()) + ')')
              .attr('width', gen_width)
              .attr('height', gen_height)
              .attr('class', 'general');

      var y1 = d3.scale.linear()
              .domain([0, this.entries.length])
              .range([0, gen_height]);

      var x1 = d3.scale.linear()
              .domain([0, this.nb_frames])
              .range([0, gen_width]);

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
      var that = this;


      rect.enter().append('rect')
              .attr('x', function (d) {
                  return x1(d.start + 0.1);
              })
              .attr('y', function (d) {
                  return y1(d.index + 0.1);
              })
              .attr('width', function (d) {
                  return Math.max(x1(d.end - 0.1) - x1(d.start), 5);
              })
              .attr('height', function (d) {
                  return y1(0.8);
              })
              .attr('index', function (d, i) {
                  return i;
              })
              .style('fill', function (d, i) {
                if(that.index_used_rect === i){
                  return my_selected_color[d.index % my_selected_color.length];
                }else{
                  return my_color[d.index % my_color.length];
                }
              })
              .attr('stroke', 'lightgray')
              .on('click', function(d, i){ that.blockPlay(d, this)});

      gen.append('line')
              .attr('id', 'read_line')
              .attr('x1', x1(0))
              .attr('y1', 0)
              .attr('x2', x1(0))
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
              // .attr('dy', '.5ex')
              .attr('text-anchor', 'start')

      gen.selectAll('.scaleText')
              .data(scaleData)
              .enter().append('text')
              .text(function(d){
                return d.label;
              })
              .attr('x', function(d){
                return x1(d.time_id)
              })
              .attr('y', height_total - TimeLine.TRBL()[2]);

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

      if(typeof vidCtrl.focusTimeLine !== 'undefined'){
        vidCtrl.focusTimeLine.lostFocus();
      }

      if (save_index_used_rect !== parseInt($(target).attr('index')) || (!vidCtrl.getPartialPlaying())) {
        $(target).css('fill', my_selected_color[item.index % my_selected_color.length]);
        this.used_color = my_color[item.index % my_color.length];
        this.index_used_rect = parseInt($(target).attr('index'));
        this.xmlxsdForm.displayForm(item.stack)
        vidCtrl.setPlayingInterval(item.start, item.end);
        vidCtrl.setPartialPlaying(true);
        vidCtrl.focusTimeLine = this;
        if(item.start < item.end){
          vidCtrl.play();
        }
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
          $(used_rect).css('fill', this.used_color);
        }
        this.index_used_rect = -1;
      }
    }

    /* Observer pattern : update function
    */
    updateVisualizer() {
      var that = this;
      var data = this.visualizer.getTimeLineData();
      this.entries = []
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
        vidCtrl.setPlayingInterval(currentItem.start, currentItem.end);
      }
    }

    updateVideoControler(){
      var that = this;
      var currentFrame = vidCtrl.getCurrentFrame()
      var scale = this.getScale();
      var width_total = TimeLine.TRBL()[3] + (this.nb_frames * scale);
      var gen_width = width_total - 2 * TimeLine.EXT_MARGIN() - TimeLine.TRBL()[1] - TimeLine.TRBL()[3];
      var x1 = d3.scale.linear()
        .domain([0, this.nb_frames])
        .range([0, gen_width]);

      // console.log('frame: ', currentFrame, ' time: ', vidCtrl.getCurrentTime())
      // console.log('leftSpace: ', TimeLine.TRBL()[3] , ' scrollLeft: ', (currentFrame*scale) + TimeLine.TRBL()[3] )
      // console.log('scale: ', scale)

      $('#'+this.id_chart).find('#read_line').attr('x1', x1(currentFrame))
                                            .attr('x2', x1(currentFrame))
      $('#'+this.id_chart).animate({
        scrollLeft: (currentFrame * scale) + TimeLine.TRBL()[3]}, 1
      )
    }
}
