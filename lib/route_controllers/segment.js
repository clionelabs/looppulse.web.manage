SegmentListController = RouteController.extend({
  template: 'segmentList',
  waitOn: function () {
    return [
      Meteor.subscribe('segments'),
      Meteor.subscribe('segmentMetrics')
    ];
  },
  onBeforeAction: function (pause) {
    AccountsHelper.signInAsAdmin(this, pause);
  },
  data: function () {
    var segments = Segments.find().map(function (segment) {
      var segmentMetric = SegmentMetrics.findOneBySegment(segment._id);
      return {
        _id: segment._id,
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
  onBeforeAction: function (pause) {
    AccountsHelper.signInAsAdmin(this, pause);
  },
  data: function () {
    return {
      segment: Segments.findOne(this.params.segmentId)
    }
  }
});
