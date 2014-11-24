/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 * @param {'ENTER'} by Use enteredAt or existedAt.
 */
SegmentGraphDistributionDwell = function(segment, from, to, by, data) {
  SegmentGraphBase.call(this, segment, from, to);
  //TODO enum it
  if (by === 'ENTER') {
    this.graphType = SegmentGraphBase.Graph.DistributionDwellEnter;
  } else if (by == 'EXIT') {
    this.graphType = SegmentGraphBase.Graph.DistributionDwellExit;
  } else {
    console.error("[SegmentGraphDistributionDwell] unsupported 'by'");
  }
  this.by = by;
  this.data = data;
}

SegmentGraphDistributionDwell.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphDistributionDwell.prototype.constructor = SegmentGraphDistributionDwell;
