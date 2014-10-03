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

  return [hourlySelector, dailySelector];
};

var truncateToHours = function(milliseconds) {
  return MetricsHelper.truncatedDateToHours(new Date(milliseconds)).getTime();
};

var truncateToDays = function(milliseconds) {
  return MetricsHelper.truncatedDateToDate(new Date(milliseconds)).getTime();
};

InstallationMetric.startup = function() {
  Encounters.findClosed().observe({
    _suppress_initial: true,
    "added": handleClosedEncounterAdded
  });
};
