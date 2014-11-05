SegmentVisitorMatcher = function(segment, visitor) {
  this.segment = segment;
  this.visitor = visitor;
} 

/**
 *  Check whether an encounter is relevant to a segment
 *
 *  @param {Encounter} encounter
 *  @return {BOOL} true/false
 */
SegmentVisitorMatcher.prototype.checkEncounterIsRelevant = function(encounter) {
  var criteria = this.segment.criteria;
  if (_.isEmpty(criteria)) { // All visitor segment only?
    return true;
  }

  if (criteria.durationInMinutes) {
    if (criteria.durationInMinutes.atLeast) {
      if (!encounter.duration || encounter.duration < criteria.durationInMinutes.atLeast * 60 * 1000) return false;
    }
    if (criteria.durationInMinutes.atMost) {
      if (encounter.duration && encounter.duration > criteria.durationInMinutes.atMost * 60 * 1000) return false; 
    }
  }
  if (criteria.days) {
    if (criteria.days.inLast) {
      if (encounter.enteredAt < moment().subtract(criteria.days.inLast, 'days')) return false;
    } else {
      if (encounter.enteredAt < criteria.days.start || encounter.enteredAt > criteria.days.end) return false;
    }
  }
  if (criteria.every) {
    dayOfWeek = encounter.enteredAt.day();
    if (criteria.every === "weekdays") {
      if (dayOfWeek < 1 || dayOfWeek > 5) return false;
    } else if (criteria.every === "weekends") {
      if (dayOfWeek !== 0 && dayOfWeek !== 6) return false;
    }
  }
  return true;
}

/**
 * Compute in/out events of a visitor-segment pair, happening from now into the future.
 * Note: This method currently is calling another private method doCmoputeCurrentStatus() solely for the purpose to ease unit-testing.
 *       The largest barrier is the "new TriggerLocation()" call inside the method, which we don't know how to stub.
 *       If we figure out how to stub constructor properly, we can get rid of the doComputeCurrentStatus(),
 *       and unit-test this method directly because unit-testing private method is not desirable.
 *
 * @return {Object[]} Array of events: details refer to doComputeCurrentStatus()
 */
SegmentVisitorMatcher.prototype.computeCurrentStatus = function() {
  var now = moment().valueOf();
  var installationIds = this.getInstallationIds(this.segment.criteria, this.segment.companyId);
  var encounters = this.getMatchedEncounters(this.segment.criteria, this.visitor._id, installationIds, now);
  var events = this.doComputeCurrentStatus(this.segment.criteria, installationIds, encounters, now); 
  return events;
}

/**
 * @private
 * @return {Number[]} Array of the relevant installation ids of a segment
 **/
SegmentVisitorMatcher.prototype.getInstallationIds = function(criteria, companyId) {
  var installationIds = new TriggerLocation(companyId, criteria.triggerLocations, criteria.locationIds).installationIds(); 
  return installationIds;
}

/**
 * @private
 * @return {Encounter[]} Array of encounters
 */
SegmentVisitorMatcher.prototype.getMatchedEncounters = function(criteria, visitorId, installationIds, now) {
  var selector = this.buildEncountersSelector(criteria, visitorId, installationIds, now);
  var encounters = Encounters.find(selector, {sort: {exitedAt: 1}}).fetch();
  return encounters;
}

/**
 * Build db selectors given the criteria, visitor, installations and current time.
 * Current time is needed for the "last X days" criteria.
 *
 * @private
 */
SegmentVisitorMatcher.prototype.buildEncountersSelector = function(criteria, visitorId, installationIds, now) {
  var selector = {
    visitorId: visitorId,
    installationId: { $in: installationIds }
  };

  if (criteria.durationInMinutes) {
    _.extend(selector, this.buildEncountersSelectorDuration(criteria.durationInMinutes));
  }
  if (criteria.every) {
    _.extend(selector, this.buildEncountersSelectorEvery(criteria.every));
  }
  if (criteria.days) {
    _.extend(selector, this.buildEncountersSelectorDays(criteria.days, now));
  }

  return selector;
}

/**
 * @private
 */
SegmentVisitorMatcher.prototype.buildEncountersSelectorDuration = function(durationInMinutes) {
  var selector = {};
  selector['duration'] = {};
  if (durationInMinutes.atLeast !== undefined) {
    selector['duration'].$gte = durationInMinutes.atLeast * 60 * 1000;
  }
  if (durationInMinutes.atMost !== undefined) {
    selector['duration'].$lte = durationInMinutes.atMost * 60 * 1000;
  }
  return selector;
}

/**
 * @private
 */
SegmentVisitorMatcher.prototype.buildEncountersSelectorEvery = function(every) {
  var selector = {};
  switch (every) {
    case "weekdays":
      selector["enteredAtParts.dayOfWeek"] = { $gte: 1, $lte: 5 };
      break;
    case "weekends":
      selector["enteredAtParts.dayOfWeek"] = { $in: [0, 6] };
      break;
    case "day":
      break;
  }
  return selector; 
}

/**
 * @private
 */
