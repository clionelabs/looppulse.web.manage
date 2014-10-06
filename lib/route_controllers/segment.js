SegmentListController = RouteController.extend({
  template: 'segmentList',
  waitOn: function () {
    return [
      Meteor.subscribe('segments'),
      Meteor.subscribe('segmentMetrics')
    ];
  },
  data: function () {
    var segments = Segments.find().map(function (segment) {
      var segmentMetric = SegmentMetrics.findOneBySegment(segment._id);
      return {
        name: segment.name,
        visitCount: segmentMetric.visitCount,
        dwellTime: segmentMetric.dwellTime
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
