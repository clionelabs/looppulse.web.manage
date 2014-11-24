/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 */
SegmentGraphOtherSegments = function(segment, from, to, data) {
  SegmentGraphBase.call(this, segment, from, to);
  this.graphType = SegmentGraphBase.Graph.OtherSegments;
  this.data = data;
}

SegmentGraphOtherSegments.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphOtherSegments.prototype.constructor = SegmentGraphOtherSegments;