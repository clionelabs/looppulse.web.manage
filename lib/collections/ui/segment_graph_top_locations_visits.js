/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 */
SegmentGraphTopLocationsVisits = function(segment, from, to, data) {
  SegmentGraphBase.call(this, segment, from, to);
  this.graphType = SegmentGraphBase.Graph.TopLocationsVisits;
  this.data = data;
}

SegmentGraphTopLocationsVisits.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphTopLocationsVisits.prototype.constructor = SegmentGraphTopLocationsVisits;