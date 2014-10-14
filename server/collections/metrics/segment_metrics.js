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
    console.log("[SegmentMetric] handleSegmentVisitorAdded of visitor " + segmentVisitor.visitorId + " to segment" + segmentVisitor.segmentId);
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
    console.log("[SegmentMetric] handleSegmentVisitorRemoved of visitor " + oldSegmentVisitor.visitorId + " from segment" + oldSegmentVisitor.segmentId);
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

  function handleVisitorMetricChanged(newVisitorMetric, oldVisitorMetric) {
    console.log("[SegmentMetric] handleVisitorMetricChanged of " + newVisitorMetric.visitorId);
    var diffDwellTime = newVisitorMetric.dwellTime - oldVisitorMetric.dwellTime;
    var diffVisitCount = newVisitorMetric.visitCount - oldVisitorMetric.visitCount
    var updateDoc = {
      $inc : {
        visitCount: diffVisitCount,
        dwellTime: diffDwellTime
      }
    };
    if (newVisitorMetric.isRepeated() && !oldVisitorMetric.isRepeated()) {
      _.extend(updateDoc.$inc, { repeatedVisitorsCount: 1 });
    }
    SegmentVisitors.find({visitorId: newVisitorMetric.visitorId})
      .map(function(segmentVisitor) {
        console.log("[SegmentMetric] change " + segmentVisitor.segmentId + " with " + JSON.stringify(updateDoc));
        upsertSegmentMetric(segmentVisitor.segmentId, updateDoc);
      });
    
  }

  SegmentVisitors.find().observe({
    _suppress_initial: true,
    added: handleSegmentVisitorAdded,
    removed: handleSegmentVisitorRemoved
  });

  VisitorMetrics.findForever().observe({
    _suppress_initial: true,
    "changed": handleVisitorMetricChanged
  });

};

