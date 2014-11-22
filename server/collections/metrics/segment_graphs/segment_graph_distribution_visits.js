/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 * @param {'ENTER'|'EXIT'} by Use enteredAt or existedAt.
 */
SegmentGraphDistributionVisits = function(segment, from, to, by) {
  SegmentGraphBase.call(this, segment, from, to);
  if (by === 'ENTER') {
    this.graphType = SegmentMetric.Graph.DistributionVisitsEnter;
  } else if (by === 'EXIT') {
    this.graphType = SegmentMetric.Graph.DistributionVisitsExit;
  } else {
    console.error("[SegmentGraphDistributionVisits] unsupported 'by'");
  }
  this.by = by;
}

SegmentGraphDistributionVisits.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphDistributionVisits.prototype.constructor = SegmentGraphDistributionVisits;

SegmentGraphDistributionVisits.prototype.prepareData = function(visitsEngine) {
  var result = visitsEngine.queryVisitsCountWeeklyHourlySeries(this.by);
  this.data = this.format7X24ToFrontend(result);
}


