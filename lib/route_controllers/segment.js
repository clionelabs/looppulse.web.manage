SegmentListController = RouteController.extend({
  template: 'segmentList',
  waitOn: function () {
    return [
      Meteor.subscribe('segments'),
      Meteor.subscribe('segmentMetrics')
    ];
  },
	onBeforeAction: function(pause) {
		AccountsHelper.signInAsAdmin(this, pause);	
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
	onBeforeAction: function(pause) {
		AccountsHelper.signInAsAdmin(this, pause);	
	},
  data: function () {
    return {
      segment: Segments.findOne(this.params.segmentId)
    }
  }
});

