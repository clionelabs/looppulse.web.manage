InstallationMetrics = {};

InstallationMetrics.find = function(selector) {
  var finalSelector = {type: InstallationMetric.type};
  _.extend(finalSelector, selector);
  return Metrics.find(finalSelector);
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

InstallationMetric.startup = function() {
  Encounters.findClosed().observe({
    _suppress_initial: true,
    "added": handleClosedEncounterAdded
  });
};

var handleClosedEncounterAdded = function(encounter) {
  var installation = Installations.findOne({_id: encounter.installationId });
  _.each(upsertSelectors(encounter), function(selector) {
    var modifier = {
      $addToSet: { visitorIds: encounter.visitorId },
      $inc: {
        visitCount: 1,
        dwellTime: encounter.duration,
        repeatedVisitCount: isRepeatedVisit(selector, encounter) ? 1 : 0
      },
      $set: { locationId: installation.locationId }
    };
    Metrics.upsert(selector, modifier);
  });
};

var isRepeatedVisit = function(installationMetricSelector, encounter) {
  var selector = {visitorIds: { $in: [ encounter.visitorId ] }};
  _.extend(selector, installationMetricSelector);
  var hasCounted = !!InstallationMetrics.findOne(selector);
  return !hasCounted && encounter.hasVisitedBefore(installationMetricSelector.startTime);
};

var upsertSelectors = function(encounter) {
  var selector = {
    type: InstallationMetric.type,
    installationId: encounter.installationId
  };

  var hourlySelector = {
    resolution: Metric.hourly,
    startTime: truncateToHours(encounter.enteredAt)
  };
  _.extend(hourlySelector, selector);

  var dailySelector = {
    resolution: Metric.daily,
    startTime: truncateToDays(encounter.enteredAt)
  };
  _.extend(dailySelector, selector);

  return [hourlySelector, dailySelector]
};

var truncateToHours = function(milliseconds) {
  return MetricsHelper.truncatedDateToHours(new Date(milliseconds)).getTime();
};

var truncateToDays = function(milliseconds) {
  return MetricsHelper.truncatedDateToDate(new Date(milliseconds)).getTime();
};
