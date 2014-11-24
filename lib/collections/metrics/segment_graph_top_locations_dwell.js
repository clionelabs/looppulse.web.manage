/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 */
SegmentGraphTopLocationsDwell = function(segment, from, to, data) {
  SegmentGraphBase.call(this, segment, from, to);
  this.graphType = SegmentGraphBase.Graph.TopLocationsDwell;
  this.data = data;
}

SegmentGraphTopLocationsDwell.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphTopLocationsDwell.prototype.constructor = SegmentGraphTopLocationsDwell;