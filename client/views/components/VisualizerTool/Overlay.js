import * as d3 from 'd3';
import { XMLXSDForm } from '../VisualizerTool/XMLXSDForm.js'
export class Overlay{
  /*
  @data: is an array of timeId and positions
  @divId: the id of html div which will contain the overlay
  @visualizer: the visualizer which created the overlay
  */
  constructor(data, divId, visualizer){
    this.data = data;
    this.divId = divId;
    this.visualizer = visualizer;
    this.points=[];
    this.rects=[];
    this.xmlxsdForm = undefined;
    this.firstDrawCircles = true;
    this.firstDrawRect = true;
    this.line = null;
    this.dragged = null;
    this.selected = null;
    this.distancesRect = {};
    vidCtrl.attach(this,1);
    this.draw_circles();
    this.draw_rect();
  }

  /* Set the new XMLXSDForm
  */
  setXMLXSDForm(xmlxsdForm){
    if(xmlxsdForm instanceof XMLXSDForm){
      this.xmlxsdForm = xmlxsdForm;
    }
  }

  /* Draw circles based on this.points and their events
  */
  draw_circles(){
    var x1;
    var y1;

    if(this.firstDrawCircles){

      //Line is used to join each points
      this.line = d3.line()
        .curve(d3.curveCardinal);

      var svg = d3.select("#"+this.divId).append("svg")

      $('#' + this.divId).find("svg").css({
        'width': $('#videoContainer').width() + 'px',
        'height': $('#videoContainer').height() + 'px'
      })
      var width = $('#' + this.divId).find('svg').width();
      var height = $('#' + this.divId).find('svg').height();
      var that = this;

      svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .on("mousemove", function() { mousemove();})
      .on("mouseup", function() { mouseup();});

      //y1 and x1 are used to scale everything with the width and height of the page and so the width and height of the svg
      y1 = d3.scaleLinear()
      .domain([0, 1])
      .range([0, height]);

      x1 = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width]);

      this.line.x(function(d) {
        return x1(d.x);
      })
      .y(function(d) {
        return y1(d.y);
      });
      svg.append("path")
      .attr("class", "line")

      that = this

