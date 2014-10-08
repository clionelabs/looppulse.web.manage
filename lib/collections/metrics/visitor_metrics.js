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

VisitorMetrics.findForever = function (selector) {
  return VisitorMetrics.find(_.extend({}, selector, { resolution: Metric.forever }));
};

VisitorMetrics.findOneByVisitor = function (visitorId) {
  var selector = {
    type: VisitorMetric.type,
    resolution: Metric.forever,
    visitorId: visitorId
  };
  var visitorMetric = Metrics.findOne(selector);
  if (!visitorMetric) {
    visitorMetric = new VisitorMetric(_.extend({}, selector, {
      visitCount: 0,
      dwellTime: 0
    }));
  }
  return visitorMetric;
};

/**
 *
 * @param doc
 * @constructor
 * @augments BaseMetric
 *
 * @property type
 * @property visitorId
 * @property resolution  - possible values: ["hourly", "daily", "forever"]
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
