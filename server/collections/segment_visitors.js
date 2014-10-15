SegmentVisitors.upsertBySelector = function (selector) {
  var modifier = {
    $setOnInsert: _.extend({}, selector, { createdAt: lodash.now() })
  };
  return SegmentVisitors.upsert(selector, modifier);
};

var handleVisitorAdded = function (visitor) {
  updateSegmentVisitors(visitor._id);
};

var handleEncounterAdded = function (encounter) {
  updateSegmentVisitors(encounter.visitorId);
  // Engagement.dispatch(encounter);
};

var handleEncounterChanged = function (encounter, oldEncounter) {
  updateSegmentVisitors(encounter.visitorId);
  // Engagement.dispatch(encounter);
};

var updateSegmentVisitors = function (visitorId) {
  Segments.find().map(function (segment) {
    var selector = {
      segmentId: segment._id,
      visitorId: visitorId
    };
    if (segment.match(visitorId)) {
      SegmentVisitors.upsertBySelector(selector);
    } else {
      SegmentVisitors.remove(selector);
    }
  });
};

var handleSegmentAdded = function (segment) {
  Visitors.find().map(function (visitor) {
    var visitorId = visitor._id;
    var selector = {
      segmentId: segment._id,
      visitorId: visitorId
    };
    if (segment.match(visitorId)) {
      SegmentVisitors.upsertBySelector(selector);
    }
  });
};

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
