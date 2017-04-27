var svg = d3.select("svg");
var margin = { top: 50, right: 50, bottom: 50, left: 50 };
var width = +svg.attr("width") - margin.left - margin.right;
var height = +svg.attr("height") - margin.top - margin.bottom;

var color = d3.scaleOrdinal(d3.schemeCategory10);
var radius = 8;
var minDist = radius + 1;
var trackDist = 30; // TODO dynamically by extent and height

// pseudo-enum for handling groups
// TODO missing some categories
var groups = {
  "History": 0,
  "HMD": 1,
  "Movie": 2,
  "Literature": 3,
  "": 4
};

var formatValue = d3.format("d");

var x = d3.scaleLinear()
  .range([0, width]);

var g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data2.json", function(data) {
	x.domain(d3.extent(data, d => d.start_year )); // TODO fix extent

  var div = d3.select('body')
    .selectAll('div')
    .data(data).enter()
    .append('div')
    .attr("class", "item collapsed")
    .attr("id", d => { "i" + d.id; } )
    .style("background-color", d => color(groups[d.type]) )
    .on("click", function (d) {
      var c = d3.select(this);
      if(c.attr("class") != "item expanded") {
        c.attr("class", "item expanded"); // TODO also give expanded to d
      } else {
        c.attr("class", "item collapsed");
      }
    })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

    div.append('div')
      .attr("class", "content")
      .text(function(d) {
        return d.name + " (" + d.start_year + ")";
      });


  // X-axis - I suppose it's still easiest to do that in svg?
  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(20, ""));

  var simulation = d3.forceSimulation(data)
    .force("x", d3.forceX(function(d) { return x(d.start_year); }).strength(1))
    .force("y", d3.forceY(function(d) { return groups[d.type] * trackDist; }).strength(1))
    .force("collide", d3.forceCollide(function(d) { return minDist; })); // TODO collision on a per-node basis -> push things out when expanding

  
  simulation.on("tick", function() {
    div.style("left", function(d) { return d.x + 72 + "px"; }); // TODO yeah magic numbers, sue me
    div.style("top", function(d) { return d.y + 100 + "px"; });
  });

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
    // d.fixed = "true"; //d.fx & d.fy break this
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