/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 */
SegmentGraphVisitorsXDates = function(segment, from, to, data) {
  SegmentGraphBase.call(this, segment, from, to);
  this.graphType = SegmentGraphBase.Graph.VisitorsXDates;
  this.data = data;
}

SegmentGraphVisitorsXDates.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphVisitorsXDates.prototype.constructor = SegmentGraphVisitorsXDates;