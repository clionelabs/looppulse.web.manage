SegmentListController = RouteController.extend({
  template: 'segmentList',
  waitOn: function () {
    return [
      Meteor.subscribe('segments'),
      Meteor.subscribe('segmentMetrics')
    ];
  },
  data: function () {
    var segments = Segments.find({}, {
      transform: function (doc) {
        var segmentMetric = SegmentMetrics.findOneBySegment(doc._id);
        return {
          name: doc.name,
          visitCount: segmentMetric.visitCount,
          dwellTime: segmentMetric.dwellTime
        }
      }
    });
    return {
      segments: segments
    }
  }
});

SegmentDetailController = RouteController.extend({
  template: 'segmentDetail',
  waitOn: function () {
    return Meteor.subscribe('segments');
  },
  data: function () {
    return {
      segment: Segments.findOne(this.params.segmentId)
    }
  }
});
