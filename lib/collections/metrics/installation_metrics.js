InstallationMetrics = {};

InstallationMetrics.find = function(selector) {
  var finalSelector = {type: InstallationMetric.type};
  _.extend(finalSelector, selector);
  return Metrics.find(finalSelector);
};

/**
 *
 * @param doc
 * @constructor
 * @augments BaseMetric
 *
 * @property type
 * @property installationId
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
  Metrics.upsert(selector, modifier);
};
