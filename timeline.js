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
    .on("click", function() {alert("TODO");})
    .selectAll("circle")
    .data(data)
    .enter().append("circle")
      .attr("r", radius)
      .attr("fill", function(d) { return color(d.group); })

  cell
    .append("title")
      .text(function(d) { return d.content + "\n" + formatValue(d.start); });

  var simulation = d3.forceSimulation(data)
    .force("x", d3.forceX(function(d) { return x(d.start); }).strength(1))
    .force("y", d3.forceY(function(d) { return d.group * trackDist; }))
    .force("collide", d3.forceCollide(minDist));

  
  simulation.on("tick", function() {
    cell.attr("cx", function(d) { return d.x; }); 
    cell.attr("cy", function(d) { return d.y; });
  });

});

function type(d) {
  if (!d.start) return;
  d.start = +d.start;
  return d;
}