EngagementMetrics = {};

EngagementMetrics.find = function(selector) {
  var finalSelector = {type: EngagementMetric.type};
  _.extend(finalSelector, selector);
  return Metrics.find(finalSelector);
};

EngagementMetrics.findOne = function(selector) {
  var finalSelector = {type: EngagementMetric.type};
  _.extend(finalSelector, selector);
  var metric = Metrics.findOne(finalSelector);
  if (!metric && selector.engagementId) {
    metric = new EngagementMetric({
      engagementId: selector.engagementId,
      sentMessageCount: 0,
      viewedMessageCount: 0,
      visitedCount: 0
    });
  }
  return metric;
};

/**
 *
 * @param doc
 * @constructor
 * @augments BaseMetric
 *
 * @property type
 * @property engagementId
 * @property sentMessageCount
 * @property viewedMessageCount
 * @property visitedCount
 * @property locationId  - Denormalized from Engagement
 */
EngagementMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = EngagementMetric.type;
};

EngagementMetric.prototype = Object.create(BaseMetric.prototype);
EngagementMetric.prototype.constructor = EngagementMetric;

EngagementMetric.prototype.conversionRates = function() {
  return {
    sentMessageToViewed: BaseMetric.calculateConversionRate(this.sentMessageCount, this.viewedMessageCount),
    sentMessageToVisited: BaseMetric.calculateConversionRate(this.sentMessageCount, this.visitedCount),
    viewedMessageToVisited: BaseMetric.calculateConversionRate(this.viewedMessageCount, this.visitedCount)
  };
};

EngagementMetric.type = "engagement";
