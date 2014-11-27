/*
 * VisitorEncountersCache provides an in-memory cache of all encounters, grouped by visitor. i.e. data contains information of the following structure:
 * {
 *   visitor1: [encounter11, encounter12, ...],
 *   visitor2: [encounter21, encounter22, ...],
 *   ....
 * }
 *
 * The purpose is to support efficient fetching on encounters. Due to the big overhead on Meteor Collections, fetching a lot of encounters into
 * a collection is very slow. e.g. 10000 records take already around 1 second...
 */
VisitorEncountersCache = {
  data: {},
  encounterIdSet: {} // keep track of all inserted encounters to avoid same encounters from being added twice
};

/*
 * Insert encounter in cache
 *
 * @param {Encounter} encounter
 */
VisitorEncountersCache.insertEncounter = function(encounter) {
  if (VisitorEncountersCache.encounterIdSet[encounter._id] !== undefined) return; // already inserted
  VisitorEncountersCache.encounterIdSet[encounter._id] = true;

  var vid = encounter.visitorId;
  if (VisitorEncountersCache.data[vid] === undefined) {
    VisitorEncountersCache.data[vid] = [];
  } 

  // The array should be sorted by enteredAt, so insert it in the correct position
  // Theoretically, this procedure is O(N).
  // However in practice, encounters of the same visitor should arrive in order, so it should be close to, if not equal to, O(1)
  var index = VisitorEncountersCache.data[vid].length;
  while (index > 0 && VisitorEncountersCache.data[vid][index-1].enteredAt.isAfter(encounter.enteredAt)) {
    index--;
  }
  for (var i = VisitorEncountersCache.data[vid].length-1; i >= index; i--) {
    VisitorEncountersCache.data[vid][i+1] = VisitorEncountersCache.data[vid][i];
  }
  VisitorEncountersCache.data[vid][index] = encounter;
}

/*
 * Return matched encounters of a list of visitors, given the time range
 *
 * @param {Number[]} visitorIds List of visitor id
 * @param {Moment} from  Inclusive from time
 * @param {Moment} to Exclusive to time
 *
 * @result {Encounters[]} List of encounters
 */
VisitorEncountersCache.getMultipleVisitorEncounters = function(visitorIds, from, to) {
  var result = [];
  _.each(visitorIds, function(vid) {
    result.push(VisitorEncountersCache.getSingleVisitorEncounters(vid, from, to));
  });
  result = _.flatten(result);
  return result;
} 

/*
 * Return matched encounters of a particular visitor, given the time range
 *
 * @param {Number} vid
 * @param {Moment} from  Inclusive from time
 * @param {Moment} to Exclusive to time
 *
 * @return {Encounter[]} List of encounters
 */
VisitorEncountersCache.getSingleVisitorEncounters = function(vid, from, to) {
  if (VisitorEncountersCache.data[vid] === undefined) return [];
  var vEncounters = VisitorEncountersCache.data[vid];

  // Binary Search start position 
  var l = 0;
  var r = vEncounters.length;
  while (l < r) {
    var m = Math.floor((l + r) / 2);
    if (vEncounters[m].enteredAt.isBefore(from)) {
      l = m + 1;
    } else {
      r = m;
    } 
  }
  var startPos = l;

  // Binary Search end position
  var l = -1;
  var r = vEncounters.length - 1;
  while (l < r) {
    var m = Math.floor((l + r + 1) / 2);
    if (vEncounters[m].enteredAt.isBefore(to)) {
      l = m;
    } else {
      r = m - 1;
    }
  }
  var endPos = l;

  var result = [];
  for (var i = startPos; i <= endPos; i++) {
    result.push(vEncounters[i]);
  } 

  return result;
}

var updateEncounter = function(encounter) {
  if (!encounter.isClosed()) return;
  VisitorEncountersCache.insertEncounter(encounter);
}

/**
 * Meteor Startup routine - observe encounters, and put them in cache
 */
VisitorEncountersCache.startup = function () {
  Encounters.find().observe({
    "added": function(encounter) {updateEncounter(encounter)},
    "changed": function(encounter, oldEncounter) {updateEncounter(encounter)},
  });
  console.info("[VisitorEncountersCache] startup complete");
};
