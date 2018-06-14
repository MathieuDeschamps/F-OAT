export class Overlay{
  //data is an array of timeId and positions
  constructor(data, xmlxsdForm, divId, visualizer){
    this.data = data;
    this.xmlxsdForm = xmlxsdForm;
    this.divId = divId;
    this.visualizer = visualizer;
    this.points=[];
    this.firstDraw = true;
    this.line = null;
    this.dragged = null;
    this.selected = null;
    this.draw_circles();
  }

  update(){
      this.data = this.visualizer.getDataOverlay();
      this.notify(vidCtrl.getCurrentFrame());
  }

  notify(currentFrame){
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

  draw_circles(){
    var x1;
    var y1;

    if(this.firstDraw){
      this.line = d3.svg.line();
      this.line.interpolate("cardinal");

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
      .on("mousedown", function() {mousedown(that);});

      y1 = d3.scale.linear()
      .domain([0, 1])
      .range([0, height]);

      x1 = d3.scale.linear()
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
      .attr("tabindex", 3)
      that = this
      d3.select(window)
      .on("mousemove", function() { mousemove(that);})
      .on("mouseup", function() { mouseup(that);})
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
      .call(function() {redraw(that);});


    }



    function redraw(overlay) {
      var width = $('#' + overlay.divId).find('svg').width();
      var height = $('#' + overlay.divId).find('svg').height();

      y1 = d3.scale.linear()
      .domain([0, 1])
      .range([0, height]);

      x1 = d3.scale.linear()
      .domain([0, 1])
      .range([0, width]);

      overlay.line.x(function(d) {
        return x1(d.x);
      })
      .y(function(d) {
        return y1(d.y);
      });

      svg.select("rect").attr("width",width)
      .attr("height",height);

      svg.select("path").attr("d", overlay.line);

      var circle = svg.selectAll("circle")
      .data(overlay.points);

      circle.enter().append("circle")
      .attr("r", 1e-6)
      .on("mousedown", function(d) {
        overlay.selected = overlay.dragged = d;
        if(d.obj!=null && d.stack!=null){
          overlay.xmlxsdForm.displayForm(d.obj,d.stack);
        }
        redraw(overlay);
       })
      .transition()
      .duration(750)
      .ease("elastic")
      .attr("r", 6.5);

      circle.classed("selected", function(d) { return d === overlay.selected; })
      .attr("cx", function(d) { return x1(d.x); })
      .attr("cy", function(d) { return y1(d.y); });

      circle.exit().remove();

      if (d3.event) {
        d3.event.preventDefault();
        d3.event.stopPropagation();
      }
    }


    function mousedown(overlay) {
      var width = $('#' + overlay.divId).find('svg').width();
      var height = $('#' + overlay.divId).find('svg').height();
      var m = d3.mouse(svg.node());
      var x = m[0]/width;
      var y = m[1]/height;
      var coordinates = {};
      coordinates.x = x;
      coordinates.y = y;
      overlay.points.push(overlay.selected = overlay.dragged = coordinates);

      overlay.draw_circles();
    }

    function mousemove(overlay) {
      if (!overlay.dragged) return;
      var m = d3.mouse(svg.node());
      var width = $('#' + overlay.divId).find('svg').width();
      var height = $('#' + overlay.divId).find('svg').height();
      var x = m[0]/width;
      var y = m[1]/height;
      overlay.dragged.x = Math.max(0, Math.min(1, x));
      overlay.dragged.y = Math.max(0, Math.min(1, y));
      overlay.draw_circles();
    }

    function mouseup(overlay) {
      if (!overlay.dragged) return;
      mousemove(overlay);
      overlay.dragged = null;
    }

    function keydown(overlay) {
      if (!overlay.selected) return;
      switch (d3.event.keyCode) {
        case 8: // backspace
        case 46: { // delete
          var i = overlay.points.indexOf(overlay.selected);
          overlay.points.splice(i, 1);
          overlay.selected = overlay.points.length ? overlay.points[i > 0 ? i - 1 : 0] : null;
          overlay.draw_circles();
          break;
        }
      }
    }
  }
}
