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
  Segments.find().map(function(segment) {
    var selector = {
      segmentId: segment._id,
      visitorId: encounter.visitorId
    };
    if (segment.match(encounter.visitorId, encounter)) {
      SegmentVisitors.upsert(selector, { $setOnInsert: selector });
    } else {
      SegmentVisitors.remove(selector);
    }
  });
};
