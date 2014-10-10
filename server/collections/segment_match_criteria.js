SegmentMatchCriteria = function(criteria) {
  this.criteria = criteria;
};

SegmentMatchCriteria.prototype.match = function(companyId, visitorId) {
  var criteria = this.criteria;

  this.now = new Date();
  this.installationIds = new TriggerLocation(companyId, criteria.triggerLocations, criteria.locationIds).installationIds();

  this.encounterSelector = {
    visitorId: visitorId,
    installationId: { $in: this.installationIds }
  };

  this.updateEncounterSelectorByCriteriaDays();
  this.updateEncounterSelectorByCriteriaEvery();
  this.updateEncounterSelectorByCriteriaDuationInMinutes();

  if (criteria.hasBeen && criteria.to === "all") {
    return this.matchHasBeenToAll();
  } else if (criteria.hasBeen && criteria.to === "any") {
    return this.matchHasBeenToAny();
  } else if (!criteria.hasBeen && criteria.to === "all") {
    return this.matchNotHasBeenAll();
  } else if (!criteria.hasBeen && criteria.to === "any") {
    return this.matchNotHasBeenAny();
  }
};

SegmentMatchCriteria.prototype.matchHasBeenToAll = function() {
  var criteria = this.criteria;
  var installationEncounterCounter = this.getInstallationEncounterCounter();

  var result = true;
  _.each(this.installationIds, function(installationId) {
    var encounterCount = installationEncounterCounter[installationId];
    if (!encounterCount
      || (criteria.times.atLeast && encounterCount < criteria.times.atLeast)
      || (criteria.times.atMost && encounterCount > criteria.times.atMost)) {
      result = false;
      return false;
    }
  });
  return result;
};

SegmentMatchCriteria.prototype.matchHasBeenToAny = function() {
  var installationEncounterCounter = this.getInstallationEncounterCounter();
  var criteria = this.criteria;

  var result = false;
  _.each(this.installationIds, function(installationId) {
    var encounterCount = installationEncounterCounter[installationId];
    if ((criteria.times.atLeast && encounterCount >= criteria.times.atLeast)
      || (criteria.times.atMost && encounterCount <= criteria.times.atMost)) {
      result = true;
      return false;
    }
  });
  return result;
};

SegmentMatchCriteria.prototype.matchNotHasBeenAll = function() {
  var installationEncounterCounter = this.getInstallationEncounterCounter();

  var result = true;
  _.each(this.installationIds, function(installationId) {
    var encounterCount = installationEncounterCounter[installationId];
    if (!encounterCount) {
      result = false;
      return false;
    }
  });
  return result;
};

SegmentMatchCriteria.prototype.matchNotHasBeenAny = function() {
  var installationEncounterCounter = this.getInstallationEncounterCounter();

  var result = false;
  _.each(this.installationIds, function(installationId) {
    var encounterCount = installationEncounterCounter[installationId];
    if (encounterCount) {
      result = true;
      return false;
    }
  });
  return result;
};

SegmentMatchCriteria.prototype.getInstallationEncounterCounter = function() {
  var installationEncounterCounter = {};
  Encounters.find(this.encounterSelector).forEach(function(encounter) {
    var installationId = encounter.installationId;
    installationEncounterCounter[installationId] = (installationEncounterCounter[installationId] || 0) + 1;
  });
  return installationEncounterCounter;
};

SegmentMatchCriteria.prototype.updateEncounterSelectorByCriteriaDays = function() {
  var criteria = this.criteria;
  var days = criteria.days;

  if (!days) {
    return;
  }

  if (days.inLast) {
    this.encounterSelector.enteredAt = {
      $gte: MetricsHelper.nDaysAgo(this.now, days.inLast)
    };
  } else {
    this.encounterSelector.enteredAt = {
      $gte: days.start,
      $lte: days.end
    };
  }
};

SegmentMatchCriteria.prototype.updateEncounterSelectorByCriteriaEvery = function() {
  var encounterSelector = this.encounterSelector;

  switch (this.criteria.every) {
    case "weekdays":
      encounterSelector["enteredAtParts.dayOfWeek"] = { $gte: 1, $lte: 5 };
      break;
    case "weekends":
      encounterSelector["enteredAtParts.dayOfWeek"] = { $in: [0, 6] };
      break;
    case "day":
      break;
  }
};

SegmentMatchCriteria.prototype.updateEncounterSelectorByCriteriaDuationInMinutes = function() {
  var criteria = this.criteria;
  var encounterSelector = this.encounterSelector;

  if (!criteria.hasBeen) {
    return;
  }

  var durationInMinutes = criteria.durationInMinutes;
  if (durationInMinutes) {
    encounterSelector.duration = {};
    if (durationInMinutes.atLeast) {
      encounterSelector.duration.$gte = durationInMinutes.atLeast * 60 * 1000;
    }
    if (durationInMinutes.atMost) {
      encounterSelector.duration.$lte = durationInMinutes.atMost * 60 * 1000;
    }
  }
};
