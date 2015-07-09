// Clean up JSON (one per line... remove leading comma)
import java.sql.Timestamp
import java.text.SimpleDateFormat
import java.util.Date
//2015-05-28T01:12:21.603Z
case class StationSnap(
    ts: java.sql.Timestamp, 
    kioskId: Long, 
    bikesAvailable: Long, 
    docksAvailable: Long, 
    totalDocks: Long, 
    kioskPublicStatus: String,
    bikesAvailablePercent: Integer
    )

case class StationsSummary(
    ts: java.sql.Timestamp, 
    kiosksActive: Long, 
    totalKiosks: Long,
    bikesAvailable: Long, 
    docksAvailable: Long, 
    totalDocks: Long)


implicit def ordered: Ordering[Timestamp] = new Ordering[Timestamp] {
    def compare(x: Timestamp, y: Timestamp): Int = x compareTo y
}

// compare StationsSummary
implicit def ordered: Ordering[StationsSummary] = new Ordering[StationsSummary] {
    def compare(x: StationsSummary, y: StationsSummary): Int = x.ts compareTo y.ts
}

def getTimestamp(x:Any) : java.sql.Timestamp = {
	val format = new SimpleDateFormat("yyyy-MM-dd' 'HH:mm")
    val d = format.parse(x.toString());
    val t = new Timestamp(d.getTime());
    return t
}

def convert(row :org.apache.spark.sql.Row) : StationSnap = {
	val ts = row(0).toString
	val d1 = getTimestamp(ts.substring(0,10) + " " + ts.substring(11,16))
    return StationSnap(d1,
        row(1).asInstanceOf[Long],
        row(2).asInstanceOf[Long],
        row(3).asInstanceOf[Long], 
        row(4).asInstanceOf[Long], 
        row(5).toString(),
        math.round(row(2).asInstanceOf[Long].toFloat/row(4).asInstanceOf[Long].toFloat*100))
}

val statFile = sc.textFile("/Users/jamestyack/Desktop/es_logstash-phl-ind-2015.05.28.json")
val jsons = statFile.filter(l => l.length() > 1).map(l => if (l.startsWith(",")) l.substring(1,l.length()) else l)
val jsonRdd = sqlContext.jsonRDD(jsons)
val stationRows = jsonRdd.select(jsonRdd("_source.@timestamp"),jsonRdd("_source.properties.kioskId"),jsonRdd("_source.properties.bikesAvailable"),jsonRdd("_source.properties.docksAvailable"),jsonRdd("_source.properties.totalDocks"),jsonRdd("_source.properties.kioskPublicStatus"))

val stationRowsAbbrevTS = stationRows.map(row => convert(row))
stationRowsAbbrevTS.first
stationRowsAbbrevTS.take(20).foreach(r => println(r))

val statsGrpByTsSorted = stationRowsAbbrevTS.groupBy(_.ts).sortByKey()
//val statsGrpByTsSortedWithSummary = statsGrpByTsSorted.map((k,v) => (k, v.bikesAvailable))


