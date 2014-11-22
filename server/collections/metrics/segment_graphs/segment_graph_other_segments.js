/**
 * @param {Segment} segment
 * @param {Unix Timestamp} from Metric start time
 * @param {Unix Timestamp} to Metric end time
 */
SegmentGraphOtherSegments = function(segment, from, to) {
  SegmentGraphBase.call(this, segment, from, to);
  this.graphType = SegmentMetric.Graph.OtherSegments;
}

SegmentGraphOtherSegments.prototype = Object.create(SegmentGraphBase.prototype);
SegmentGraphOtherSegments.prototype.constructor = SegmentGraphOtherSegments;

SegmentGraphOtherSegments.prototype.prepareData = function(visitorIds, otherSegmentVisitorIds, otherSegmentNames) {
  var thisVisitorIdSet = _.reduce(visitorIds, function(memo, visitorId) {
    memo[visitorId] = true;
    return memo;
  }, {});

  var result = [];
  _.each(otherSegmentNames, function(segName, sid) {
    var cnt = _.reduce(otherSegmentVisitorIds[sid], function(memo, visitorId) {
      return memo + (thisVisitorIdSet[visitorId] === undefined? 0: 1);
    }, 0);
    if (cnt > 0) {
      result.push({segmentName: segName, percent: cnt/visitorIds.length});
    };
  });
  this.data = _.sortBy(result, function(item) {
      return -1 * item['percent'];
  });
}

