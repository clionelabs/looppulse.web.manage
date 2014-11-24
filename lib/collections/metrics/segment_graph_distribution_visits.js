/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 * @param {'ENTER'|'EXIT'} by Use enteredAt or existedAt.
 */
SegmentGraphDistributionVisits = function(segment, from, to, by, data) {
  SegmentGraphBase.call(this, segment, from, to);
  //TODO enum it
  if (by === 'ENTER') {
    this.graphType = SegmentGraphBase.Graph.DistributionVisitsEnter;
  } else if (by === 'EXIT') {
    this.graphType = SegmentGraphBase.Graph.DistributionVisitsExit;
  } else {
    console.error("[SegmentGraphDistributionVisits] unsupported 'by'");
  }
  this.by = by;
  this.data = data;
}

SegmentGraphDistributionVisits.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphDistributionVisits.prototype.constructor = SegmentGraphDistributionVisits;


