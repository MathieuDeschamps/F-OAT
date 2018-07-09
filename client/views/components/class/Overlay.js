import * as d3 from "d3";
export class Overlay{
  /*
  @data is an array of timeId and positions
  @divId the id of html div which will contain the overlay
  @visualizer the visualizer which created the overlay
  */
  constructor(data, divId, visualizer){
    this.data = data;
    this.divId = divId;
    this.visualizer = visualizer;
    this.points=[];
    this.xmlxsdForm = undefined;
    this.firstDraw = true;
    this.line = null;
    this.dragged = null;
    this.selected = null;
    vidCtrl.attach(this,1);
    this.draw_circles();
  }

  setXMLXSDForm(xmlxsdForm){
    this.xmlxsdForm = xmlxsdForm;
  }

  /* Draw points base on this.points and their events
  */
  draw_circles(){
    var x1;
    var y1;

    if(this.firstDraw){
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
      .attr("tabindex", 3)
      .on("mousedown", function() {mousedown(that);})
      .on("mousemove", function() { mousemove(that);})
      .on("mouseup", function() { mouseup(that);});

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
      .attr("tabindex", 3);

      that = this

      d3.select(window)
      .on("keydown", function() { keydown(that);});


      svg.node().focus();
      this.firstDraw = false;
    }
    else{
      var svg = d3.select('#' + this.divId).select("svg")
      var that = this;
      svg.select("path")
      .datum(this.points)
      .attr("class", "line")
      .attr("tabindex", 3)

      d3.select(window)
      .call(function(){redraw();})
      .on("keydown", function(){keydown();});
    }

    function redraw() {
      var width = $('#' + that.divId).find('svg').width();
      var height = $('#' + that.divId).find('svg').height();

      var pointSelected = false;
      if(that.selected!=null){
        that.points.forEach(function(point){
          if(point.x.toFixed(4) == that.selected.x.toFixed(4) && point.y.toFixed(4) == that.selected.y.toFixed(4)){
            that.selected = point;
            pointSelected = true;
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

      var circle = svg.selectAll("circle")
      .data(that.points);

      circle.enter().append("circle")
      .attr("r", 1e-6)
      .on("mousedown", function(d) {
        that.selected = that.dragged = d;
        if(d.stack!=null &&
          typeof that.xmlxsdForm != 'undefined'){
          that.xmlxsdForm.displayForm(d.stack);
        }
        redraw();
       })
       .on('mouseup', function(d){
           if(typeof d.stack !== 'undefined'){
             var newX = d.x
             var newY = d.y
             if(typeof d.stack[d.stack.length - 1].obj.attrs.x &&
               typeof d.stack[d.stack.length - 1].obj.attrs.y){
                 var oldX = d.stack[d.stack.length - 1].obj.attrs.x.value
                 var oldY = d.stack[d.stack.length - 1].obj.attrs.y.value
                 if(oldX !== newX || oldY !== newY)
                 d.stack[d.stack.length - 1].obj.attrs.x.setValue(newX);
                 d.stack[d.stack.length - 1].obj.attrs.y.setValue(newY);
               }
             that.visualizer.notifyAll()
           }
           that.dragged = null;
       })
      .transition()
      .duration(750)
      .ease(d3.easeElastic)
      .attr("r", 6.5);


      circle.classed("selected", function(d) { return d === that.selected; })
      .attr("cx", function(d) { return x1(d.x); })
      .attr("cy", function(d) { return y1(d.y); });


      circle.exit().remove();

      if (d3.event) {
        d3.event.preventDefault();
        d3.event.stopPropagation();
      }
    }


    function mousedown() {
      var width = $('#' + that.divId).find('svg').width();
      var height = $('#' + that.divId).find('svg').height();
      var m = d3.mouse(svg.node());
      var x = m[0]/width;
      var y = m[1]/height;
      var coordinates = {};
      coordinates.x = x;
      coordinates.y = y;
      that.points.push(that.selected = that.dragged = coordinates);
      that.draw_circles();
    }

    function mousemove() {
      if (!that.dragged) return;
      var m = d3.mouse(svg.node());
      var width = $('#' + that.divId).find('svg').width();
      var height = $('#' + that.divId).find('svg').height();
      var x = m[0]/width;
      var y = m[1]/height;
      that.dragged.x = Math.max(0, Math.min(1, x));
      that.dragged.y = Math.max(0, Math.min(1, y));
      that.draw_circles();
    }

    function mouseup() {
      if (!that.dragged) return;
      mousemove();
      that.dragged = null;
    }

    function keydown() {
      if (!that.selected) return;
      switch (d3.event.keyCode) {
        case 8: // backspace
        case 46: { // delete
          var i = that.points.indexOf(that.selected);
          var stack = that.selected.stack
          if(typeof stack === 'undefined'){
            that.points.splice(i, 1);
            that.selected = that.points.length ? that.points[i > 0 ? i - 1 : 0] : null;
            that.draw_circles();
          }else if(stack.length > 1){
            var element = stack[stack.length - 1];
            var parent = stack[stack.length - 2].obj
            var xmlxsdElt
            // case of parent is of type XSDElt we get the first sequence
            if(typeof parent.eltsList !== 'undefined' &&
            parent.eltsList.length > 0){
              parent =  parent.eltsList[0]
            }

            // case parent is of type XSDSequence
            if(typeof parent.seqList !== 'undefined'){
              parent.seqList[0].forEach(function(elt){
                if(elt.name === element.tag){
                  xmlxsdElt = elt
                }
              })
            }

            if(typeof xmlxsdElt !== 'undefined'){
              var index = xmlxsdElt.eltsList.indexOf(element.obj)
              var deleted = xmlxsdElt.deleteElement(index)
              if(deleted){
                that.points.splice(i, 1);
                if(typeof that.xmlxsdForm !== 'undefined'){
                  that.xmlxsdForm.displayForm(stack.splice(0, stack.length-1))
                }
                that.selected = that.points.length ? that.points[i > 0 ? i - 1 : 0] : null;
                that.draw_circles();
                that.visualizer.notifyAll();
              }
            }
          }

          break;
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
    var newPoints =this.data.find( d => d.timeId == currentFrame);
    var that = this;
    if(newPoints!=null){
      newPoints.positions.forEach(function(point){
        if(that.points.find( p => (p.x == point.x && p.y == point.y))==null){
          that.points.push(point);
        }
      });
    }
    this.draw_circles();
  }
}
