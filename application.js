/*
http://www.knmi.nl/klimatologie/monv/nstations.html - KNMI RD coordinaten
http://www.knmi.nl/klimatologie/monv/#tabelletje - KNMI precipitation data
http://www.knmi.nl/klimatologie/mow/ - KNMI temperature data
*/

// initializing json data
var precipitation2011 = "jonv2011.json"
var precipitation2012 = "jonvnieuws2012.json"
var precipitation2013 = "jonv2013.json"
var precipitation2014 = "jonv2014.json"
var temperature2011 = "jot2011.json"
var temperature2012 = "jot2012.json"
var temperature2013 = "jot2013.json"
var temperature2014 = "jot2014.json"
var alleweerstations = "weerstations.json"
var KNMIweerstations = "KNMIweerstations.json"
var temperatuurstations = "Temperatuurstations.json"

// initializing default data for website onload
var n1 = "De Bilt";
var n2 = "De Kooy";
var n3 = "Beek";
var n4 = "Eelde";
var n5 = "Ritthem";
var title = "Precipitation";
var graphvalue = true;
var graphformat = "0 mm";
var graphinterval = 50;
var selectedstation = n1;
var dataset = precipitation2014;
var tempdataset = temperature2014;
var gekozenweerstations = alleweerstations;

// initilizing selection options of weatherstations
var select1 = false;
var select2 = false;
var select3 = false;
var select4 = false;
var select5 = false;

// variables to select years in dropdown
var year2011 = "2011";
var year2012 = "2012";
var year2013 = "2013";
var year2014 = "2014";
var year = "2014";

// colorsets for knmistations and graphs
var colorset1 = ["#FFFFFF", "#20B2AA","#663300","#AA20B2","#2E64FE","#FE2E2E"]
var colorset2 = ["#FFFFFF", "#99CCFF","#3399FF","#0066FF","#0000FF"]

// RD-coordinaten, edges of the RijksDriehoekstelsel
var minx = 2000;
var miny = 300000;
var maxx = 278000;
var maxy = 630000;

// SVG sizes for translater
var SVGwidth = 600, 
    SVGheight = 600;
    
// use RD limits and SVG sizes to calculate scale and bounds needed for affine
// transformation of RD-coordinates to screen coordinates
var height = maxy - miny;
var width = maxx - minx;
var scale = Math.min(SVGheight,SVGwidth)/Math.max(height,width);
var y_offset = (maxy * scale);
var x_offset = -(minx * scale);

// select svg in HTML
var svg = d3.select("svg")
        .attr("class", "svgmap")

// initialize element for popup location while hovering over weather station
var popupbox = document.getElementById("popup");

// append svg with g for adding path element boundary of the Netherlands
var nederland = svg.append("g")
    .attr("id", "boundary");

//  append svg with g for adding path elements of the weather stations
var stations = svg.append("g")
    .attr("id", "stations")
    .attr("class", "weerstation");

// use AffineTransformation function to initialize path
var path = d3.geo.path().projection(AffineTransformation(scale, 0, 0, -scale, x_offset, y_offset))

// handle on click event for selecting year to visualize data
d3.select('#opts1')
  .on('change', function() {
    year = eval(d3.select(this).property('value'));
    if (year == "2011"){
        dataset = precipitation2011;
        tempdataset = temperature2011;
    }
    else if (year == "2012"){
        dataset = precipitation2012;
        tempdataset = temperature2012;
    }
    else if (year == "2013"){
        dataset = precipitation2013;
        tempdataset = temperature2013;
    }
    else if (year == "2014"){
        dataset = precipitation2014;
        tempdataset = temperature2014;
    }
    
    makegraph(n1, n2, n3, n4, n5, graphvalue);
});

// handle on click event for selecting weather stations to visualize
d3.select('#opts2')
  .on('change', function() {
    gekozenweerstations = eval(d3.select(this).property('value'));
    stations.selectAll("path").remove();
    resetselection();
    drawmap(gekozenweerstations);
});

// handle on clock event drawing graph with precipitation or temperature data
d3.select('#opts4')
  .on('change', function() {
    graphvalue = eval(d3.select(this).property('value'));
    makegraph(n1, n2, n3, n4, n5, graphvalue);
    if (graphvalue != true){
        n1 = "De Bilt";
    }
    makegraph2(n1, selectedstation, graphvalue);
});

