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
