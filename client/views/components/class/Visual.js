export class Visual{
  //data is an array of timeId and positions
  constructor(data, divId){
    this.points=[];
    this.data = data;
    this.divId = divId;
    this.firstDraw = true;
    this.line = null;
    this.dragged = null;
    this.selected = null;

    this.draw_circles();
  }

  update(){
    this.notify(vidCtrl.getCurrentFrame());
  }

  notify(currentFrame){
    this.points = [];
    var newPoints =this.data.find( d => d.timeId == currentFrame);
    var that = this;
    if(newPoints!=null){
      newPoints.positions.forEach(function(point){
        var coordinates = [point.x,point.y];
        if(that.points.find( p => (p[0] == coordinates[0] && p[1] == coordinates[1]))==null){
          that.points.push(coordinates);
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

      svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("tabindex", 3)
      .on("mousedown", mousedown);

      y1 = d3.scale.linear()
      .domain([0, 1])
      .range([0, height]);

      x1 = d3.scale.linear()
      .domain([0, 1])
      .range([0, width]);

      this.line.x(function(d) {
        return x1(d[0]);
      })
      .y(function(d) {
        return y1(d[1]);
      });
      svg.append("path")
      .attr("class", "line")
      .attr("tabindex", 3)

      d3.select(window)
      .on("mousemove", mousemove)
      .on("mouseup", mouseup)
      .on("keydown", keydown);

      svg.node().focus();
      this.firstDraw = false;
      that = this;
    }
    else{
      var svg = d3.select("#overlay").select("svg")
      that = this;
      svg.select("path")
      .datum(that.points)
      .attr("class", "line")
      .attr("tabindex", 3)
      .call(redraw);


    }



    function redraw() {

      var width = $('#' + that.divId).find('svg').width();
      var height = $('#' + that.divId).find('svg').height();

      y1 = d3.scale.linear()
      .domain([0, 1])
      .range([0, height]);

      x1 = d3.scale.linear()
      .domain([0, 1])
      .range([0, width]);


      svg.select("rect").attr("width",width)
      .attr("height",height);

      svg.select("path").attr("d", that.line);

      var circle = svg.selectAll("circle")
      .data(that.points, function(d) { return d; });

      circle.enter().append("circle")
      .attr("r", 1e-6)
      .on("mousedown", function(d) { that.selected = that.dragged = d; redraw(); })
      .transition()
      .duration(750)
      .ease("elastic")
      .attr("r", 6.5);

      circle.classed("selected", function(d) { return d === that.selected; })
      .attr("cx", function(d) { return x1(d[0]); })
      .attr("cy", function(d) { return y1(d[1]); });

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
      var coordinates = [x,y];
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
      var coordinates = [x,y];

      that.dragged[0] = Math.max(0, Math.min(1, x));
      that.dragged[1] = Math.max(0, Math.min(1, y));
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
          that.points.splice(i, 1);
          that.selected = that.points.length ? that.points[i > 0 ? i - 1 : 0] : null;
          that.draw_circles();
          break;
        }
      }
    }
    $( window ).resize(function() {
      setTimeout(function(){
        $('#' + that.divId).find("svg").css({
          'width': $('#videoContainer').width() + 'px',
          'height': $('#videoContainer').height() + 'px'
        });
        that.draw_circles();
      },20);
    });
  }
}
