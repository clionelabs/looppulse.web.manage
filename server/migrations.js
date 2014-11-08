var recomputeAllSegmentVisitorFlows = function() {
  SegmentVisitorFlows.remove({});
  Segments.find().map(function(segment) {
      Visitors.find().map(function(visitor) {
        var matcher = new SegmentVisitorMatcher(segment, visitor);
        var statusDelta = matcher.computeCurrentStatus();
        var selector = {
          segmentId: segment._id,
          visitorId: visitor._id
        };

        if (statusDelta.length === 0) return; // Not supposed to be 0 though. Just to be safe.

        // remove all existing future events
        SegmentVisitorFlows.remove(_.extend({}, selector, {deltaAt: {$gte: statusDelta[0].deltaAt}}));

        var lastFlow = SegmentVisitorFlows.findOne(selector, {sort: {deltaAt: -1}});
        var lastDelta = lastFlow === undefined? -1: lastFlow.delta;
        _.each(statusDelta, function(flow) {
          if (flow.delta !== lastDelta) {
            SegmentVisitorFlows.insert(_.extend({}, selector, {deltaAt: flow.deltaAt, delta: flow.delta}));
            lastDelta = flow.delta;
          }
        });
      });
  });
};

recomputeAllSegmentVisitorFlows();
