/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 */
SegmentGraphTopLocationsDwell = function(segment, from, to) {
  SegmentGraphBase.call(this, segment, from, to);
  this.graphType = SegmentMetric.Graph.TopLocationsDwell;
}

SegmentGraphTopLocationsDwell.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphTopLocationsDwell.prototype.constructor = SegmentGraphTopLocationsDwell;

SegmentGraphTopLocationsDwell.prototype.prepareData = function(installationVisitsEngines, installationNames) {
  var self = this;
  this.data = [];
  _.each(installationVisitsEngines, function(visitsEngine, iid) {
    self.data.push({installationName: installationNames[iid], duration: visitsEngine.queryAverageDuration()});
  });
  this.data = _.sortBy(this.data, function(item) {
    return -1 * item['duration'];
  });
}

