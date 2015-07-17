/*global d3, L, $, resize */

"use strict";

var BikeViz = {};
BikeViz.statSnaps = [];
BikeViz.map = L.map('map').setView([39.95472, -75.18323], 14);
BikeViz.statIndex = 0;
BikeViz.mapmargin = 10;
BikeViz.maxHeightBlock = 27;
BikeViz.interval = 250;

var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer('http://{s}.tiles.mapbox.com/v3/jamestyack.mh29p6b3/{z}/{x}/{y}.png', {
	attribution : '&copy; ' + mapLink + ' Contributors',
	maxZoom : 18
}).addTo(BikeViz.map);
L.control.fullscreen().addTo(BikeViz.map);

var scale = d3.scale.linear().domain([0, 100]).range([0, BikeViz.maxHeightBlock]);

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
		//if (d.bi == 0) {
			//return "";	
			return d.bi;
		//} if (d.dock == 0) {
		//	return "100%";
		//}
	} else {
		return "CLOSED";
	}
}

function getLabelFontSize(d) {
	if (d.s === "Active") {
		return 13;
	} else {
		return 13;
	}
}

function getFillColor(d) {
	if (d.s !== "Active") {
		return "black";
	}
	else if (d.bi == 0) {
		return "red";
	} else if (d.dock == 0) {
		return "DodgerBlue";
	} else {
		return "green";
	}
}

function getStrokeColor(d) {
	if (d.s !== "Active") {
		return "black";
	}
	else if (d.bi == 0) {
		return "red";
	} else if (d.dock == 0) {
		return "DodgerBlue";
	} else {
		return "black";
	}
}


function getCircleSize(d) {
	if (d.s !== "Active") {
		return scale(100);
	} else {
		return scale(d.pc);
	}
}

function update() {
	gStroke.selectAll("circle").attr("transform", function(d) {
		return "translate(" + BikeViz.map.latLngToLayerPoint(d.LatLng).x + "," + BikeViz.map.latLngToLayerPoint(d.LatLng).y + ")";
	});
	gFill.selectAll("circle").attr("transform", function(d) {
		return "translate(" + (BikeViz.map.latLngToLayerPoint(d.LatLng).x) + "," + (BikeViz.map.latLngToLayerPoint(d.LatLng).y) + ")";
	});
	gLabels.selectAll("text").attr("transform", function(d) {
		return "translate(" + (BikeViz.map.latLngToLayerPoint(d.LatLng).x) + "," + (BikeViz.map.latLngToLayerPoint(d.LatLng).y + 5) + ")";
	});
}

function updateSummaries() {
	$("#tstamp").text(BikeViz.statSnaps[BikeViz.statIndex].ts);
	$("#summary").text(
		"Active stations: " + BikeViz.statSnaps[BikeViz.statIndex].kiosksActive +
		" | bikes: " + BikeViz.statSnaps[BikeViz.statIndex].bikesAva +
		" | docks: " + BikeViz.statSnaps[BikeViz.statIndex].docksAva +
		" | total docks: " + BikeViz.statSnaps[BikeViz.statIndex].totalDocks
	);
}

function nextSnap() {
	if (BikeViz.statIndex < BikeViz.statSnaps.length) {
		BikeViz.statIndex = BikeViz.statIndex + 1;
	} else {
		BikeViz.statIndex = 0;
	}
	updateSummaries();
	BikeViz.statSnaps[BikeViz.statIndex].snaps.forEach(function(d) {
		d.LatLng = new L.LatLng(d.lat, d.lng);
	});
	gStroke.selectAll("circle")
		.data(BikeViz.statSnaps[BikeViz.statIndex].snaps, function(d) { return d.id; })
		.transition()
		.style("stroke", function(d) {
			return getStrokeColor(d);
		});
	gFill.selectAll("circle")
		.data(BikeViz.statSnaps[BikeViz.statIndex].snaps, function(d) { return d.id; })
		.transition()
		.duration(BikeViz.interval)
		.style("fill", function(d) { return getFillColor(d); })
		.attr("r", function(d) {
			return getCircleSize(d);
		});
	gLabels.selectAll("text")
		.data(BikeViz.statSnaps[BikeViz.statIndex].snaps, function(d) { return d.id; })
		.transition()
		.text(function(d) {
			return getMarkerText(d);
		})
		.attr("font-size", function(d) {
			return getLabelFontSize(d);
		});
	}

/* Initialize the SVG layer */
BikeViz.map._initPathRoot();

var svg = d3.select("#map").select("svg"), gStroke = svg.append("g"), gFill = svg.append("g"), gLabels = svg.append("g");
var tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) {
	return getLabelText(d);
});
svg.call(tip);

$("#tstamp").click(function() {
	nextSnap();
});

d3.json("bigdata/statSnaps2015.07.10.json", function(d) {
	BikeViz.statSnaps = d;
	updateSummaries();
	BikeViz.statSnaps[BikeViz.statIndex].snaps.forEach(function(d) {
		d.LatLng = new L.LatLng(d.lat, d.lng);
	});

	gStroke.selectAll("circle")
		.data(BikeViz.statSnaps[BikeViz.statIndex].snaps, function(d) { return d.id; })
		.enter()
		.append("circle")
		.attr("id", function(d) { return "stroke" + d.id; })
		.style("stroke", function(d) {
			return getStrokeColor(d);
		})
		.style("stroke-width", 3)
		.style("opacity", 0.5)
		.style("fill", "black")
		//.attr("width", 12)
		.attr("r", BikeViz.maxHeightBlock+2)
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide);
	gFill.selectAll("circle")
		.data(BikeViz.statSnaps[BikeViz.statIndex].snaps, function(d) { return d.id; })
		.enter()
		.append("circle")
		.attr("id", function(d) { return "fill" + d.id; })
		.style("opacity", .9)
		.style("fill", function(d) {
			return getFillColor(d);
		})
		//.attr("width", 10)
		.attr("r", function(d) {
			return getCircleSize(d);
		})
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide);
	gLabels.selectAll("text")
		.data(BikeViz.statSnaps[BikeViz.statIndex].snaps, function(d) { return d.id; })
		.enter()
		.append("text")
		.attr("id", function(d) { return "label" + d.id; })
		.style("text-anchor", "middle")
		.style("fill", "white")
		.attr("font-size", function(d) {
			return getLabelFontSize(d);
		})
		.text(function(d) {
			return getMarkerText(d);
		});

	BikeViz.map.on("viewreset", update);
	update();


	var myVar = setInterval(nextSnap, BikeViz.interval);





});
