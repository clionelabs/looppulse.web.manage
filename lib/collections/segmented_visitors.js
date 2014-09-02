SegmentedVisitors = new Meteor.Collection("segmented_visitors", {
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
 * @property encounterId  - for {@link Engagement} comsumption
 */
SegmentVisitor = function(doc) {
  _.extend(this, doc);
};

SegmentVisitor.startup = function() {
  Encounters.findClosed().observe({
    _suppress_initial: true,
    "added": handleClosedEncounterAdded
  });
};

var handleClosedEncounterAdded = function(encounter) {
  SegmentedVisitors.find({
    visitorId: encounter.visitorId
  }).map(function(segmentVisitor) {
    var segment = Segments.findOne(segmentVisitor.segmentId);
    if (!segment.match(encounter)) {
      SegmentedVisitors.remove(segmentVisitor._id);
    }
  });

  Segments.find().map(function(segment) {
    if (segment.match(encounter)) {
      SegmentedVisitors.upsert({
        segmentId: segment._id,
        visitorId: encounter.visitorId
      }, {
        $set: { encounterId: encounter._id }
      });
    }
  });
};