// load map and graphs with default data onload website
drawmap(gekozenweerstations);
makegraph(n1, n2, n3, n4, n5, graphvalue);
makegraph2(n1, selectedstation, graphvalue);


// AffineTransformation as a basic pseudo-projection of RD coords to screen coords
// http://en.wikipedia.org/wiki/Transformation_matrix#Affine_transformations
// From: https://gist.github.com/kobben/5932448
function AffineTransformation(a, b, c, d, tx, ty) {
    return {
        //overrides normal D3 projection stream (to avoid adaptive sampling)
        stream: function(output) {
            return {
                point: function(x, y) { output.point(a * x + b * y + tx, c * x + d * y + ty); },
                sphere: function() { output.sphere(); },
                lineStart: function() { output.lineStart(); },
                lineEnd: function() { output.lineEnd(); },
                polygonStart: function() { output.polygonStart(); },
                polygonEnd: function() { output.polygonEnd(); }
            };
        }
    };
}

// function draws map of the Netherlands
function drawmap(gekozenweerstations1){
    d3.json("nederland.json", function(error, nld) {
        // map of the Netherlands using RD coordinates
        nederland.append("path")
            .data(nld.features)
            .attr("id", "nederland")
            .attr("d", path);
            nederland.selectAll("path")
    drawpoints(gekozenweerstations1)
    });
}


// function draws weather stations
function drawpoints(dataweerstations) {
    // giving weather station id of their name + 0 (if selected 0 becomes value >0)
    d3.json(dataweerstations, function(error, wst) {
        for (var i = 0; i < wst.objects.places.geometries.length; i++) {
            stations.append("path")
                .datum(topojson.feature(wst, wst.objects.places.geometries[i]))
                .attr("d", path)
                .attr("id", wst.objects.places.geometries[i].properties.name+0)
                .attr("class", "place");
}

        // interactivity points and popup
        stations.selectAll("path")
            .on("mouseover", function(){
                // adjust style while on path weather station
                d3.select(this)
                    .style("stroke", "blue")
                    .style("stroke-width", "3px")

                // settings popup box location weather station
                var xpos = (event.clientX);
                var ypos = (event.clientY);
                popupbox.style.display = "block";
                popupbox.style.top = ypos - 30 + "px";
                popupbox.style.left = xpos - 20 + "px";
                
                // get location name for popup and info box
                var selected = this.id;
                selected = cleanid(selected);
                popplace.innerHTML = selected;
                plaats.innerHTML = "Location/City: " + selected;

                // get data for info box
                d3.json("infoweerstation.json", function(error, info) {
                    for (var k = 0; k < 325; k++) {
                        var statplaat = info[k].Locatie
                        if (selected == statplaat) {
                            nummer.innerHTML = "Station #: " + info[k].Nr;
                            OL.innerHTML = " - " + "OL: " + info[k].OL;
                            NB.innerHTML = " - " + "NB: " + info[k].NB;
                        }
                    }
                })

                // get data for infobox
                d3.json(dataset, function(error, pre) {
                    for (var j = 0; j < 323; j++) {
                        var statplaats = pre[j].plaats
                        if (selected == statplaats) {
                            neerslagjaar.innerHTML = " - " + "Cumulative precipitation: " + pre[j].JAAR + " mm";
                        }
                    }
                })

                // get data for infobox
                d3.json(tempdataset, function(error, temp) {
                    for (var j = 0; j < 5; j++) {
                        if (selected == temp[j].plaats) {
                            temperatuur.innerHTML = " - " + "Mean temperature: " + temp[j].JAAR + " °C at " + temp[j].plaats + " in " + year;
                        }
                    }
                })
            });
        
        // interactivity points and popup, adjust style to regular on mouseout
        stations.selectAll("path")                   
            .on("mouseout", function(){
                d3.select(this)
                    .style("stroke", "black")
                    .style("stroke-width", "1px");
                document.getElementById("popup").style.display = "none";

            });

        // select and unselect points for graph (data)
        stations.selectAll("path")
            .on("click", function(){
                var clickedid = this.id;
                var clickedloc = document.getElementById(clickedid);
                selectionvalue = clickedid[clickedid.length-1];

                if (selectionvalue != 0){
                    deselectpoint(clickedloc, clickedid);
                }

                else {
                    selectpoint(clickedloc, clickedid);
                }
            });
    });
}

