/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 */
SegmentGraphTopLocationsVisitors = function(segment, from, to) {
  SegmentGraphBase.call(this, segment, from, to);
  this.graphType = SegmentMetric.Graph.TopLocationsVisitors;
}

SegmentGraphTopLocationsVisitors.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphTopLocationsVisitors.prototype.constructor = SegmentGraphTopLocationsVisitors;

SegmentGraphTopLocationsVisitors.prototype.prepareData = function(installationVisitsEngines, installationNames) {
  var self = this;
  this.data = [];
  _.each(installationVisitsEngines, function(visitsEngine, iid) {
    self.data.push({installationName: installationNames[iid], count: visitsEngine.queryTotalVisitsCount()});
  });
  this.data = _.sortBy(this.data, function(item) {
    return -1 * item['count'];
  });
}
