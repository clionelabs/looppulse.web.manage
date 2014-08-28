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
 */
InstallationMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = InstallationMetric.type;
};

InstallationMetric.prototype = Object.create(BaseMetric.prototype);
InstallationMetric.prototype.constructor = InstallationMetric;

InstallationMetric.type = "installation";

InstallationMetric.startup = function() {
  Encounters.findClosed().observe({
    _suppress_initial: true,
    "added": handleEncounterAdded
  });
};

var handleEncounterAdded = function(encounter) {
  var selector = {
    type: InstallationMetric.type,
    installationId: encounter.installationId
  };
  var installation = Installations.findOne({_id: encounter.installationId });
  var modifier = {
    $addToSet: { visitors: encounter.visitorId },
    $inc: {
      visitCount: 1,
      dwellTime: encounter.duration
    },
    $set: { locationId: installation.locationId },
    $setOnInsert: { repeatedVisitCount: 0 }
  };
  if (isRepeatedVisit(installationId, encounter.visitorId)) {
    // TODO repeatedVisitCount should only count same visitor once?! then repeatedVisitors should be tracked
    delete modifier.$setOnInsert.repeatedVisitCount;
    modifier.$inc.repeatedVisitCount = 1;
  }
  Metrics.upsert(selector, modifier);
};

var isRepeatedVisit = function(installationId, visitorId) {
  return InstallationMetrics.find({
    installationId: installationId,
    visitors: { $in: [ visitorId ] }
  }).count() > 0;
};
