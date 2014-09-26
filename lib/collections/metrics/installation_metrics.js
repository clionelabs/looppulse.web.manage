InstallationMetrics = {};

InstallationMetrics.find = function(selector) {
  var finalSelector = {type: InstallationMetric.type};
  _.extend(finalSelector, selector);
  return Metrics.find(finalSelector);
};

InstallationMetrics.findOne = function(selector) {
  var finalSelector = {type: InstallationMetric.type};
  _.extend(finalSelector, selector);
  return Metrics.findOne(finalSelector);
};

InstallationMetrics.findDaily = function(selector) {
  var finalSelector = {resolution: Metric.daily};
  _.extend(finalSelector, selector);
  return InstallationMetrics.find(finalSelector);
};

InstallationMetrics.findHourly = function(selector) {
  var finalSelector = {resolution: Metric.hourly};
  _.extend(finalSelector, selector);
  return InstallationMetrics.find(finalSelector);
};

/**
 *
 * @param doc
 * @constructor
 * @augments BaseMetric
 *
 * @property type
 * @property installationId
 * @property resolution  - possible values: ["hourly", "daily"]
 * @property startTime
 * @property visitCount
 * @property dwellTime
 * @property repeatedVisitCount
 * @property visitorIds
 * @property locationId  - Denormalized from Installation
 * @property visitorCount  - Unique visitor count
 */
InstallationMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = InstallationMetric.type;

  this.visitorCount = this.visitorIds.length;
};

InstallationMetric.prototype = Object.create(BaseMetric.prototype);
InstallationMetric.prototype.constructor = InstallationMetric;

InstallationMetric.type = "installation";
