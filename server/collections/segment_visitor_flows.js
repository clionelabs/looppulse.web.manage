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

  // console.log('[SegmentVisitorFLow] Segment visitor list: ', segment._id, segment.getVisitorIdList(lodash.now()));
};

var recomputeVisitorStatus = function(visitor) {
  Segments.find().map(function(segment) {
    recomputeSegmentVisitorStatus(segment, visitor);
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

//TODO: only need to recompute segments, whose criteria matched with the encounter.
var handleEncounterAdded = function(encounter) {
  recomputeVisitorStatus(Visitors.findOne({_id: encounter.visitorId}));
};

var handleEncounterChanged = function(encounter, oldEncounter) {
  recomputeVisitorStatus(Visitors.findOne({_id: encounter.visitorId}));
}

SegmentVisitor.ensureIndex = function () {
  SegmentVisitors._ensureIndex({
    segmentId: 1,
    visitorId: 1
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
