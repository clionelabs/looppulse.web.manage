/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 * @param {'ENTER'} by Use enteredAt or existedAt.
 */
SegmentGraphDistributionDwell = function(segment, from, to, by) {
  SegmentGraphBase.call(this, segment, from, to);
  if (by === 'ENTER') {
    this.graphType = SegmentMetric.Graph.DistributionDwellEnter;
  } else if (by == 'EXIT') {
    this.graphType = SegmentMetric.Graph.DistributionDwellExit;
  } else {
    console.error("[SegmentGraphDistributionDwell] unsupported 'by'");
  }
  this.by = by;
}

SegmentGraphDistributionDwell.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphDistributionDwell.prototype.constructor = SegmentGraphDistributionDwell;

SegmentGraphDistributionDwell.prototype.prepareData = function(visitsEngine) {
  var durations = visitsEngine.queryAverageDurationWeeklyHourlySeries(this.by);
  this.data = this.format7X24ToFrontend(durations);
}
