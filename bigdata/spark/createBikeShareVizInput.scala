import java.sql.Timestamp
import java.text.SimpleDateFormat
import java.util.Date
import java.util.List
import com.google.gson.Gson
import scala.collection.JavaConverters._
import scala.collection.mutable.ListBuffer
import java.io._

val date = "2015.07.10"

//2015-05-28T01:12:21.603Z

// some case classes
// snapshot of station data at point in time
case class StationSnap(
    ts: java.sql.Timestamp,
    id: Long,
    bi: Long,
    dock: Long,
    td: Long,
    s: String,
    pc: Integer,
    name: String,
    lat: Double,
    lng: Double
    )

// stations summary at a point in time
case class StationsSummary(
  ts : java.sql.Timestamp,
  kiosksActive: Long,
  totalKiosks: Long,
  bikesAva: Long,
  docksAva: Long,
  totalDocks: Long,
  snaps : java.util.List[StationSnap]
)

// compare StationsSummary
implicit def ordered: Ordering[StationsSummary] = new Ordering[StationsSummary] {
    def compare(x: StationsSummary, y: StationsSummary): Int = x.ts compareTo y.ts
}

// convert a string to a timestamp
def getTimestamp(x:Any) : java.sql.Timestamp = {
	val format = new SimpleDateFormat("yyyy-MM-dd' 'HH:mm")
    val d = format.parse(x.toString());
    val t = new Timestamp(d.getTime() - (60 * 60 * 1000 * 4));
    println(x.toString() + " -> " + t.toString())
    return t
}

// convert a row to a StationSnap
// also adds the percentage
def convert(row :org.apache.spark.sql.Row) : StationSnap = {
	val ts = row(0).toString
  println(ts.toString())
	val d1 = getTimestamp(ts.substring(0,10) + " " + ts.substring(11,16))
    return StationSnap(d1,
        row(1).asInstanceOf[Long],
        row(2).asInstanceOf[Long],
        row(3).asInstanceOf[Long],
        row(4).asInstanceOf[Long],
        row(5).toString(),
        math.round(row(2).asInstanceOf[Long].toFloat/row(4).asInstanceOf[Long].toFloat*100),
        row(6).toString(),
        row(7).asInstanceOf[scala.collection.immutable.List[Double]](1),
        row(7).asInstanceOf[scala.collection.immutable.List[Double]](0))
}

// get file
val statFile = sc.textFile(s"/Users/jamestyack/git/indego-phl-open-data/bigdata/sampledata/es_logstash-phl-ind-$date")

// lots of rows of json
val jsons = statFile.filter(l => l.length() > 1).map(l => if (l.startsWith(",")) l.substring(1,l.length()) else l)
// create rdd from the jsons (each row is a station)
val jsonRdd = sqlContext.jsonRDD(jsons)
// get the fields we need and these are the rows
val stationRows = jsonRdd.select(jsonRdd("_source.@timestamp"),
  jsonRdd("_source.properties.kioskId"),
  jsonRdd("_source.properties.bikesAvailable"),
  jsonRdd("_source.properties.docksAvailable"),
  jsonRdd("_source.properties.totalDocks"),
  jsonRdd("_source.properties.kioskPublicStatus"),
  jsonRdd("_source.properties.name"),
  jsonRdd("_source.geometry.coordinates"))
// convert each row to a stationsnap with a rounded out timestamp
val stationSnapRows = stationRows.map(row => convert(row))
// group the stations by timestamp and sort them
// ordering for timestamp
implicit def ordered: Ordering[Timestamp] = new Ordering[Timestamp] {
    def compare(x: Timestamp, y: Timestamp): Int = x compareTo y
}
val stationsGroupedByTsSorted = stationSnapRows.groupBy(_.ts).sortByKey()

val allTimes = stationsGroupedByTsSorted.map(row => {
  val ts = row._1
  val snaps = row._2
  val kiosksActive = snaps.filter(snap => snap.s.equals("Active")).size
  val bikesAva = snaps.filter(snap => snap.s.equals("Active")).map(snap => snap.bi).sum
  val docksAva = snaps.filter(snap => snap.s.equals("Active")).map(snap => snap.dock).sum
  val totalDocks = snaps.map(snap => snap.td).sum
  StationsSummary(row._1,kiosksActive,snaps.size,bikesAva,docksAva,totalDocks,snaps.toList.asJava)
})

val gson = new Gson
val jsonString = gson.toJson(allTimes.collect)
val pw = new PrintWriter(new File(s"/Users/jamestyack/git/indego-phl-open-data/bigdata/statSnaps$date.json" ))
pw.write(jsonString)
pw.close
