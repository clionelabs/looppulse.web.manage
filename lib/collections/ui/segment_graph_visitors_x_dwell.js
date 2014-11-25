/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 */
SegmentGraphVisitorsXDwell = function(segment, from, to, data) {
  SegmentGraphBase.call(this, segment, from, to);
  this.graphType = SegmentGraphBase.Graph.VisitorsXDwell;
  this.data;
}

SegmentGraphVisitorsXDwell.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphVisitorsXDwell.prototype.constructor = SegmentGraphVisitorsXDwell;