export class Visual{
    static draw_circles(){
      var x1;
      var y1;

        var points = [
	           [0.100, 0.80],
	           [0.100, 0.100],
               [0.200, 0.30],
               [0.300, 0.50],
               [0.400, 0.40],
               [0.500, 0.80]];

    var dragged = null,
        selected = points[0];

    var line = d3.svg.line();
    line.interpolate("cardinal");
    var svg = d3.select("#overlay").append("svg")
    Tracker.autorun(function doWhenVideoPlayerRendered(computation) {
      if(Session.get('videoPlayer') === 1) {
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
            .datum(points)
            .attr("class", "line")
            .attr("tabindex", 3)
            .call(redraw);

        d3.select(window)
            .on("mousemove", mousemove)
            .on("mouseup", mouseup)
            .on("keydown", keydown);

        svg.node().focus();

        computation.stop();
      }
    });

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
          .data(points, function(d) { return d; });

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

    $( window ).resize(function() {
      setTimeout(function(){
        $('#overlay').find("svg").css({
          'width': $('#videoContainer').width() + 'px',
          'height': $('#videoContainer').height() + 'px'
        });
        redraw();
      },20);

    });

    function mousedown() {
      var width = $('#overlay').find('svg').width();
      var height = $('#overlay').find('svg').height();
      var m = d3.mouse(svg.node());
      var x = m[0]/width;
      var y = m[1]/height;
      var coordinates = [x,y];
      points.push(selected = dragged = coordinates);

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
          var i = points.indexOf(selected);
          points.splice(i, 1);
          selected = points.length ? points[i > 0 ? i - 1 : 0] : null;
          redraw();
          break;
        }
      }
    }
    }
}
