/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 */
SegmentGraphVisitorsXVisits = function(segment, from, to) {
  SegmentGraphBase.call(this, segment, from, to);
  this.graphType = SegmentMetric.Graph.VisitorsXVisits;
}

SegmentGraphVisitorsXVisits.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphVisitorsXVisits.prototype.constructor = SegmentGraphVisitorsXVisits;

SegmentGraphVisitorsXVisits.prototype.prepareData = function(visitsEngine) {
  var counts = visitsEngine.queryVisitorCountsXVisitsSeries();
  this.data = [];
  for (var i = 0; i < counts.length; i++) {
    this.data.push({"count": i, "number of visitors": counts[i]});
  }
}
