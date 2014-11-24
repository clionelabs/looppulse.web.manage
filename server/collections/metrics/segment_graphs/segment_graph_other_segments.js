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

