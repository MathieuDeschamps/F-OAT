export class Visual{
    static draw_circles(){
        var points = [
	           [100, 80],
	           [100, 100],
               [200, 30],
               [300, 50],
               [400, 40],
               [500, 80]];

    var dragged = null,
        selected = points[0];

    var line = d3.svg.line();
    line.interpolate("cardinal");
    var svg = d3.select("#overlay").append("svg")

    var width = $('svg').width();
    var height = $('svg').height();

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("tabindex", 3)
        .on("mousedown", mousedown);

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

    function redraw() {
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

      circle
          .classed("selected", function(d) { return d === selected; })
          .attr("cx", function(d) { return d[0]; })
          .attr("cy", function(d) { return d[1]; });

      circle.exit().remove();

      if (d3.event) {
        d3.event.preventDefault();
        d3.event.stopPropagation();
      }
    }

    function mousedown() {
      points.push(selected = dragged = d3.mouse(svg.node()));
      redraw();
    }

    function mousemove() {
      if (!dragged) return;
      var m = d3.mouse(svg.node());
      dragged[0] = Math.max(0, Math.min(width, m[0]));
      dragged[1] = Math.max(0, Math.min(height, m[1]));
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
