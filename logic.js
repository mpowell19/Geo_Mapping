// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
// Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Function to scale the Magnitude 
function markerSize(magnitude) {
  return magnitude * 30000;
};

// Function to assign color dependant on the Magnitude
function getColor(m) {

  var colors = ['lightgreen','yellowgreen','gold','orange','lightsalmon','tomato'];

  return  m > 5? colors[5]:
          m > 4? colors[4]:
          m > 3? colors[3]:
          m > 2? colors[2]:
          m > 1? colors[1]:
                 colors[0];
};

function createFeatures(earthquakeData) {

  // Create GEOJSON 
  var earthquakes = L.geoJSON(earthquakeData,{
    
    // Give each feature a popup describing with information pertinent to it
    onEachFeature: function(feature, layer){
      layer.bindPopup("<h3 > Magnitude: "+ feature.properties.mag + 
      "</h3><h3>Location: " + feature.properties.place +
      "</h3><hr><h3>" + new Date(feature.properties.time) + "</h3>" );
    },

    pointToLayer: function(feature, latlng){
      return new L.circle(latlng,
      { radius: markerSize(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .8,
        color: 'grey',
        weight: .5
      })
    }    
  });

  // Send  to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold the base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold the overlay layer
  var overlayMaps = {
    "Earthquakes Past 7 Days": earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      39.8283, -95.5795
    ],
    zoom: 4.5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  
 // Create a legend to display information in the bottom right
 var legend = L.control({position: 'bottomright'});

 legend.onAdd = function(map) {

   var div = L.DomUtil.create('div','info legend'),
       magnitudes = [0,1,2,3,4,5],
       labels = [];

   div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>" 
   
   // loop through our density intervals and generate a label for each interval
   for (var i=0; i < magnitudes.length; i++){
     div.innerHTML +=
       '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' +
       magnitudes[i] + (magnitudes[i+1]?'&ndash;' + magnitudes[i+1] +'<br>': '+');
     }
     return div;
 };
 legend.addTo(myMap);
}
