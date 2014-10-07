SegmentListController = RouteController.extend({
  template: 'segmentList',
  waitOn: function () {
    Tracker.autorun(function (computation) {
      if (Session.get('currentCompanyId')) {
        computation.stop();
        return;
      }

      var company = Companies.findOne({});
      if (!company) {
        return;
      }

      Session.set('currentCompanyId', company._id);
      computation.stop();
    });

    var companyId = Session.get('currentCompanyId');
    var segmentIds = Segments.find({ companyId: companyId }).map(function (segment) {
      return segment._id;
    });

    return [
      Meteor.subscribe('companies'),
      Meteor.subscribe('companySegments', companyId),
      Meteor.subscribe('segmentMetrics', segmentIds)
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
    var companyId = Session.get('currentCompanyId');
    var company = Companies.findOne(companyId);
    return {
      companyId: companyId,
      company: company,
      segments: segments
    }
  }
});

SegmentCreateController = RouteController.extend({
  template: 'segmentCreate',
  waitOn: function () {
    var companyId = Session.get('currentCompanyId');

    return [
      Meteor.subscribe('companyCategories', companyId),
      Meteor.subscribe('companyLocations', companyId),
      Meteor.subscribe('companyProducts', companyId)
    ];
  },
  onBeforeAction: function (pause) {
    var self = this;

    AccountsHelper.signInAsAdmin(self, pause);

    if (self.data()) {
      var locationIds = self.data().locations.map(function (location) {
        return location._id;
      });
      self.subscribe('locationsFloors', locationIds).wait();
    }
  },
  data: function () {
    var companyId = Session.get('currentCompanyId');

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
