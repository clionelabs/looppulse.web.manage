var recomputeSegmentVisitorStatus = function(segment, visitor) {
  var matcher = new SegmentVisitorMatcher(segment, visitor);
  var statusDelta = matcher.match();
  var selector = {
    segmentId: segment._id,
    visitorId: visitor._id
  };
  console.log('[SegmentVisitor] recompute', selector, statusDelta);
  if (statusDelta.length === 1 && statusDelta[0].delta === -1) {
    SegmentVisitors.remove(selector);
  } else {
    var modifier = {
      $set: {statusDelta: statusDelta, lastUpdated: lodash.now()}
    };
    SegmentVisitors.upsert(selector, modifier);    
  }
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

SegmentVisitor.startup = function () {
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
