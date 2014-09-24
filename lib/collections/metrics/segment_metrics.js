SegmentMetrics = {};

/**
 *
 * @param selector
 * @param selector.segmentId
 * @returns {SegmentMetric}
 */
SegmentMetrics.findOneForThisWeek = function(selector) {
  var segmentId = selector.segmentId;
  var now = new Date();
  var startTime = MetricsHelper.nDaysAgoTruncatedTime(now, 7);

  var visitorIds = SegmentVisitors.find({ segmentId: segmentId }).map(function(segmentVisitor) {
    return segmentVisitor.visitorId;
  });
  var doc = {
    segmentId: segmentId,
    startTime: startTime,
    visitCount: 0,
    dwellTime: 0,
    repeatedVisitCount: 0,
    visitorCount: 0
  };
  VisitorMetrics.findDaily({
    startTime: { $gte: startTime },
    visitorId: { $in: visitorIds }
  }).map(function(visitorMetric) {
    doc.visitCount += visitorMetric.visitCount;
    doc.dwellTime += visitorMetric.dwellTime;
    doc.repeatedVisitCount += (visitorMetric.visitCount > 1 ? 1 : 0);
    doc.visitorCount += 1;
  });

  {
    var docLastWeek = {
      segmentId: segmentId,
      startTime: startTime,
      visitCount: 0,
      dwellTime: 0,
      repeatedVisitCount: 0,
      visitorCount: 0
    };
    VisitorMetrics.findDaily({
      startTime: { $gte: MetricsHelper.nDaysAgoTruncatedTime(now, 14), $lt: startTime },
      visitorId: { $in: visitorIds }
    }).map(function(visitorMetric) {
      doc.visitCount += visitorMetric.visitCount;
      doc.dwellTime += visitorMetric.dwellTime;
      doc.repeatedVisitCount += (visitorMetric.visitCount > 1 ? 1 : 0);
      doc.visitorCount += 1;
    });

    var visitCountLastWeek = docLastWeek.visitCount,
      dwellTimeLastWeek = docLastWeek.dwellTime,
      repeatedVisitLastWeek = doc.repeatedVisitCount;
    doc.visitPercentageChangeSinceLastWeek = BaseMetric.calculatePercentage(
        doc.visitCount - visitCountLastWeek, visitCountLastWeek);
    doc.dwellTimeAveragePercentageChangeSinceLastWeek = BaseMetric.calculatePercentage(
        doc.dwellTimeAverage - dwellTimeLastWeek, dwellTimeLastWeek);
    doc.repeatedVisitPercentageChangeSinceLastWeek = BaseMetric.calculatePercentage(
        doc.repeatedVisitCount - repeatedVisitLastWeek, repeatedVisitLastWeek);
  }

  return new SegmentMetric(doc);
};

/**
 *
 * @param doc
 * @constructor
 * @augments BaseMetric
 *
 * @property type
 * @property segmentId
 * @property resolution  - possible values: ["hourly", "daily"]
 * @property startTime
 * @property visitCount
 * @property dwellTime
 * @property repeatedVisitCount
 * @property visitPercentageChangeSinceLastWeek
 * @property dwellTimeAveragePercentageChangeSinceLastWeek
 * @property repeatedVisitPercentageChangeSinceLastWeek
 */
SegmentMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = SegmentMetric.type;
};

SegmentMetric.prototype = Object.create(BaseMetric.prototype);
SegmentMetric.prototype.constructor = SegmentMetric;

SegmentMetric.type = "segment";
