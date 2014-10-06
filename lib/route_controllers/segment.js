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

SegmentCreateController = RouteController.extend({
  template: 'segmentCreate',
  waitOn: function () {
    var self = this;
    var companyId = self.params.companyId;

    return [
      Meteor.subscribe('companyCategories', companyId),
      Meteor.subscribe('companyLocations', companyId),
      Meteor.subscribe('companyProducts', companyId)
    ];
  },
  onBeforeAction: function (pause) {
    var self = this;

    AccountsHelper.signInAsAdmin(self, pause);

    if (!self.params.companyId) {
      Router.go('segment.list');
    }

    if (self.data()) {
      var locationIds = self.data().locations.map(function (location) {
        return location._id;
      });
      self.subscribe('locationsFloors', locationIds).wait();
    }
  },
  data: function () {
    var self = this;
    var companyId = self.params.companyId;

    return {
      companyId: companyId,
      locations: Locations.find({ companyId: companyId })
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
