export class Visual{
  //data is an array of timeId and positions
  constructor(data){
    this.points=[];
    this.data = data;
    this.firstDraw = true;
    this.draw_circles();
  }

  notify(currentFrame){
    console.log("NOTIFIED",currentFrame);
    this.points = [];
    var newPoints =this.data.find( d => d.timeId == currentFrame);
    var that = this;
    if(newPoints!=null){
      newPoints.position.forEach(function(point){
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

    var dragged = null;
    var selected = null;
    if(this.points.length>0){
      selected = this.points[0];
    }
    if(this.firstDraw){
      var line = d3.svg.line();
      line.interpolate("cardinal");

      var svg = d3.select("#overlay").append("svg")

      $('#overlay').find("svg").css({
        'width': $('#videoContainer').width() + 'px',
        'height': $('#videoContainer').height() + 'px'
      })
      var width = $('#overlay').find('svg').width();
      var height = $('#overlay').find('svg').height();

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

      line.x(function(d) {
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
    }
    else{
      var svg = d3.select("#overlay").select("svg")
      var that = this;
      svg.select("path")
      .datum(that.points)
      .attr("class", "line")
      .attr("tabindex", 3)
      .call(redraw);


    }



    function redraw() {

      var width = $('#overlay').find('svg').width();
      var height = $('#overlay').find('svg').height();

      y1 = d3.scale.linear()
      .domain([0, 1])
      .range([0, height]);

      x1 = d3.scale.linear()
      .domain([0, 1])
      .range([0, width]);


      svg.select("rect").attr("width",width)
      .attr("height",height);


      svg.select("path").attr("d", line);
      var circle = svg.selectAll("circle")
      .data(that.points, function(d) { return d; });

      circle.enter().append("circle")
      .attr("r", 1e-6)
      .on("mousedown", function(d) { selected = dragged = d; redraw(); })
      .transition()
      .duration(750)
      .ease("elastic")
      .attr("r", 6.5);

      circle.classed("selected", function(d) { return d === selected; })
      .attr("cx", function(d) { return x1(d[0]); })
      .attr("cy", function(d) { return y1(d[1]); });

      circle.exit().remove();

      if (d3.event) {
        d3.event.preventDefault();
        d3.event.stopPropagation();
      }
    }


    function mousedown() {
      var width = $('#overlay').find('svg').width();
      var height = $('#overlay').find('svg').height();
      var m = d3.mouse(svg.node());
      var x = m[0]/width;
      var y = m[1]/height;
      var coordinates = [x,y];
      that.points.push(selected = dragged = coordinates);

      redraw();
    }

    function mousemove() {
      if (!dragged) return;
      var m = d3.mouse(svg.node());
      var width = $('#overlay').find('svg').width();
      var height = $('#overlay').find('svg').height();
      var x = m[0]/width;
      var y = m[1]/height;
      var coordinates = [x,y];

      dragged[0] = Math.max(0, Math.min(1, x));
      dragged[1] = Math.max(0, Math.min(1, y));
      redraw();
    }

    function mouseup() {
      if (!dragged) return;
      mousemove();
      dragged = null;
    }

    function keydown() {
      if (!selected) return;
      switch (d3.event.keyCode) {
        case 8: // backspace
        case 46: { // delete
          var i = that.points.indexOf(selected);
          that.points.splice(i, 1);
          selected = that.points.length ? that.points[i > 0 ? i - 1 : 0] : null;
          redraw();
          break;
        }
      }
    }
    $( window ).resize(function() {
      setTimeout(function(){
        $('#overlay').find("svg").css({
          'width': $('#videoContainer').width() + 'px',
          'height': $('#videoContainer').height() + 'px'
        });
        redraw();
      },20);
    });
  }
}
