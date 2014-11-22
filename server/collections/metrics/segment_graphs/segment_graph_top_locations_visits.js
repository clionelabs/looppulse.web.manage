/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 */
SegmentGraphTopLocationsVisits = function(segment, from, to) {
  SegmentGraphBase.call(this, segment, from, to);
  this.graphType = SegmentMetric.Graph.TopLocationsVisits;
}

SegmentGraphTopLocationsVisits.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphTopLocationsVisits.prototype.constructor = SegmentGraphTopLocationsVisits;

SegmentGraphTopLocationsVisits.prototype.prepareData = function(installationVisitsEngines, installationNames) {
  var self = this;
  this.data = [];
  _.each(installationVisitsEngines, function(visitsEngine, iid) {
    self.data.push({installationName: installationNames[iid], count: visitsEngine.queryTotalVisitsCount()});
  });
  this.data = _.sortBy(this.data, function(item) {
    return -1 * item['count'];
  });
}

