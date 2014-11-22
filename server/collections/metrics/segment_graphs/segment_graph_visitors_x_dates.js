/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 */
SegmentGraphVisitorsXDates = function(segment, from, to) {
  SegmentGraphBase.call(this, segment, from, to);
  this.graphType = SegmentMetric.Graph.VisitorsXDates;
}

SegmentGraphVisitorsXDates.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphVisitorsXDates.prototype.constructor = SegmentGraphVisitorsXDates;

SegmentGraphVisitorsXDates.prototype.prepareData = function(visitsEngine) {
  var bucketCount = visitsEngine.queryVisitorsCountXBucketSeries(); 
  var bucketStart = visitsEngine.queryBucketsStartSeries();

  this.data = [];
  for (var i = 0; i < bucketCount.length; i++) {
      this.data.push({"date": bucketStart[i].format("YYYY-MM-DD"), "number of visitors": bucketCount[i]});
  }
}
