SegmentMetrics = {};

SegmentMetrics.find = function (selector) {
  return Metrics.find(_.extend({}, selector, { type: SegmentMetric.type }));
};

SegmentMetrics.findOneOrDefault = function (selector) {
  var segmentMetric = Metrics.findOne(selector);
  if (!segmentMetric) {
    segmentMetric = new SegmentMetric(_.extend({}, selector, {
      visitorCount: 0,
      visitCount: 0,
      dwellTime: 0,
      repeatedVisitPercentage: 0
    }));
  }
  return segmentMetric;
};

/**
 *
 * @param segmentId
 * @returns {SegmentMetric}
 */
SegmentMetrics.findOneBySegment = function (segmentId) {
  var selector = {
    type: SegmentMetric.type,
    resolution: Metric.forever,
    segmentId: segmentId
  };
  return SegmentMetrics.findOneOrDefault(selector);
};

/**
 *
 * @param doc
 * @constructor
 * @augments BaseMetric
 *
 * @property type
 * @property segmentId
 * @property resolution  - possible values: ["hourly", "daily", "forever"]
 * @property startTime
 * @property visitorCount
 * @property visitCount
 * @property dwellTime
 * @property repeatedVisitCount
 * @property visitPercentageChangeSinceLastWeek
 * @property dwellTimeAveragePercentageChangeSinceLastWeek
 * @property repeatedVisitPercentageChangeSinceLastWeek
 */
SegmentMetric = function (doc) {
  var self = this;

  // FIXME store missed properties: repeatedVisitPercentage
  BaseMetric.call(self, doc);
  self.type = SegmentMetric.type;
};

SegmentMetric.prototype = Object.create(BaseMetric.prototype);
SegmentMetric.prototype.constructor = SegmentMetric;

SegmentMetric.type = "segment";

SegmentMetric.prototype.getDwellTimeAverage = function () {
  return this.dwellTime / this.visitCount;
};

SegmentMetric.prototype.getChangePercentagesSince = function (numOfDays) {
  var self = this;
  var segmentMetric = SegmentMetrics.findOneOrDefault({
    segmentId: self.segmentId,
    resolution: Metric.daily,
    startTime: +moment().startOf('day').subtract(numOfDays, 'days')
  });
  return {
    visitorCount: BaseMetric.calculateChangePercentage(
      self.visitorCount, segmentMetric.visitorCount),
    dwellTimeAverage: BaseMetric.calculateChangePercentage(
      self.getDwellTimeAverage(), segmentMetric.getDwellTimeAverage())
  };
};
