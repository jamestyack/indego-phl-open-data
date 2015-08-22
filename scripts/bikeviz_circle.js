/*global d3, L, $, resize */

"use strict";

var BikeViz = {};
BikeViz.statSnaps = [];
BikeViz.map = L.map('map').setView([39.95472, -75.18323], 14);
BikeViz.info = L.control();
BikeViz.statIndex = 0;
BikeViz.mapmargin = 10;
BikeViz.maxHeightBlock = 23;
BikeViz.interval = 250;

BikeViz.info.update = function (props) {
    this._div.innerHTML = 
        '<h4>Bike Share System</h4>' + 
        '<div id="clock"></div>' +
        '<h5>Station Status</h4>' + 
        '<div><i class="fa fa-thumbs-o-up fa-2x"></i> <span id="open-stations"></span></div>' +
        '<div><i class="fa fa-minus-circle fa-2x"></i> <span id="closed-stations"></span></div>' +
        '<h5>Bikes/Docks Available</h4>' + 
        '<div><i class="fa fa-bicycle fa-2x"></i> <span id="bikes-ava"></span></div>' +
        '<div><i class="fa fa-sign-in fa-2x"></i> <span id="docks-ava"></span></div>' +
        //'<i class="fa fa-cog fa-spin fa-3x"></i>' +
        '<div class="checkbox checkbox-primary">' + 
        '<div><label><input id="show-bike-count" type="checkbox" checked> Show bike counts</label></div>' +
        '</div>';
        //'<svg height="100">' +
        //'<rect x="50" y="0" width="140" height="10" fill="dodgerblue" style="opacity:0.5"/>' + 
        //'<rect x="50" y="15" width="140" height="10" fill="dodgerblue" style="opacity:0.5"/>' + 
        //'</svg>';
};
BikeViz.info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info night'); // create a div with a class "info"
    this.update();
    return this._div;
};
// method that we will use to update the control based on feature properties passed

BikeViz.info.addTo(BikeViz.map);

var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer('http://{s}.tiles.mapbox.com/v3/jamestyack.mh29p6b3/{z}/{x}/{y}.png', {
	attribution : '&copy; ' + mapLink + ' Contributors',
	maxZoom : 18
}).addTo(BikeViz.map);
L.control.fullscreen().addTo(BikeViz.map);
var clock = d3clock({
	target:'#clock',
    face:'modern',
    width: 150,
    date:'Mon May 25 2015 10:09:37',
    TZOffset:{
        hours:0
    }
});


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

function getTextFillColor(d) {
	if (d.s !== "Active") {
		return "grey";
	} else {
		return "white";
	}
}

function getMarkerText(d) {
	var result = "";
	if (d.s === "Active") {
		result = $('#show-bike-count').is(':checked') ? d.bi : "";
	} else {
		result = "\uf056"; // closed
	}
	return result;
}

function getLabelFontSize(d) {
	if (d.s === "Active") {
		return 15;
	} else {
		return 35;
	}
}

function getFillColor(d) {
	if (d.s !== "Active") {
		return "black";
	}
	else if (d.bi == 0) {
		return "red";
	} else if (d.dock == 0) {
		return "dodgerblue";
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
		return "dodgerblue";
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
		return "translate(" + (BikeViz.map.latLngToLayerPoint(d.LatLng).x) + "," + (BikeViz.map.latLngToLayerPoint(d.LatLng).y + (d.s !== "Active" ? 13 : 6)) + ")";
	});
}

function updatePanel() {
	var d = BikeViz.statSnaps[BikeViz.statIndex];
	//BikeViz.clock.update(d.ts);
	clock(d.ts);
	$("#open-stations").text(d.kiosksActive);
	$("#closed-stations").text(d.totalKiosks - d.kiosksActive);
	$("#bikes-ava").text(d.bikesAva);
	$("#docks-ava").text(d.docksAva);
}

function nextSnap() {
	if (BikeViz.statIndex < BikeViz.statSnaps.length) {
		BikeViz.statIndex = BikeViz.statIndex + 1;
	} else {
		BikeViz.statIndex = 0;
	}
	updatePanel();
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
		.text(function(d) {
			return getMarkerText(d);
		})
		.attr("font-size", function(d) {
			return getLabelFontSize(d);
		})
		.style("fill", function(d) {
			return getTextFillColor(d);
		});
		update();
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
	updatePanel();
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
		.style("font-family", "FontAwesome")
		.style("fill", function(d) {
			return getTextFillColor(d);
		})
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
