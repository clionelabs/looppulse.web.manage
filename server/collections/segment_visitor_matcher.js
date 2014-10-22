SegmentVisitorMatcher = function(segment, visitor) {
  var installationIds = new TriggerLocation(segment.companyId, segment.criteria.triggerLocations, segment.criteria.locationIds).installationIds(); 
} 

/**
 * Sort encounters if it's not already been sorted
 * 
 * @param encounters Array of encounters (may not be sorted)
 * @return Array of sorted encounters
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
    return e1.exitedAt.getTime() < e2.exitedAt.getTime()? -1: 1;
  });
}

/**
 * check whether the encounterCount met a single installation requirement
 *
 * @return true/false
 */
SegmentVisitorMatcher.prototype.isInstallationFulfilled = function(criteria, encounterCount) {
  return (encounterCount && (
         (criteria.times.atLeast && encounterCount >= criteria.times.atLeast) ||
         (criteria.times.atMost && encounterCount <= criteria.times.atMost)
        )); 
};

/**
 * Given the # of fulfilled installations individually, check whether the whole set is fulfilled as a whole.
 *
 * @return true/false
 */
SegmentVisitorMatcher.prototype.isInstallationSetFulfilled = function(criteria, fulfilledCount, allCount) {
  if (criteria.hasBeen && criteria.to === "all") {
    return fulfilledCount === allCount;
  } else if (criteria.hasBeen && criteria.to === "any") {
    return fulfilledCount > 0;
  } else if (!criteria.hasBeen && criteria.to === "all") {
    return fulfilledCount === 0;
  } else if (!criteria.hasBeen && criteria.to === "any") {
    return fulfilledCount < fulfilledCount; 
  }
};

/**
 * Compute the # of encounters per each installations
 */
SegmentVisitorMatcher.prototype.buildInstallationCounters = function(encounters) {
  var counters = {};
  _.each(encounters, function(encounter) {
    counters[encounter.installationId] = (counters[encounter.installationId] || 0) + 1;
  });
  return counters;
};

/**
 * Core matching function. Given installations, encounters and critier, compute a list of 
 * in/out events happening from the last encounter into the future.
 *
 * @param installationIds  Array of installation ids
 * @param encounters Array of encounters (presumably sorted in exitedAt. We will sort them if not, but it's not desired, coz the running time will become O(NlogN))
 * @param criteria SegmentCriteria
 *
 * @return Array of events, with each events having an attribute of i) time, and ii) delta (enter = 1, exit = -1)
 *    a sample return would be: [{time: date1, delta: 1}, {time: date2, delta: -1}]. This means that an enter 
 *    event is happening on time data1, and a exit event is happening on time dat2. 
 */
SegmentVisitorMatcher.prototype.doMatch = function(installationIds, encounters, criteria) {
  var self = this;
  var counters = this.buildInstallationCounters(encounters);

  // loop installations, and see how many of them match the requirement
  var okCount = 0;
  _.each(installationIds, function(installationId) {
    if (self.isInstallationFulfilled(criteria, counters[installationId])) okCount++;    
  });

  var result = [];
  var delta = this.isInstallationSetFulfilled(criteria, okCount, installationIds.length)? 1: -1;
  result.push({time: encounters[encounters.length-1].exitedAt, delta: delta});

  // quick check and see if future events are possible
  if (!criteria.days || !criteria.days.inLast) return result;

  // loop through the encounters, and remove them on by one, and track the changes in the future
  _.each(encounters, function(encounter) {
    var invalidTime = moment(encounter.exitedAt).add(criteria.days.inLast, 'days').toDate();
    var matchBefore = self.isInstallationFulfilled(criteria, counters[encounter.installationId]);
    counters[encounter.installationId]--;
    var matchAfter = self.isInstallationFulfilled(criteria, counters[encounter.installationId]);

    var setMatchBefore = self.isInstallationSetFulfilled(criteria, okCount, installationIds.length);
    if (matchBefore && !matchAfter) okCount--;
    if (!matchBefore && matchAfter) okCount++;
    var setMatchAfter = self.isInstallationSetFulfilled(criteria, okCount, installationIds.length);

    if (setMatchBefore && !setMatchAfter) {
        result.push({time: invalidTime, delta: -1});
    }
    if (!setMatchBefore && setMatchAfter) {
        result.push({time: invalidTime, delta: 1});
    }
  });

  return result;
};