// selection function
function selectpoint (clickedloc, clickedid){
    // look for open selection option, else return alert
    clickedid = cleanid(clickedid);
    if (select1 == false){
        select1 = true;
        n1 = clickedid;
        d3.select(clickedloc)
            .style("fill", colorset1[1])
            .attr("id", clickedid + 1);
        makegraph2(n1, clickedid, graphvalue);
    }
    else if (select2 == false){
        select2 = true;
        n2 = clickedid;
        d3.select(clickedloc)
            .style("fill", colorset1[2])
            .attr("id", clickedid + 2);
    }
    else if (select3 == false){
        select3 = true;
        n3 = clickedid;
        d3.select(clickedloc)
            .style("fill", colorset1[3])
            .attr("id", clickedid + 3);
    }
    else if (select4 == false){
        select4 = true;
        n4 = clickedid;
        d3.select(clickedloc)
            .style("fill", colorset1[4])
            .attr("id", clickedid + 4);
    }
    else if (select5 == false){
        select5 = true;
        n5 = clickedid;
        d3.select(clickedloc)
            .style("fill", colorset1[5])
            .attr("id", clickedid + 5);
    }
    // if none avialable give user popup in the form of alert
    else
        window.alert("Select maximal 5 weather stations. Unselect one weather station, by clicking before selecting a new one.");
    // make graph of selection
    makegraph(n1, n2, n3, n4, n5, graphvalue);
}


// deselection function
function deselectpoint (clickedloc, clickedid){
    // clear selection point
    selectionvalue = clickedid[clickedid.length-1];
    if (selectionvalue == 1){
        select1 = false;
    }
    else if (selectionvalue == 2){
        select2 = false;
    }
    else if (selectionvalue == 3){
        select3 = false;
    }
    else if (selectionvalue == 4){
        select4 = false;
    }
    else if (selectionvalue == 5){
        select5 = false;
    }

    // clear path id and set back to regular
    clickedid = cleanid(clickedid);
    d3.select(clickedloc)
        .style("fill", "#FAAC58")
        .attr("id", clickedid+0);
}

// function obtains station identifier in data
// to enable drawing graph
function makegraph(a,b,c,d,e,graphvalue){
    var datasetnew;
    // graph of precipitation
    if (graphvalue == true){
        datasetnew = dataset;
        graphformat = "0 mm";
        graphinterval = 50;
        title = "Precipitation"

    }
    // graph of temperature
    else {
        datasetnew = tempdataset
        a = "De Bilt";
        b = "De Kooy";
        c = "Beek";
        d = "Eelde";
        e = "Ritthem";
        graphformat = "0 °C";
        graphinterval = 5;
        title = "Temperature"
    }
    // get number identifier of "plaats" to obtain data in a later stadium
    d3.json(datasetnew, function(error, pre) {
        for (var n = 0; n < pre.length; n++) {
            if (a == pre[n].plaats){
                a = n;
            };
            if (b == pre[n].plaats){
                b = n;     
            };
            if (c == pre[n].plaats){
                c = n;     
            };
            if (d == pre[n].plaats){
                d = n;     
            };
            if (e == pre[n].plaats){
                e = n;     
            };
        };
        drawgraph(pre, a,b,c,d,e,graphformat,graphinterval);

    })
}

// functions draws graph using canvasJS library
function drawgraph(data, val1, val2, val3, val4, val5){
    var chart = new CanvasJS.Chart("chartContainer1", {
        title:{
            text: title + " per month (" + year + ")"
        },
        axisX:{
            interval: 1,
            intervalType: "month",
            valueFormatString: "MMM"
        },
        axisY:{
            interval: graphinterval,
            valueFormatString: graphformat
        },
        toolTip:{
              shared:true
            },legend: {
            horizontalAlign: "right",
            verticalAlign: "top"
        },
        data: [graphdataperyear(data, val1, 1, colorset1, data[val1].plaats)[0], graphdataperyear(data, val2, 2, colorset1, data[val2].plaats)[0], graphdataperyear(data, val3, 3, colorset1, data[val3].plaats)[0], graphdataperyear(data, val4, 4, colorset1, data[val4].plaats)[0], graphdataperyear(data, val5, 5, colorset1, data[val5].plaats)[0]        
        ]
    });
    chart.render();
}

