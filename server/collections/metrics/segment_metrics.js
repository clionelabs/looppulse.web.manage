SegmentMetric.startup = function () {
  function handleSegmentVisitorAdded(segmentVisitor) {
    var selector = {
      type: SegmentMetric.type,
      resolution: Metric.forever,
      segmentId: segmentVisitor.segmentId
    };
    var visitorMetric = VisitorMetrics.findOneByVisitor(segmentVisitor.visitorId);
    var modifier = {
      $inc: {
        visitCount: visitorMetric.visitCount,
        dwellTime: visitorMetric.dwellTime
      },
      $setOnInsert: selector
    };
    Metrics.upsert(selector, modifier);
  }

  function handleSegmentVisitorRemoved(oldSegmentVisitor) {
    var selector = {
      type: SegmentMetric.type,
      resolution: Metric.forever,
      segmentId: oldSegmentVisitor.segmentId
    };
    var visitorMetric = VisitorMetrics.findOneByVisitor(oldSegmentVisitor.visitorId);
    var modifier = {
      $inc: {
        visitCount: visitorMetric.visitCount * -1,
        dwellTime: visitorMetric.dwellTime * -1
      },
      $setOnInsert: selector
    };
    Metrics.upsert(selector, modifier);
  }

  SegmentVisitors.find().observe({
    _suppress_initial: true,
    added: handleSegmentVisitorAdded,
    removed: handleSegmentVisitorRemoved
  });

  // FIXME observe VisitorMetrics for updates
};