statsGrpByTs.reduce(a, b => 


scala> jsonSchemaRDD.printSchema
root
 |-- _id: string (nullable = true)
 |-- _index: string (nullable = true)
 |-- _score: long (nullable = true)
 |-- _source: struct (nullable = true)
 |    |-- @timestamp: string (nullable = true)
 |    |-- @version: string (nullable = true)
 |    |-- addressStreet: string (nullable = true)
 |    |-- geoip: struct (nullable = true)
 |    |    |-- location: string (nullable = true)
 |    |-- geometry: struct (nullable = true)
 |    |    |-- coordinates: array (nullable = true)
 |    |    |    |-- element: double (containsNull = true)
 |    |    |-- type: string (nullable = true)
 |    |-- name: string (nullable = true)
 |    |-- properties: struct (nullable = true)
 |    |    |-- addressCity: string (nullable = true)
 |    |    |-- addressState: string (nullable = true)
 |    |    |-- addressStreet: string (nullable = true)
 |    |    |-- addressZipCode: string (nullable = true)
 |    |    |-- bikesAvailable: long (nullable = true)
 |    |    |-- closeTime: string (nullable = true)
 |    |    |-- docksAvailable: long (nullable = true)
 |    |    |-- eventEnd: string (nullable = true)
 |    |    |-- eventStart: string (nullable = true)
 |    |    |-- isEventBased: boolean (nullable = true)
 |    |    |-- isVirtual: boolean (nullable = true)
 |    |    |-- kioskId: long (nullable = true)
 |    |    |-- kioskPublicStatus: string (nullable = true)
 |    |    |-- name: string (nullable = true)
 |    |    |-- openTime: string (nullable = true)
 |    |    |-- publicText: string (nullable = true)
 |    |    |-- timeZone: string (nullable = true)
 |    |    |-- totalDocks: long (nullable = true)
 |    |    |-- trikesAvailable: long (nullable = true)
 |    |-- type: string (nullable = true)
 |-- _type: string (nullable = true)



import java.sql.Timestamp
import java.text.SimpleDateFormat
import java.util.Date
def getTimestamp(x:Any) :java.sql.Timestamp = {
	println("converting ts " + x)
    val format = new SimpleDateFormat("MM/dd/yyyy' 'HH:mm:ss")
    if (x.toString() == "") 
    return null
    else {
        val d = format.parse(x.toString());
        val t = new Timestamp(d.getTime());
        return t
    }
}

scala> res45
res81: org.apache.spark.sql.DataFrame = [@timestamp: string, kioskId: bigint, bikesAvailable: bigint, docksAvailable: bigint, totalDocks: bigint]

scala> res45.collect

res82: Array[org.apache.spark.sql.Row] = Array([2015-05-28T01:12:21.603Z,3006,4,13,17], [2015-05-28T01:12:21.603Z,3009,0,14,14], [2015-05-28T01:12:21.603Z,3010,7,12,19], [2015-05-28T01:12:21.603Z,3013,5,10,15], [2015-05-28T01:12:21.604Z,3018,3,15,18], [2015-05-28T01:12:21.604Z,3023,7,14,21], [2015-05-28T01:12:21.604Z,3028,13,2,15], [2015-05-28T01:12:21.605Z,3033,0,20,20], [2015-05-28T01:12:21.605Z,3038,0,23,23], [2015-05-28T01:12:21.605Z,3045,12,3,15], [2015-05-28T01:12:21.605Z,3050,0,15,15], [2015-05-28T01:12:21.610Z,3055,0,15,15], [2015-05-28T01:12:21.610Z,3058,11,2,13], [2015-05-28T01:12:21.610Z,3063,13,6,19], [2015-05-28T01:12:21.611Z,3068,14,4,18], [2015-05-28T01:12:21.611Z,3073,5,10,15], [2015-05-28T01:12:21.611Z,3077,4,15,19], [2015-05-28T01:12:21.611Z,3078,1,15,16], [2015-05-28T...

List.fromArray(res82)

res83: List[org.apache.spark.sql.Row] = List([2015-05-28T01:12:21.603Z,3006,4,13,17], [2015-05-28T01:12:21.603Z,3009,0,14,14], [2015-05-28T01:12:21.603Z,3010,7,12,19], [2015-05-28T01:12:21.603Z,3013,5,10,15], [2015-05-28T01:12:21.604Z,3018,3,15,18], [2015-05-28T01:12:21.604Z,3023,7,14,21], [2015-05-28T01:12:21.604Z,3028,13,2,15], [2015-05-28T01:12:21.605Z,3033,0,20,20], [2015-05-28T01:12:21.605Z,3038,0,23,23], [2015-05-28T01:12:21.605Z,3045,12,3,15], [2015-05-28T01:12:21.605Z,3050,0,15,15], [2015

scala> res83.head
res84: org.apache.spark.sql.Row = [2015-05-28T01:12:21.603Z,3006,4,13,17]

scala> res83.groupBy(_.apply(0))
res86: scala.collection.immutable.Map[Any,List[org.apache.spark.sql.Row]] = Map(2015-05-28T00:12:21.532Z -> List([2015-05-28T00:12:21.532Z,3004,1,19,23]), 2015-05-28T01:12:21.604Z -> List([2015-05-28T01:12:21.604Z,3018,3,15,18], [2015-05-28T01:12:21.604Z,3023,7,14,21], [2015-05-28T01:12:21.604Z,3028,13,2,15]), 2015

scala> res83
res87: List[org.apache.spark.sql.Row] = List([2015-05-28T01:12:21.603Z,3006,4,13,17], [2015-05-28T01:12:21.603Z,3009,0,14,14], [2015-05-28T01:12:21.603Z,3010,

scala> res87.foreach(r => println(r))
[2015-05-28T01:12:21.603Z,3006,4,13,17]
[2015-05-28T01:12:21.603Z,3009,0,14,14]
[2015-05-28T01:12:21.603Z,3010,7,12,19]
[2015-05-28T01:12:21.603Z,3013,5,10,15]

scala> res86.foreach(r => println(r))
(2015-05-28T00:12:21.532Z,List([2015-05-28T00:12:21.532Z,3004,1,19,23]))
(2015-05-28T01:12:21.604Z,List([2015-05-28T01:12:21.604Z,3018,3,15,18], [2015-05-28T01:12:21.604Z,3023,7,14,21], [2015-05-28T01:12:21.604Z,3028,13,2,15]))
(2015-05-28T02:12:21.584Z,List([2015-05-28T02:12:21.584Z,3033,1,19,20]))
(2015-05-28T01:12:21.605Z,List([2015-05-28T01:12:21.605Z,3033,0,20,20], [2015-05-28T01:12:21.605Z,3038,0,23,23], [2015-05-28T01:12:21.605Z,3045,12,3,15], [201

scala> res116(0)
res126: org.apache.spark.sql.Row = [2015-05-28T01:12:21.603Z,3006,4,13,17]

res126(0).toString.substring(0,16)
res131: String = 2015-05-28T01:12

List(getTimestamp(res9.substring(0,10) + " " + res9.substring(11,16))


List(StationSnap(getTimestamp("2015-05-28" + " " + "00:12"), 5,3,3,2,"Active"))



// save RDD as text file...
rdd.saveAsTextFile("/Users/jamestyack/Desktop/station-jsonrows-2015.05.28")

