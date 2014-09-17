UpdateSegmentVisitors = function() {
  var result = { matched: 0, removed: 0 };
  Visitors.find().map(function(visitor) {
    Segments.find().map(function(segment) {
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
