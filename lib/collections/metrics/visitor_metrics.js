VisitorMetrics = {};

VisitorMetrics.find = function(selector) {
  var finalSelector = {type: VisitorMetric.type};
  _.extend(finalSelector, selector);
  return Metrics.find(finalSelector);
};

VisitorMetrics.findDaily = function(selector) {
  var finalSelector = {resolution: Metric.daily};
  _.extend(finalSelector, selector);
  return VisitorMetrics.find(finalSelector);
};

/**
 *
 * @param doc
 * @constructor
 * @augments BaseMetric
 *
 * @property type
 * @property visitorId
 * @property resolution  - possible values: ["hourly", "daily"]
 * @property startTime
 * @property visitCount
 * @property dwellTime
 */
VisitorMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = VisitorMetric.type;
};

VisitorMetric.prototype = Object.create(BaseMetric.prototype);
VisitorMetric.prototype.constructor = VisitorMetric;

VisitorMetric.type = "visitor";
