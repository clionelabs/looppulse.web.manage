SegmentMetric.startup = function () {
  function upsertSegmentMetric(segmentId, modifier) {
    var selector = {
      type: SegmentMetric.type,
      resolution: Metric.forever,
      segmentId: segmentId
    };
    Metrics.upsert(selector, _.extend({}, modifier, {
      $setOnInsert: selector
    }));

    snapshotToDaily(SegmentMetrics.findOneBySegment(segmentId));
  }

  function snapshotToDaily(segmentMetric) {
    var selector = {
      type: SegmentMetric.type,
      resolution: Metric.daily,
      segmentId: segmentMetric.segmentId,
      startTime: +moment().startOf('day')
    };

    Metrics.upsert(selector, {
      $setOnInsert: selector,
      $set: {
        visitorCount: segmentMetric.visitorCount,
        visitCount: segmentMetric.visitCount,
        dwellTime: segmentMetric.dwellTime
      }
    });
  }

  function handleSegmentVisitorAdded(segmentVisitor) {
    var visitorMetric = VisitorMetrics.findOneByVisitor(segmentVisitor.visitorId);
    var updateDoc = {
      $inc: {
        visitorCount: 1,
        visitCount: visitorMetric.visitCount,
        dwellTime: visitorMetric.dwellTime
      }
    };
    if(visitorMetric.isRepeated()) {
      _.extend(updateDoc.$inc, { repeatedVisitorsCount: 1 });
    }
    upsertSegmentMetric(segmentVisitor.segmentId, updateDoc);
  }

  function handleSegmentVisitorRemoved(oldSegmentVisitor) {
    var visitorMetric = VisitorMetrics.findOneByVisitor(oldSegmentVisitor.visitorId);
    // FIXME can be negative if added event is not processed
    var updateDoc = {
      $inc: {
        visitorCount: -1,
        visitCount: visitorMetric.visitCount * -1,
        dwellTime: visitorMetric.dwellTime * -1
      }
    };
    if(visitorMetric.isRepeated()) {
      _.extend(updateDoc.$inc, { repeatedVisitorsCount: -1 });
    }
    upsertSegmentMetric(oldSegmentVisitor.segmentId, updateDoc);
  }

  function handleVisitorMetricChanged(oldVisitorMetric, newVisitorMetric) {
    var diffDwellTime = newVisitorMetric.dwellTime - oldVisitorMetric.dwellTime;
    var updateDoc = {
      $inc : {
        dwellTime: diffDwellTime
      }
    };
    if (newVisitorMetric.isRepeated() && !oldVisitorMetric.isRepeated()) {
      _.extend(updateDoc, { repeatedVisitorsCount: 1 });
    }
    var segmentVisitor = SegmentVisitors.findOne({visitorId: newVisitorMetric.visitorId});
    upsertSegmentMetric(segmentVisitor.segmentId, updateDoc);
    
  }

  SegmentVisitors.find().observe({
    _suppress_initial: true,
    added: handleSegmentVisitorAdded,
    removed: handleSegmentVisitorRemoved
  });

  VisitorMetrics.find().observe({
    _suppress_initial: true,
    "changed": handleVisitorMetricChanged
  });

  // FIXME observe VisitorMetrics for updates
};

