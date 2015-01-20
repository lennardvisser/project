"use strict";

var margin = {top: 50, right: 25, bottom: 50, left: 25},
	width = 1000,
    height = 1000;


var svg = d3.select("body")
	.append("svg")
	.attr("id", "svgmap")
    .attr("width", width)
    .attr("height", height);


var projection = d3.geo.mercator()
	.center([0, 0])
	.scale(500)
	.rotate([0, 0, 0])
	.translate([width / 2, height / 2]);


var path = d3.geo.path()
	.projection(projection);

d3.json("uk.json", function(error, uk) {
	console.log(uk)
	if (error) {
		console.log(error);
		return console.error(error);
  	}
  	console.log('hierzo ?');

  	var subunits = topojson.feature(uk, uk.objects.nederlandGemeenteGeo);

	svg.append("path")
	    .datum(subunits)
	    .attr("d", path);
	console.log(subunits);
});