// function returns graph data per month from dataset given
function graphdataperyear (data, val, n, colorset, namegiven){
    return[
        {type: "line",showInLegend: true,lineThickness: 2,name: namegiven,color: colorset[n],dataPoints: [
            { x: new Date(2012, 00, 1), y: data[val].jan},
            { x: new Date(2012, 01, 1), y: data[val].feb},
            { x: new Date(2012, 02, 1), y: data[val].mar},
            { x: new Date(2012, 03, 1), y: data[val].apr},
            { x: new Date(2012, 04, 1), y: data[val].mei},
            { x: new Date(2012, 05, 1), y: data[val].jun},
            { x: new Date(2012, 06, 1), y: data[val].jul},
            { x: new Date(2012, 07, 1), y: data[val].aug},
            { x: new Date(2012, 08, 1), y: data[val].sep},
            { x: new Date(2012, 09, 1), y: data[val].okt},
            { x: new Date(2012, 10, 1), y: data[val].nov},
            { x: new Date(2012, 11, 1), y: data[val].dec}
            ]
        }
    ]
}

// function obtains datasets and identifier of first selected point
// to enable drawing graph of data over the past 4 years
function makegraph2(a, selectedstation, graphvalue){
    // draw precipitation data if selected
    if (graphvalue == true){
        d3.json(precipitation2011, function(error, pre2011) {
            d3.json(precipitation2012, function(error, pre2012) {
                d3.json(precipitation2013, function(error, pre2013) {
                    d3.json(precipitation2014, function(error, pre2014) {
                        for (var n = 0; n < pre2011.length; n++) {
                            if (a == pre2014[n].plaats){
                                a = n;
                            };
                        }
                        drawgraph2(a, pre2011, pre2012, pre2013, pre2014, selectedstation, "Precipitation", "0 mm", 50);
                    })
                })
            })
        })
    }
    // draw temperature data
    else {
        d3.json(temperature2011, function(error, temp2011) {
            d3.json(temperature2012, function(error, temp2012) {
                d3.json(temperature2013, function(error, temp2013) {
                    d3.json(temperature2014, function(error, temp2014) {
                        for (var n = 0; n < temp2011.length; n++) {
                            if (a == temp2014[n].plaats){
                                a = n;
                            };
                        }
                        drawgraph2(a, temp2011, temp2012, temp2013, temp2014, selectedstation, "Temperature", "0 °C", 5);
                    })
                })
            })
        })
    }

}

// functions draws graph using canvasjs, adjust graph title interval etc to temperature or precipitation
function drawgraph2(val, dataset1, dataset2, dataset3, dataset4, selectedstation, title, format, interval){
    var city = "De Bilt"
    var chart2 = new CanvasJS.Chart("chartContainer2", {
        title:{
            text: title + " per month (" + selectedstation + ")"
        },
        axisX:{
            interval: 1,
            intervalType: "month",
            valueFormatString: "MMM"
        },
        axisY:{
            interval: interval,
            valueFormatString: format
        },
        toolTip:{
              shared:true
            },
        legend: {
            horizontalAlign: "right",
            verticalAlign: "top"
        },
        animationEnabled: true,
        animationDuration: 1500,
        data: [graphdataperyear(dataset1, val, 1, colorset2, "2011")[0], graphdataperyear(dataset2, val, 2, colorset2, "2012")[0], graphdataperyear(dataset3, val, 3, colorset2, "2013")[0], graphdataperyear(dataset4, val, 4, colorset2, "2014")[0]]
    });
    chart2.render();
}

// function returns name of weather station, without indicating integer
function cleanid (plaatsnaam){
    return plaatsnaam.slice(0,plaatsnaam.length-1);
}

// function resets selections if necessary
function resetselection(){
    select1 = false;
    select2 = false;
    select3 = false;
    select4 = false;
    select5 = false;
}