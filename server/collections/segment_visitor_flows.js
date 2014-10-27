/**
 * recompute segment-visitor in/out events starting from now into the future
 * It does the followings:
 *   1) compute the current in/out status, and all future changes
 *   2) remove all existing future changes in DB (which are computed since last time)
 *   3) insert the current in/out status and future changes into DB.
 *
 * SegmentVisitorFlow collections should contain "all" in/out events for any pairs of
 * segment and visitor from past into future, given the received encounters so far. 
 * The SegmentVisitorFlow collections are updated whenever relevant encounters are received.
 */
var recomputeSegmentVisitorStatus = function(segment, visitor) {
  var matcher = new SegmentVisitorMatcher(segment, visitor);
  var statusDelta = matcher.computeCurrentStatus();
  var selector = {
    segmentId: segment._id,
    visitorId: visitor._id
  };

  if (statusDelta.length === 0) return; // Not supposed to be 0 though. Just to be safe.

  // remove all existing future events
  SegmentVisitorFlows.remove(_.extend({}, selector, {time: {$gte: statusDelta[0].time}}));

  var lastFlow = SegmentVisitorFlows.findOne(selector, {sort: {time: -1}});
  var lastDelta = lastFlow === undefined? 0: lastFlow.delta;
  _.each(statusDelta, function(flow) {
    if (flow.delta !== lastDelta) {
      SegmentVisitorFlows.insert(_.extend(selector, flow));
      lastDelta = flow.delta;
    }
  });

  console.log('[SegmentVisitorFLow] Segment visitor list: ', segment._id, segment.getVisitorIdList(lodash.now()));
  console.log('[SegmentVisitorFlow] Visitor segment list: ', visitor._id, visitor.getSegmentIdList(lodash.now()));
};

var recomputeVisitorStatus = function(visitor) {
  Segments.find().map(function(segment) {
    recomputeSegmentVisitorStatus(segment, visitor);
  });
}

var recomputeEncounterVisitorStatus = function(encounter) {
  var visitor = Visitors.findOne({_id: encounter.visitorId});
  Segments.find().map(function(segment) {
    var matcher = new SegmentVisitorMatcher(segment, visitor);
    var isRelevant = matcher.checkEncounterIsRelevant(encounter);
    // console.log("[SegmentVisitorFlow] isRelevant", encounter, segment, isRelevant);
    // TODO: remove the "true" below to only recompute relevant segment.
    if (true || isRelevant) {
      recomputeSegmentVisitorStatus(segment, visitor);
    } 
  });
}

var handleSegmentAdded = function(segment) {
  Visitors.find().map(function(visitor) {
    recomputeSegmentVisitorStatus(segment, visitor);
  });
};

var handleVisitorAdded = function(visitor) {
  recomputeVisitorStatus(visitor);
};

var handleEncounterAdded = function(encounter) {
  recomputeEncounterVisitorStatus(encounter);
};

var handleEncounterChanged = function(encounter, oldEncounter) {
  recomputeEncounterVisitorStatus(encounter);
};

SegmentVisitorFlow.ensureIndex = function () {
  SegmentVisitorFlows._ensureIndex({
    segmentId: 1,
    visitorId: 1,
    time: 1
  });
};

SegmentVisitorFlow.startup = function () {
  Visitors.find().observe({
    _suppress_initial: true,
    "added": handleVisitorAdded
  });
  Encounters.find().observe({
    _suppress_initial: true,
    "added": handleEncounterAdded,
    "changed": handleEncounterChanged
  });
  Segments.find().observe({
    _suppress_initial: true,
    "added": handleSegmentAdded
  });
};
