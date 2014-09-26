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
