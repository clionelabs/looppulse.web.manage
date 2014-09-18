UpdateSegmentVisitors = function() {
  var result = { matched: 0, removed: 0 };
  Segments.findScheduled().map(function(segment) {
    Visitors.find().map(function(visitor) {
      var visitorId = visitor._id;
      var selector = {
        segmentId: segment._id,
        visitorId: visitorId
      };
      if (segment.match(visitorId)) {
        SegmentVisitors.upsert(selector, { $setOnInsert: selector });
        result.matched += 1;
      } else {
        SegmentVisitors.remove(selector);
        result.removed += 1;
      }
    });
  });
  return result;
};
