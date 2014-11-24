/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 */
SegmentGraphList = function(segment, from, to, data) {
  SegmentGraphBase.call(this, segment, from, to);
  this.graphType = SegmentGraphBase.Graph.List;
    this.data = data;
}

SegmentGraphList.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphList.prototype.constructor = SegmentGraphList;