      if(svg.node()){
        svg.node().focus();
      }
      this.firstDrawCircles = false;
    }
    else{
      var svg = d3.select('#' + this.divId).select("svg")
      var that = this;
      svg.select("path")
      .datum(this.points)
      .attr("class", "line")

      //Call redraw internal function each time draw_circles is called after first time
      d3.select(window)
      .call(function(){redraw();})
    }

    /*
      Internal function that will redraw svg and all circles
    */
    function redraw() {
      var width = $('#' + that.divId).find('svg').width();
      var height = $('#' + that.divId).find('svg').height();

      //Used to set the good selected circle or select the last of the array
      var pointSelected = false;
      if(that.selected!=null){
        that.points.forEach(function(point){
          if(point.x != null && point.y != null && that.selected.x != null && that.selected.y != null){
            if(point.x.toFixed(4) == that.selected.x.toFixed(4) && point.y.toFixed(4) == that.selected.y.toFixed(4)){
              that.selected = point;
              pointSelected = true;
            }
          }
        });
      }

      if(that.points.length>0 && !pointSelected){
        that.selected = that.points[that.points.length-1];
      }
      y1 = d3.scaleLinear()
      .domain([0, 1])
      .range([0, height]);

      x1 = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width]);

      that.line.x(function(d) {
        return x1(d.x);
      })
      .y(function(d) {
        return y1(d.y);
      });

      svg.select("rect").attr("width",width)
      .attr("height",height);

      svg.select("path").attr("d", that.line);

      //Draw a new circle for every point(x,y) in the data
      var circle = svg.selectAll("circle")
      .data(that.points);

      circle.enter().append("circle")
      .attr("r", 1e-6)
      .on("mousedown", function(d) {
        that.selected = that.dragged = d;
        if(d.stack!=null &&
          that.xmlxsdForm instanceof XMLXSDForm){
          that.xmlxsdForm.displayForm(d.stack);
        }
        redraw();
       })
       .on('mouseup', function(d){
         //Update the data in the form when a circle has been dragged and dropped
           if(typeof d.stack !== 'undefined'){
             if(d.x != null && d.y != null){
               var newX = d.x.toFixed(4)
               var newY = d.y.toFixed(4)
               if(typeof d.stack[d.stack.length - 1].obj.attrs.x !== 'undefined' &&
                 typeof d.stack[d.stack.length - 1].obj.attrs.y !== 'undefined'){
                   var oldX = d.stack[d.stack.length - 1].obj.attrs.x.value
                   var oldY = d.stack[d.stack.length - 1].obj.attrs.y.value
                   if(oldX !== newX || oldY !== newY)
                   d.stack[d.stack.length - 1].obj.attrs.x.setValue(newX);
                   d.stack[d.stack.length - 1].obj.attrs.y.setValue(newY);
                 }
               that.visualizer.notifyAll()
             }
           }
           that.dragged = null;
       })
      .transition()
      .duration(750)
      .ease(d3.easeElastic)
      .attr("r", 6.5);

      svg.selectAll("circle").classed("selected", function(d) { return d === that.selected; })
      .attr("cx", function(d) { return x1(d.x); })
      .attr("cy", function(d) { return y1(d.y); });


      circle.exit().remove();

    }

    /*
      Function not used : allow to create a new circle on click
    */
    // function mousedown() {
    //   var width = $('#' + that.divId).find('svg').width();
    //   var height = $('#' + that.divId).find('svg').height();
    //   var m = d3.mouse(svg.node());
    //   var x = m[0]/width;
    //   var y = m[1]/height;
    //   var coordinates = {};
    //   coordinates.x = x;
    //   coordinates.y = y;
    //   that.points.push(that.selected = that.dragged = coordinates);
    //   that.draw_circles();
    // }

    /*
    Internal function used when user drag a circle
    */
    function mousemove() {
      if (!that.dragged) return;
      var m = d3.mouse(svg.node());
      var width = $('#' + that.divId).find('svg').width();
      var height = $('#' + that.divId).find('svg').height();
      var x = m[0]/width;
      var y = m[1]/height;
      if(that.dragged.x != null && that.dragged.y != null){
        that.dragged.x = Math.max(0, Math.min(1, x));
        that.dragged.y = Math.max(0, Math.min(1, y));
        that.draw_circles();
      }
    }

    /*
    Internal function called when user drop a circle
    */
    function mouseup() {
      if (!that.dragged) return;
      mousemove();
      that.dragged = null;
    }

  }

  /*
    Draw rectangles based on this.rect and their events. Works almost same as draw_circles
    but with rectangles and another drag & drop function
  */
  draw_rect(){
    var x1;
    var y1;

    if(this.firstDrawRect){

      var svg = d3.select("#"+this.divId).select("svg");

      $('#' + this.divId).find("svg").css({
        'width': $('#videoContainer').width() + 'px',
        'height': $('#videoContainer').height() + 'px'
      })
      var width = $('#' + this.divId).find('svg').width();
      var height = $('#' + this.divId).find('svg').height();
      var that = this;

      y1 = d3.scaleLinear()
      .domain([0, 1])
      .range([0, height]);

      x1 = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width]);

      that = this

      if(svg.node()){
        svg.node().focus();
      }
      this.firstDrawRect = false;
    }
    else{
      var svg = d3.select('#' + this.divId).select("svg")
      var that = this;

      d3.select(window)
      .call(function(){redraw();});
    }

    /*
      Internal function that will redraw svg and all rectangles
    */
    function redraw() {
      var width = $('#' + that.divId).find('svg').width();
      var height = $('#' + that.divId).find('svg').height();

      if(that.selected!=null){
        that.rects.forEach(function(rect){

          if(rect.top != null && rect.right != null && rect.bottom != null && rect.left != null &&
          that.selected.top != null && that.selected.right != null && that.selected.bottom != null && that.selected.left != null){
            if(rect.top.toFixed(4) == that.selected.top.toFixed(4) && rect.right.toFixed(4) == that.selected.right.toFixed(4) &&
            rect.bottom.toFixed(4) == that.selected.bottom.toFixed(4) && rect.left.toFixed(4) == that.selected.left.toFixed(4)){
              that.selected = rect;
            }
          }
        });
      }

      y1 = d3.scaleLinear()
      .domain([0, 1])
      .range([0, height]);

      x1 = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width]);

      // class .face is used on data rectangles to avoid removing the first svg rectangle which is the container
      svg.selectAll('.face').remove();

      var rect = svg.selectAll('.face')
      .data(that.rects);

      rect.enter().append('rect')
      .attr('x', function (d) {
          return x1(d.left);
      })
      .attr('y', function (d) {
          return y1(d.top);
      })
      .attr('width', function (d) {
          return (x1(d.right) - x1(d.left));
      })
      .attr('height', function (d) {
          return (y1(d.bottom) - y1(d.top));
      })
      .attr('number', function (d, i) {return i;})
      .attr('stroke', function(d) { if(d=== that.selected) return '#76ff03'; return 'white'})
      .attr('stroke-width',3)
      .attr('cursor','move')
      .attr('class','face')
      .on("mousedown", function(d) {
        that.selected = d;
        if(d.stack!=null &&
          that.xmlxsdForm instanceof XMLXSDForm){
          that.xmlxsdForm.displayForm(d.stack);
        }
      })

      //Drag and drop function of d3js v4
      svg.selectAll(".face").call(d3.drag().on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded));

      rect.exit().remove();

    }

    /*
    Function called whenever a rectangle start to be dragged
    */
    function dragStarted(d) {
      d3.select(this).raise().classed("active", true);
      var width = $('#' + that.divId).find('svg').width();
      var height = $('#' + that.divId).find('svg').height();
      that.distancesRect.x = d3.event.x/width - d.left;
      that.distancesRect.y = d3.event.y/height - d.top;
    }

    /*
    Function called when a rectangle is getting dragged
    */
    function dragged(d) {

      var width = $('#' + that.divId).find('svg').width();
      var height = $('#' + that.divId).find('svg').height();

      var y1 = d3.scaleLinear()
      .domain([0, 1])
      .range([0, height]);

      var x1 = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width]);

      var dWidth = d.right - d.left;
      var dHeight = d.bottom - d.top;

      d.left = Math.max(0, Math.min(1-dWidth, d3.event.x/width - that.distancesRect.x));
      d.top = Math.max(0, Math.min(1-dHeight, d3.event.y/height - that.distancesRect.y));
      d.right = d.left + dWidth;
      d.bottom = d.top + dHeight;

      d3.select(this)
      .attr("x", d.x = x1(d.left))
      .attr("y", d.y = y1(d.top));
    }

    /*
    Function called when a rectangle is getting dropped. Will update the data of the xmlxsdForm
    */
    function dragEnded(d) {
      d3.select(this).classed("active", false);
      if(typeof d.stack !== 'undefined'){
        if(d.right != null && d.top != null && d.left != null && d.bottom != null){
          var newRight = d.right.toFixed(4);
          var newTop = d.top.toFixed(4);
          var newLeft = d.left.toFixed(4);
          var newBottom = d.bottom.toFixed(4);
          if(typeof d.stack[d.stack.length - 1].obj.attrs.right !== 'undefined' &&
            typeof d.stack[d.stack.length - 1].obj.attrs.top !== 'undefined' &&
            typeof d.stack[d.stack.length - 1].obj.attrs.left !== 'undefined' &&
            typeof d.stack[d.stack.length - 1].obj.attrs.bottom !== 'undefined'){
              var oldRight = d.stack[d.stack.length - 1].obj.attrs.right.value;
              var oldTop = d.stack[d.stack.length - 1].obj.attrs.top.value;
              var oldLeft = d.stack[d.stack.length - 1].obj.attrs.left.value;
              var oldBottom = d.stack[d.stack.length - 1].obj.attrs.bottom.value;
              if(oldRight !== newRight || oldTop !== newTop || oldLeft !== newLeft || oldBottom !== newBottom){
                d.stack[d.stack.length - 1].obj.attrs.right.setValue(newRight);
                d.stack[d.stack.length - 1].obj.attrs.top.setValue(newTop);
                d.stack[d.stack.length - 1].obj.attrs.left.setValue(newLeft);
                d.stack[d.stack.length - 1].obj.attrs.bottom.setValue(newBottom);
              }
            }
          that.visualizer.notifyAll()
        }
      }
    }
  }

  /* Observer pattern : update function
  */
  updateVideoControler(){
    this.update();
  }

  /* Observer pattern : update function
  */
  updateVisualizer(){
    this.update()
  }

  /* Observer pattern : update function
  */
  update(){
    var currentFrame = vidCtrl.getCurrentFrame();
    this.data = this.visualizer.getOverlayData();
    this.points = [];
    this.rects = [];
    var newData =this.data.find( d => d.timeId == currentFrame);
    var that = this;
    if(newData!=null){
      newData.positions.forEach(function(elem){

        //Circle CharacterExtractVisualizer
        if(elem.x != null && elem.y != null){
          if(that.points.find( p => (p.x == elem.x && p.y == elem.y))==null){
            that.points.push(elem);
          }
        }

        //Rect case
        if(elem.top != null && elem.right != null && elem.bottom != null && elem.left != null){
          if(that.rects.find( p => (p.top == elem.top && p.right == elem.right && p.bottom == elem.bottom && p.left == elem.left))==null){
            that.rects.push(elem);
          }
        }
      });
    }
    this.draw_circles();
    this.draw_rect();
  }
}
