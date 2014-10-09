SegmentListController = RouteController.extend({
  template: 'segmentList',
  waitOn: function () {
    ensureCurrentCompanyIdInSession();

    var companyId = Session.get('currentCompanyId');
    var segmentIds = Segments.find({ companyId: companyId }).map(function (segment) {
      return segment._id;
    });

    // TODO subscribe companies data in a common place?
    return [
      Meteor.subscribe('companies'),
      Meteor.subscribe('companySegments', companyId),
      Meteor.subscribe('segmentsMetrics', segmentIds)
    ];
  },
  onBeforeAction: function (pause) {
    AccountsHelper.signInAsAdmin(this, pause);
  },
  data: function () {
    var companyId = Session.get('currentCompanyId');
    var segments = Segments.find({ companyId: companyId }).map(function (segment) {
      var segmentMetric = SegmentMetrics.findOneBySegment(segment._id);
      return {
        _id: segment._id,
        name: segment.name,
        visitorCount: segmentMetric.visitorCount,
        dwellTimeAverage: segmentMetric.getDwellTimeAverage(),
        repeatedVisitPercentage: segmentMetric.repeatedVisitPercentage
      }
    });
    return _.extend({}, getCompanyHeaderData(), {
      companyId: companyId,
      segments: segments
    });
  }
});

SegmentCreateController = RouteController.extend({
  template: 'segmentCreate',
  waitOn: function () {
    ensureCurrentCompanyIdInSession();

    var companyId = Session.get('currentCompanyId');

    return [
      Meteor.subscribe('companies'),
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

    return _.extend({}, getCompanyHeaderData(), {
      companyId: companyId,
      locations: Locations.find({ companyId: companyId })
    })
  }
});

SegmentDetailController = RouteController.extend({
  template: 'segmentDetail',
  waitOn: function () {
    var segmentId = this.params.segmentId;

    ensureCurrentCompanyIdInSession();

    var companyId = Session.get('currentCompanyId');

    return [
      Meteor.subscribe('companies'),
      Meteor.subscribe('companySegments', companyId),
      Meteor.subscribe('segmentMetrics', segmentId, 7)
    ];
  },
  onBeforeAction: function (pause) {
    AccountsHelper.signInAsAdmin(this, pause);
  },
  data: function () {
    var self = this;

    var data = {};
    if (self.ready()) {
      var segment = Segments.findOne(self.params.segmentId);
      var segmentMetric = SegmentMetrics.findOneBySegment(segment._id);
      data = {
        name: segment.name,
        visitorCount: segmentMetric.visitorCount,
        dwellTimeAverage: segmentMetric.getDwellTimeAverage(),
        repeatedVisitPercentage: segmentMetric.repeatedVisitPercentage,
        changePercentages: segmentMetric.getChangePercentagesSince(7)
      };
    }

    return _.extend({}, getCompanyHeaderData(), data);
  }
});

// TODO find better way to select default company
var ensureCurrentCompanyIdInSession = function () {
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
};

var getCompanyHeaderData = function () {
  var companyId = Session.get('currentCompanyId');
  var company = Companies.findOne(companyId);
  var hasMoreThanOneCompany = Companies.find().count() > 1;
  return {
    company: company,
    companies: Companies.find(),
    hasMoreThanOneCompany: hasMoreThanOneCompany
  }
};
