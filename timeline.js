var svg = d3.select("svg");
var margin = { top: 50, right: 50, bottom: 50, left: 50 };
var width = +svg.attr("width") - margin.left - margin.right;
var height = +svg.attr("height") - margin.top - margin.bottom;

var color = d3.scaleOrdinal(d3.schemeCategory10);
var radius = 8;
var minDist = radius + 1;
var trackDist = 50;

var formatValue = d3.format("d");

var x = d3.scaleLinear()
  .range([0, width]);

var g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("mock-data.json", function(data) {
	x.domain(d3.extent(data, function(d) { return d.start; }));
	
  // X-axis
  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(20, ""));

  var cell = g.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(data)
    .enter().append("circle")
      .attr("id", function(d) { return "cell" + d.id; })
      .attr("r", radius)
      .attr("data-expanded", false)
      .attr("fill", function(d) { return color(d.group); })
      .on("click", function(d) {
        var c = d3.select(this);
        if(c.attr("data-expanded") == "false") {
          c.transition().duration(500).attr("r", radius+100);
          c.attr("data-expanded", true);
          var desc = d.content + " ("+ d.start + ")\n";
          desc += d.className;
          d3.select(this.parentNode).append("text").attr("id", "text" + d.id).text(desc); // TODO make prettier
        }
        else {
          c.transition().duration(500).attr("r", radius);
          c.attr("data-expanded", false);
          simulation.force("collide").radius(radius);
          d3.select("#text" + d.id).remove();
        }
      })
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

  cell
    .append("title")
      .text(function(d) { return d.content + "\n" + formatValue(d.start); });

  var simulation = d3.forceSimulation(data)
    .force("x", d3.forceX(function(d) { return x(d.start); }).strength(1))
    .force("y", d3.forceY(function(d) { return d.group * trackDist; }).strength(1))
    .force("collide", d3.forceCollide(function(d) { return minDist; })); // TODO collision on a per-node basis -> push things out when expanding

  
  simulation.on("tick", function() {
    cell.attr("cx", function(d) { return d.x; }); 
    cell.attr("cy", function(d) { return d.y; });
  });

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

});