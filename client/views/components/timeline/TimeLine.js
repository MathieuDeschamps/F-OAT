export class TimeLine {
    constructor(name,frameRate,nbFrame,data,idTimeLine) {
    id_time_line = "timeLine" + idTimeLine;
    debut = 0;
    fin = nbFrame;
    rect_actif = -1;
    frame_rate = frameRate;
    nb_frame = nbFrame;
    entry = ["Frame","Shot","Scene"];
    entry_length = entry.length;
    items = data;
    vidCtrl.setPlayingInterval(debut,fin);
    ext_margin = 5;
    width_total = 960;
    line_height = 30;
    height_total = line_height * entry_length;
    trbl = [20, 15, 15, 120]; //top right bottom left;
    gen_height = height_total - 2 * ext_margin;
    gen_width = width_total - 2 * ext_margin - trbl[1] - trbl[3];
    my_color = ["#ff1010", "#1010ff", "#10C010"];
    my_selected_color = ['#801010', "#101080", "#106010"];
    used_rect = "";
    used_color = "";
    
    //donner le div du timeLine la meme taille que le timeLine generer
    $("#"+id_time_line).css('width', width_total);
    $("#"+id_time_line).css('height', height_total);
    console.log("timeLine: " + id_time_line)
    //generer le timeLine dans son div
    time_line = d3.select("#"+id_time_line)
                     .append("svg")
                     .attr("width", 960)
                     .attr("height", 120)
                     .attr("class", "chart");
    time_line.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width_total)
            .attr('height', height_total + 20)
            .style('fill', '#f2f2f2');
    gen = time_line.append("g")
            .attr("transform", "translate(" + (trbl[3] + ext_margin) + "," + (trbl[0] + ext_margin) + ")")
            .attr("width", gen_width)
            .attr("height", gen_height)
            .attr("class", "general");
    y1 = d3.scale.linear()
            .domain([0, entry_length])
            .range([0, gen_height]);

    x1 = d3.scale.linear()
            .domain([0, nb_frame])
            .range([0, gen_width]);

    blockPlay = function(d, i) {
        var id;
        id = "#rect" +i +idTimeLine;   
        var rect = $(id);
        console.log("rect: ",rect);
        if (rect_actif !== -1) {
            /*
            if(d.start === d.end){
                var id = d.start;
            }
            */
            rect.attr("style", "fill:" + my_color[items[rect_actif].entry]);
        }
        console.log("ra: ",rect_actif, " i: ", i , " pp: " , vidCtrl.getPartialPlaying());
        if ((rect_actif !== i + (Number(idTimeLine) + 1)) | ( !vidCtrl.getPartialPlaying())) {
            if(used_rect !== ""){
                used_rect.attr("style", "fill:" + used_color);
            }
            used_color = my_color[d.entry];
            rect.attr("style", "fill:" + my_selected_color[d.entry]);
            used_rect = rect;
            rect_actif = i + (Number(idTimeLine) + 1);
            vidCtrl.setPartialPlaying(true);
            vidCtrl.setPlayingInterval(d.start,d.end);
            console.log("debut = " + d.start + " fin = " + d.end);
            vidCtrl.play();
        } else {
            console.log("debut2 = " + debut + " fin2 = " + fin);
            vidCtrl.setPlayingInterval(debut,fin);
            vidCtrl.play();
            used_rect = "";
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
            .attr("x2", gen_width)
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
                return "rect" + i + idTimeLine ;
            })
            .attr("class", function(d){
                if(d.start === d.end){
                    return "frame";
                }else {
                    return "other";
                }
            })
            .style("fill", function (d) {
                return my_color[d.entry];
            })
            .attr("stroke", "lightgray")
            .on("click", blockPlay);

    time_line.append("text")
            .text(name + " timeline")
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
