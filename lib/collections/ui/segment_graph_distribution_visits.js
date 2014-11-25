/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 * @param {SegmentGraphBase.Graph.Data} by Use enteredAt or existedAt.
 */
SegmentGraphDistributionVisits = function(segment, from, to, by, data) {
  SegmentGraphBase.call(this, segment, from, to);
  //TODO enum it
  if (by === SegmentGraphBase.Graph.Data.Enter) {
    this.graphType = SegmentGraphBase.Graph.DistributionVisitsEnter;
  } else if (by === SegmentGraphBase.Graph.Data.Exit) {
    this.graphType = SegmentGraphBase.Graph.DistributionVisitsExit;
  } else {
    console.error("[SegmentGraphDistributionVisits] unsupported 'by'");
  }
  this.by = by;
  this.data = data;
}

SegmentGraphDistributionVisits.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphDistributionVisits.prototype.constructor = SegmentGraphDistributionVisits;


