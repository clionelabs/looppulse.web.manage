SegmentVisitorFlows = new Meteor.Collection("segment_visitor_flows", {
  transform: function (doc) {
    return new SegmentVisitorFlow(doc);
  }
});

/**
 *
 * @param doc
 * @constructor
 *
 * @property segmentId
 * @property visitorId
 * @property deltaAt
 * @property delta
 */
SegmentVisitorFlow = function (doc) {
  _.extend(this, doc);
};
