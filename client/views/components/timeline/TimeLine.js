export class TimeLine {
    constructor(frameRate,nbFrame,data,idTimeLine) {
    id_time_line = idTimeLine;
    debut = 0;
    fin = nbFrame;
    rect_actif = -1;
    frame_rate = frameRate;
    nb_frame = nbFrame;
    entry = ["Frame","Shot","Scene"];
    entry_length = entry.length;
    items = data;
    vidCtrl.setPlayingInterval(debut,fin);
    extMargin = 5;
    wTot = 960;
    lineH = 30;
    numFrame = 0;
    lineHeight = 30;
    hTot = lineHeight * entry_length;
    trbl = [20, 15, 15, 120]; //top right bottom left;
    genH = hTot - 2 * extMargin;
    genW = wTot - 2 * extMargin - trbl[1] - trbl[3];
    myColor = ["#ff1010", "#1010ff", "#10C010"];
    mySelectedColor = ['#801010', "#101080", "#106010"];
    timeL = d3.select("#"+id_time_line)
                     .append("svg")
                     .attr("width", 960)
                     .attr("height", 120)
                     .attr("class", "chart");
    timeL.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', wTot)
            .attr('height', hTot + 20)
            .style('fill', '#f2f2f2');
    gen = timeL.append("g")
            .attr("transform", "translate(" + (trbl[3] + extMargin) + "," + (trbl[0] + extMargin) + ")")
            .attr("width", genW)
            .attr("height", genH)
            .attr("class", "general");
    y1 = d3.scale.linear()
            .domain([0, entry_length])
            .range([0, genH]);

    x1 = d3.scale.linear()
            .domain([0, nb_frame])
            .range([0, genW]);

    blockPlay = function(d, i) {
        if (rect_actif !== -1) {
            var id = "#rect"+i;
            var old_rect = $(id);
           // console.log("old_rect: " + old_rect.style)
          old_rect.attr("style").fill = myColor[items[rect_actif].entry];
        }
        if ((rect_actif !== i) | ( vidCtrl.getPartialPlaying() === false)) {
            debut = d.start;
            fin = d.end;
            var id = "#rect"+i;
            var new_rect = $(id );
          console.log("new_rect: " + new_rect.attr("style"));
            new_rect.attr("style").fill = mySelectedColor[d.entry];
            rect_actif = i;
            vidCtrl.setPartialPlaying(true);
            vidCtrl.setPlayingInterval(debut,fin);
            console.log("debut = " + debut + " fin = " + fin);
            vidCtrl.play();
        } else {
            rect_actif = -1;
            vidCtrl.setPartialPlaying(false);
        }
    };
    gen.selectAll(".entryLines")
            .data(entry)
            .enter().append("line")
            .attr("x1", 0)
            .attr("y1", function (d, i) {
                return y1(i + 1);
            })
            .attr("x2", genW)
            .attr("y2", function (d, i) {
                return y1(i + 1);
            })
            .attr("stroke", "lightgray");
    gen.selectAll(".movPart")
            .data(items)
            .enter().append("rect")
            .attr("x", function (d) {
                return x1(d.start + 0.1);
            })
            .attr("y", function (d) {
                return y1(d.entry + 0.1);
            })
            .attr("width", function (d) {
                return Math.max(x1(d.end - 0.1) - x1(d.start), 10);
            })
            .attr("height", function (d) {
                return y1(0.8);
            })
            .attr("id", function (d, i) {
              if(d.start === d.end){
                    return d.start;
                }else {
                  return "rect" + i;

                }
            })
            .attr("class", function(d){
                if(d.start === d.end){
                    return "frame";
                }else {
                    return "other";
                }
            })
            .style("fill", function (d) {
                return myColor[d.entry];
            })
            .attr("stroke", "lightgray")
            .on("click", blockPlay);

    timeL.append("text")
            .text("General timeline :")
            .attr("x", 0)
            .attr("y", y1(.5))
            .attr("text-anchor", "start")
            .attr("dy", ".5ex")
            .style("font-size", "20px")
            .style("font-weight", "bold");

    gen.selectAll(".entryText")
            .data(entry)
            .enter().append("text")
            .text(function (d) {
                return d;
            })
            .attr("x", - trbl[1])
            .attr("y", function (d, i) {
                return y1(i + .5);
            })
            .attr("dy", ".5ex")
            .attr("text-anchor", "end");
    }
}
