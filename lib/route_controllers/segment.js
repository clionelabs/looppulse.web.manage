SegmentListController = RouteController.extend({
  template: 'segmentList',
  waitOn: function () {
    return Meteor.subscribe('segments');
  },
  data: function () {
    return {
      segments: Segments.find()
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
