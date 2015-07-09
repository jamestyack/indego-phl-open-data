// Clean up JSON (one per line... remove leading comma)
import java.sql.Timestamp
import java.text.SimpleDateFormat
import java.util.Date

import com.google.gson.Gson

import scala.collection.JavaConverters._

//2015-05-28T01:12:21.603Z

// some case classes
// snapshot of station data at point in time
case class StationSnapshot(
    ts: java.sql.Timestamp,
    id: Long,
    bikes: Long,
    docks: Long,
    totalDocks: Long,
    status: String,
    percentAva: Integer
    )

// stations summary at a point in time
case class StationsSummary(
    ts: java.sql.Timestamp,
    kiosksActive: Long,
    totalKiosks: Long,
    bikesAva: Long,
    docksAva: Long,
    totalDocks: Long)


// compare StationsSummary
implicit def ordered: Ordering[StationsSummary] = new Ordering[StationsSummary] {
    def compare(x: StationsSummary, y: StationsSummary): Int = x.ts compareTo y.ts
}

// convert a string to a timestamp
def getTimestamp(x:Any) : java.sql.Timestamp = {
	val format = new SimpleDateFormat("yyyy-MM-dd' 'HH:mm")
    val d = format.parse(x.toString());
    val t = new Timestamp(d.getTime());
    return t
}

// convert a row to a StationSnapshot
// also adds the percentage
def convert(row :org.apache.spark.sql.Row) : StationSnapshot = {
	val ts = row(0).toString
	val d1 = getTimestamp(ts.substring(0,10) + " " + ts.substring(11,16))
    return StationSnapshot(d1,
        row(1).asInstanceOf[Long],
        row(2).asInstanceOf[Long],
        row(3).asInstanceOf[Long],
        row(4).asInstanceOf[Long],
        row(5).toString(),
        math.round(row(2).asInstanceOf[Long].toFloat/row(4).asInstanceOf[Long].toFloat*100))
}

// get file
val statFile = sc.textFile("/Users/jamestyack/git/indego-phl-open-data/bigdata/sampledata/es_logstash-phl-ind-2015.07.03")

// lots of rows of json
val jsons = statFile.filter(l => l.length() > 1).map(l => if (l.startsWith(",")) l.substring(1,l.length()) else l)
// create rdd from the jsons (each row is a station)
val jsonRdd = sqlContext.jsonRDD(jsons)
// get the fields we need and these are the rows
val stationRows = jsonRdd.select(jsonRdd("_source.@timestamp"),jsonRdd("_source.properties.kioskId"),jsonRdd("_source.properties.bikesAvailable"),jsonRdd("_source.properties.docksAvailable"),jsonRdd("_source.properties.totalDocks"),jsonRdd("_source.properties.kioskPublicStatus"))
// convert each row to a StationSnapshot with a rounded out timestamp
val stationSnapRows = stationRows.map(row => convert(row))
// get 1st row (for fun)
stationSnapRows.first
// take the first 20 rows and print them
stationSnapRows.take(20).foreach(r => println(r))

// ordering for timestamp
implicit def ordered: Ordering[Timestamp] = new Ordering[Timestamp] {
    def compare(x: Timestamp, y: Timestamp): Int = x compareTo y
}
// group the stations by timestamp and sort them
val stationsGroupedByTsSorted = stationSnapRows.groupBy(_.ts).sortByKey()
//val statsGrpByTsSortedWithSummary = statsGrpByTsSorted.map((k,v) => (k, v.bikesAvailable))

// save RDD as text file...
stationsGroupedByTsSorted.saveAsTextFile("/Users/jamestyack/Desktop/station-jsonrows-2015.07.03")



val listOfStationsExample = stationsGroupedByTsSorted.first._2.toList
val javaList = listOfStationsExample.asJava
val gson = new Gson
val jsonString = gson.toJson(javaList)
println(jsonString)
