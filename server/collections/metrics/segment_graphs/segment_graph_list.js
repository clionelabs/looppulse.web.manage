/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 */
SegmentGraphList = function(segment, from, to) {
  SegmentGraphBase.call(this, segment, from, to);
  this.graphType = SegmentMetric.Graph.List;
}

SegmentGraphList.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphList.prototype.constructor = SegmentGraphList;

SegmentGraphList.prototype.prepareData = function(visitsEngine) {
  this.data = {
      numberOfVisitors: visitsEngine.queryTotalVisitorsCount(),
      averageDwellTime: visitsEngine.queryAverageDuration(),
      repeatedVisitorPercentage: visitsEngine.queryRepeatedVisitsPercentage()
  };
}