SegmentVisitorMatcher.prototype.buildEncountersSelectorDays = function(days, now) {
  var selector = {};
  if (days.inLast) {
    selector['enteredAt'] = {
      $gte: +moment(now).subtract(days.inLast, 'days')
    };
  } else {
    selector['enteredAt'] = {
      $gte: days.start,
      $lte: days.end
    };
  }
  return selector;
}

/**
 * Sort (In-place) encounters if it's not already been sorted
 * 
 * @private
 * @param {Encounter[]} encounters Array of encounters (may not be sorted)
 */
SegmentVisitorMatcher.prototype.sortEncounters = function(encounters) {
  var isSorted = true;
  for (var i = 1; i < encounters.length; i++) {
    if (encounters[i].exitedAt < encounters[i-1].exitedAt) {
      isSorted = false;
      break;
    }
  }

  if (isSorted) return;
  encounters.sort(function (e1, e2) {
    return e1.exitedAt.diff(e2.exitedAt) < 0 ? -1: 1;
  });
}

/**
 * check whether the encounterCount met a single installation requirement
 *
 * @private
 * @return true/false
 */
SegmentVisitorMatcher.prototype.isInstallationFulfilled = function(criteria, encounterCount) {
  if (!criteria.times) {
    return (encounterCount && encounterCount > 0);
  }
  return (encounterCount && (
         (criteria.times.atLeast && encounterCount >= criteria.times.atLeast) ||
         (criteria.times.atMost && encounterCount <= criteria.times.atMost)
        )); 
};

/**
 * Given the # of fulfilled installations individually, check whether the whole set is fulfilled as a whole.
 *
 * @private
 * @return {BOOL} true/false
 */
SegmentVisitorMatcher.prototype.isInstallationSetFulfilled = function(criteria, fulfilledCount, allCount) {
  if (criteria.hasBeen && criteria.to === "all") {
    return fulfilledCount === allCount;
  } else if (criteria.hasBeen && criteria.to === "any") {
    return fulfilledCount > 0;
  } else if (!criteria.hasBeen && criteria.to === "all") {
    return fulfilledCount === 0;
  } else if (!criteria.hasBeen && criteria.to === "any") {
    return fulfilledCount < allCount; 
  }
};

/**
 * Compute the # of encounters per each installations
 * 
 * @private
 * @return {Objects[]}
 */
SegmentVisitorMatcher.prototype.buildInstallationCounters = function(encounters) {
  var counters = {};
  _.each(encounters, function(encounter) {
    counters[encounter.installationId] = (counters[encounter.installationId] || 0) + 1;
  });
  return counters;
};

/*
 * Core matching function. Given installations, encounters and criteria, compute a list of 
 * in/out events happening from now into the future.
 *
 * @private
 * @param {SegmentCriteria} criteria
 * @param {Number[]} installationIds Array of installation ids
 * @param {Encounter[]} encounters Array of encounters (presumably sorted in exitedAt. We will sort them if not, but it's not desired, coz the running time will become O(NlogN)), so better fetch them sorted from mongo.
 *
 * @return {Object[]} Array of events, with each events having an attribute of i) deltaAt (timestamp in ms), and ii) delta (enter = 1, exit = -1)
 *    a sample return would be: [{time: deltaAt, delta: 1}, {deltaAt: date2, delta: -1}]. This means that an enter 
 *    event is happening on time data1, and a exit event is happening on time date2. 
 */
SegmentVisitorMatcher.prototype.doComputeCurrentStatus = function(criteria, installationIds, encounters, now) {
  if (_.isEmpty(criteria)) { // All visitor segment only?
    return [{deltaAt: now, delta: 1}];
  }
  this.sortEncounters(encounters);  // not necessary if they are already sorted, but for completeness....

  var self = this;
  var counters = this.buildInstallationCounters(encounters);

  // loop installations, and see how many of them match the requirement
  var okCount = 0;
  _.each(installationIds, function(installationId) {
    if (self.isInstallationFulfilled(criteria, counters[installationId])) okCount++;    
  });

  var result = [];
  var delta = this.isInstallationSetFulfilled(criteria, okCount, installationIds.length)? 1: -1;
  result.push({deltaAt: now, delta: delta});

  // quick check and see if future events are possible
  if (!criteria.days || !criteria.days.inLast) return result;

  // loop through the encounters, and remove them on by one, and track the changes in the future
  _.each(encounters, function(encounter) {
    var invalidTime = moment(encounter.exitedAt).add(criteria.days.inLast, 'days').valueOf();
    var matchBefore = self.isInstallationFulfilled(criteria, counters[encounter.installationId]);
    counters[encounter.installationId]--;
    var matchAfter = self.isInstallationFulfilled(criteria, counters[encounter.installationId]);

    var setMatchBefore = self.isInstallationSetFulfilled(criteria, okCount, installationIds.length);
    if (matchBefore && !matchAfter) okCount--;
    if (!matchBefore && matchAfter) okCount++;
    var setMatchAfter = self.isInstallationSetFulfilled(criteria, okCount, installationIds.length);

    if (setMatchBefore && !setMatchAfter) {
        result.push({deltaAt: invalidTime, delta: -1});
    }
    if (!setMatchBefore && setMatchAfter) {
        result.push({deltaAt: invalidTime, delta: 1});
    }
  });

  return result;
};
