Bike Visualization
===

StationDetails (for init) -- use 'Stations.json as is?'
---
* kioskId : Number (KEY)
* name : String (name of station)
* coordinates [lat,lng]

Stations (for updates)
---
* ts : Timestamp
* kioskId : Number (KEY)
* bikesAva : Number
* docksAva : Number
* totalDocks : Number
* kioskStatus : String (Active, etc)
* bikesPercent: Integer

Summary (for side bar)
---
* ts : Timestamp
* kiosksActive : Number
* totalKiosks : Number
* bikesAva : Number
* docksAva : Number
* totalDocks : Number

Structure
---
See bigdata/sampleDayOfStations.json

Tasks
---
* Spark : Get Stations data formatted to JSON
* Spark : Aggregate summary data to structure
* Get StationSnap formatted to compact JSON output
* Devise map startup to render empty stations (using key)

* Devise timer / figure out how to work with json rows/timestamp
* Devise map updates with StationSnap on timer (using key)
* Fix map (Mapbox -> OSM)
* Add clock to page and update it
* Add summary data to web page
* Add slider and ability to stop/plan/speed etc.

