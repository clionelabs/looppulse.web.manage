InstallationMetrics = {};

InstallationMetrics.find = function(selector) {
  var finalSelector = {type: InstallationMetric.type};
  _.extend(finalSelector, selector);
  return Metrics.find(finalSelector);
};

InstallationMetrics.findDaily = function(selector) {
  var finalSelector = {resolution: "daily"};
  _.extend(finalSelector, selector);
  return InstallationMetrics.find(finalSelector);
};

InstallationMetrics.findHourly = function(selector) {
  var finalSelector = {resolution: "hourly"};
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
 * @property visitors
 * @property locationId  - Denormalized from Installation
 * @property visitorCount  - Unique visitor count
 */
InstallationMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = InstallationMetric.type;

  this.visitorCount = this.visitors.length;
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
  var selector = {
    type: InstallationMetric.type,
    installationId: encounter.installationId
  };
  var installation = Installations.findOne({_id: encounter.installationId });
  var modifier = {
    $addToSet: { visitors: encounter.visitorId },
    $inc: {
      visitCount: 1,
      dwellTime: encounter.duration,
      repeatedVisitCount: encounter.isRepeatedVisit() ? 1 : 0
    },
    $set: { locationId: installation.locationId }
  };
  upsertInstallationMetric(encounter.enteredAt, selector, modifier);
};

var upsertInstallationMetric = function(encounterTime, selector, modifier) {
  var hourlySelector = {
    resolution: "hourly",
    startTime: truncateToHours(encounterTime)
  };
  _.extend(hourlySelector, selector);
  Metrics.upsert(hourlySelector, modifier);

  var dailySelector = {
    resolution: "daily",
    startTime: truncateToDays(encounterTime)
  };
  _.extend(dailySelector, selector);
  Metrics.upsert(dailySelector, modifier);
};

var truncateToHours = function(milliseconds) {
  return MetricsHelper.truncatedDateToHours(new Date(milliseconds)).getTime();
};

var truncateToDays = function(milliseconds) {
  return MetricsHelper.truncatedDateToDate(new Date(milliseconds)).getTime();
};
