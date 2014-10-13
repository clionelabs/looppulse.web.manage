SegmentVisitors.upsertBySelector = function (selector) {
  var modifier = {
    $setOnInsert: _.extend({}, selector, { createdAt: lodash.now() })
  };
  return SegmentVisitors.upsert(selector, modifier);
};

var handleEncounterAdded = function (encounter) {
  updateSegmentVisitors(encounter);
  Engagement.dispatch(encounter);
};

var handleEncounterChanged = function (encounter, oldEncounter) {
  updateSegmentVisitors(encounter);
  Engagement.dispatch(encounter);
};

var updateSegmentVisitors = function (encounter) {
  Segments.find().map(function (segment) {
    var selector = {
      segmentId: segment._id,
      visitorId: encounter.visitorId
    };
    if (segment.match(encounter.visitorId, encounter)) {
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
  Encounters.find().observe({
    _suppress_initial: true,
    "added": function(doc){
      Benchmark.time(
        function() { handleEncounterAdded(doc); },
        "[Benchmark] Encounters:added => handleEncounterAdded")},
    "changed": function(newDoc, oldDoc){
      Benchmark.time(
        function() { handleEncounterChanged(newDoc, oldDoc); },
        "[Benchmark] Encounters:changed => handleEncounterChanged")}
  });
  Segments.find().observe({
    _suppress_initial: true,
    "added": function(doc){
      Benchmark.time(
        function() { handleSegmentAdded(doc); },
        "[Benchmark] Segments:added => handleSegmentAdded")}
  });
};
