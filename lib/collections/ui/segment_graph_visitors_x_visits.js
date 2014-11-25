/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 */
SegmentGraphVisitorsXVisits = function(segment, from, to, data) {
  SegmentGraphBase.call(this, segment, from, to);
  this.graphType = SegmentGraphBase.Graph.VisitorsXVisits;
  this.data = data;
}

SegmentGraphVisitorsXVisits.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphVisitorsXVisits.prototype.constructor = SegmentGraphVisitorsXVisits;
