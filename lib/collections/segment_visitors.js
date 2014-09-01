SegmentVisitors = new Meteor.Collection("segment_visitors", {
  transform: function(doc) {
    return new SegmentVisitor(doc);
  }
});

/**
 *
 * @param doc
 * @constructor
 *
 * @property segmentId
 * @property visitorId
 */
SegmentVisitor = function(doc) {
  _.extend(this, doc);
};

SegmentVisitor.startup = function() {
  Encounters.find().observe({
    _suppress_initial: true,
    "added": handleEncounterAdded,
    "changed": handleEncounterChanged
  });
};

var handleEncounterAdded = function(encounter) {
  updateSegmentVisitors(encounter);
  Engagement.dispatch(encounter);
};

var handleEncounterChanged = function(encounter, oldEncounter) {
  updateSegmentVisitors(encounter);
  Engagement.dispatch(encounter);
};

var updateSegmentVisitors = function(encounter) {
  SegmentVisitors.find({
    visitorId: encounter.visitorId
  }).map(function(segmentVisitor) {
    var segment = Segments.findOne(segmentVisitor.segmentId);
    if (!segment.match(encounter)) {
      SegmentVisitors.remove(segmentVisitor._id);
    }
  });

  Segments.find().map(function(segment) {
    if (segment.match(encounter)) {
      SegmentVisitors.upsert({
        segmentId: segment._id,
        visitorId: encounter.visitorId
      }, {});
    }
  });
};
