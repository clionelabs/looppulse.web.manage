/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 */
SegmentGraphVisitorsXDwell = function(segment, from, to) {
  SegmentGraphBase.call(this, segment, from, to);
  this.graphType = SegmentMetric.Graph.VisitorsXDwell;
}

SegmentGraphVisitorsXDwell.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphVisitorsXDwell.prototype.constructor = SegmentGraphVisitorsXDwell;

SegmentGraphVisitorsXDwell.prototype.prepareData = function(visitsEngine) {
  var interval = 10 * 60 * 1000; // 10 minutes. TODO: dynamic interval depending on data
  var intervalCounts = visitsEngine.queryVisitorCountsXDurationIntervalSeries(interval);
  var intervalNames = _.map(_.range(intervalCounts.length), function(index) {
    return index * 10; 
  }); 

  this.data = [];
  for (var i = 0; i < intervalCounts.length; i++) {
      this.data.push({"duration": intervalNames[i], "number of visitors": intervalCounts[i]});
  }
}
