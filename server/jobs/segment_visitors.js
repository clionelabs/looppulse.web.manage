UpdateSegmentVisitors = function() {
  var result = { added: 0, matched: 0, removed: 0, unmatched: 0 };
  Segments.findScheduled().map(function(segment) {
    Visitors.findByGraphType().map(function(visitor) {
      var visitorId = visitor._id;
      var selector = {
        segmentId: segment._id,
        visitorId: visitorId
      };
      if (segment.match(visitorId)) {
        var upsertResult = SegmentVisitors.upsertBySelector(selector);
        result.added += upsertResult.numberAffected;
        result.matched += 1;
      } else {
        result.removed += SegmentVisitors.remove(selector);
        result.unmatched += 1;
      }
    });
  });
  return result;
};
