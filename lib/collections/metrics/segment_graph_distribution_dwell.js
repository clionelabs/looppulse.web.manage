/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 * @param {SegmentGraphBase.Graph.Data} by Use enteredAt or existedAt.
 */
SegmentGraphDistributionDwell = function(segment, from, to, by, data) {
  SegmentGraphBase.call(this, segment, from, to);
  if (by === SegmentGraphBase.Graph.Data.Enter) {
    this.graphType = SegmentGraphBase.Graph.DistributionDwellEnter;
  } else if (by === SegmentGraphBase.Graph.Data.Exit) {
    this.graphType = SegmentGraphBase.Graph.DistributionDwellExit;
  } else {
    console.error("[SegmentGraphDistributionDwell] unsupported 'by'");
  }
  this.by = by;
  this.data = data;
}

SegmentGraphDistributionDwell.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphDistributionDwell.prototype.constructor = SegmentGraphDistributionDwell;
