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

VisitorMetric.startup = function() {
  Encounters.findClosed().observe({
    _suppress_initial: true,
    "added": handleClosedEncounterAdded
  });
};

var handleClosedEncounterAdded = function(encounter) {
  var selector = {
    type: VisitorMetric.type,
    visitorId: encounter.visitorId
  };

  var hourlySelector = _.extend({}, selector, {
    resolution: Metric.hourly,
    startTime: truncateToHours(encounter.enteredAt)
  });
  var anHour = 1000 * 60 * 60;
  // TODO extract this to helper function
  if (hourlySelector.startTime <= encounter.enteredAt && encounter.enteredAt < hourlySelector.startTime + anHour) {
    var hourlyModifier = {
      $inc: {
        visitCount: 1,
        dwellTime: encounter.duration
      }
    };
    Metrics.upsert(hourlySelector, hourlyModifier);
  }

  var dailySelector = _.extend({}, selector, {
    resolution: Metric.daily,
    startTime: truncateToDays(encounter.enteredAt)
  });
  var aDay = anHour * 24;
  if (dailySelector.startTime <= encounter.enteredAt && encounter.enteredAt < dailySelector.startTime + aDay) {
    var dailyModifier = {
      $inc: {
        visitCount: 1,
        dwellTime: encounter.duration
      }
    };
    Metrics.upsert(dailySelector, dailyModifier);
  }
};

// TODO reuse installation_metrics one
var truncateToHours = function(milliseconds) {
  return MetricsHelper.truncatedDateToHours(new Date(milliseconds)).getTime();
};

var truncateToDays = function(milliseconds) {
  return MetricsHelper.truncatedDateToDate(new Date(milliseconds)).getTime();
};
