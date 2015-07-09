/*global d3, L, $, resize */

"use strict";

var BikeViz = {};
BikeViz.map = L.map('map').setView([39.95472, -75.18323], 14);
BikeViz.statIndex = 0;
BikeViz.mapmargin = 10;
BikeViz.maxHeightBlock = 30;

var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer('http://{s}.tiles.mapbox.com/v3/jamestyack.mh29p6b3/{z}/{x}/{y}.png', {
	attribution : '&copy; ' + mapLink + ' Contributors',
	maxZoom : 18
}).addTo(BikeViz.map);



var scale = d3.scale.linear().domain([0, 100]).range([0, BikeViz.maxHeightBlock]);
//$('#map').css("height", ($(window).height() - BikeViz.mapmargin));
//$(window).on("resize", resize);
$("#tstamp").click(function() {
	gFill.selectAll("rect")
		.transition()
		.duration(1000)
		.style("fill", "green")
		.attr("height", BikeViz.maxHeightBlock)
		.attr("transform", function(d) {
			return "translate(" + (BikeViz.map.latLngToLayerPoint(d.LatLng).x + 1) + "," + (BikeViz.map.latLngToLayerPoint(d.LatLng).y + 1) + ")";
		});
	
});
//resize();

function resize() {
	if ($(window).width() >= 980) {
		$('#map').css("height", ($(window).height() - BikeViz.mapmargin));
		$('#map').css("margin-top", 50);
	} else {
		$('#map').css("height", ($(window).height() - (BikeViz.mapmargin + 12)));
		$('#map').css("margin-top", -21);
	}
}

function getLabelText(d) {
	if (d.s !== "Active") {
		return d.name + "<br/>" + d.s;
	} else {
		return d.name + "<br>" + ((d.pc == 0) ? "NO BIKES!" : "") + ((d.pc == 100) ? "NO FREE DOCKS!" : "") + ((d.pc > 0 && d.pc < 100) ? d.pc + "% full" : "") + "<br>" + d.bi + " bikes | " + d.dock + " docks<br>";
	}
}

function getMarkerText(d) {
	if (d.s === "Active") {
		return d.bi + "/" + d.td;
	} else {
		return "X";
	}
}

function getFillColor(d) {
	if (d.s !== "Active") {
		return "black";
	}
	else if (d.bi < 3) {
		return "red";
	} else if (d.dock < 2) {
		return "DodgerBlue";
	} else {
		return "green";
	}
}

/* Initialize the SVG layer */
BikeViz.map._initPathRoot();

var svg = d3.select("#map").select("svg"), gStroke = svg.append("g"), gFill = svg.append("g"), gLabels = svg.append("g");
var tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) {
	return getLabelText(d);
});
svg.call(tip);

d3.json("bigdata/statSnaps2015.07.03.json", function(statSnaps) {
	$("#tstamp").text(statSnaps[BikeViz.statIndex].ts);
	$("#summary").text( 
		"Active stations: " + statSnaps[BikeViz.statIndex].kiosksActive +
		" | bikes: " + statSnaps[BikeViz.statIndex].bikesAva +
		" | docks: " + statSnaps[BikeViz.statIndex].docksAva +
		" | total docks: " + statSnaps[BikeViz.statIndex].totalDocks
	);
	statSnaps[BikeViz.statIndex].snaps.forEach(function(d) {
		d.LatLng = new L.LatLng(d.lat, d.lng);
	});
	
	gStroke.selectAll("rect")
		.data(statSnaps[BikeViz.statIndex].snaps, function(d) { return d.id; })
		.enter()
		.append("rect")
		.attr("id", function(d) { return "stroke" + d.id; })
		.style("stroke", "gray")
		.style("stroke-width", 1.5)
		.style("opacity", .9)
		.style("fill", "darkgray")
		.attr("width", 12)
		.attr("height", 32);
	gFill.selectAll("rect")
		.data(statSnaps[BikeViz.statIndex].snaps, function(d) { return d.id; })
		.enter()
		.append("rect")
		.attr("id", function(d) { return "fill" + d.id; })
		.style("opacity", .9)
		.style("fill", function(d) {
			return getFillColor(d);
		})
		.attr("width", 10)
		.attr("height", function(d) {
			return scale(d.pc);
		})
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide);
	gLabels.selectAll("text")
		.data(statSnaps[BikeViz.statIndex].snaps, function(d) { return d.id; })
		.enter()
		.append("text")
		.attr("id", function(d) { return "label" + d.id; })
		.style("text-anchor", "middle")
		.style("fill", "white")
		.text(function(d) {
			return getMarkerText(d);
		});

	BikeViz.map.on("viewreset", update);
	update();

	function update() {
		gStroke.selectAll("rect").attr("transform", function(d) {
			return "translate(" + BikeViz.map.latLngToLayerPoint(d.LatLng).x + "," + BikeViz.map.latLngToLayerPoint(d.LatLng).y + ")";
		});
		gFill.selectAll("rect").attr("transform", function(d) {
			return "translate(" + (BikeViz.map.latLngToLayerPoint(d.LatLng).x + 1) + "," + (BikeViz.map.latLngToLayerPoint(d.LatLng).y + 1 + BikeViz.maxHeightBlock - scale(d.pc)) + ")";
		});
		gLabels.selectAll("text").attr("transform", function(d) {
			return "translate(" + (BikeViz.map.latLngToLayerPoint(d.LatLng).x + 7) + "," + (BikeViz.map.latLngToLayerPoint(d.LatLng).y + 45) + ")";
		});
	}

});