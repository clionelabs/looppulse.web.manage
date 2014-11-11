SegmentListController = RouteController.extend({
  template: 'segmentList',
  waitOn: function () {
    ensureCurrentCompanyIdInSession();

    var companyId = Session.get('currentCompanyId');

    //TODO switch to this.params
    var from = DateHelper.getSevenDaysAgoTimestamp();
    var to = null;

    // TODO subscribe companies data in a common place?
    return [
      Meteor.subscribe('companies'),
      Meteor.subscribe('companySegments', companyId),
      Meteor.subscribe('segmentListMetrics', from, to)
    ];
  },
  onBeforeAction: function (pause) {
    AccountsHelper.signInAsAdmin(this, pause);
  },
  data: function () {
    var companyId = Session.get('currentCompanyId');
    var segments = Segments.find({companyId : companyId}).fetch();
    var segmentMetrics = Metrics.find().fetch();

    var segmentResult = _.map(segmentMetrics, function(segmentMetric) {

      var segmentId = segmentMetric.collectionMeta.id;
      var segmentRelated = _.where(segments, { _id : segmentId})[0];
      return _.extend(segmentMetric, { name : segmentRelated.name});
    });

    return _.extend({}, getCompanyHeaderData(), {
      companyId: companyId,
      segments: segmentResult
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
    if (!this.params.query.from) {
      this.params.query.from = DateHelper.getSevenDaysAgoTimestamp()
    }
    var from = this.params.query.from;
    var to = this.params.query.to;

    return [
      Meteor.subscribe('companies'),
      Meteor.subscribe('companySegments', companyId),
      Meteor.subscribe('segmentMetrics', from , to, segmentId)
    ];
  },
  onBeforeAction: function (pause) {
    AccountsHelper.signInAsAdmin(this, pause);
  },

  data: function () {

    var data = {};

    var self = this;
    if (self.ready()) {
      var segment = Segments.findOne({_id : self.params.segmentId});
      var listMetric = Metrics.findOne({graphType: SegmentMetric.Graph.List});
      var dateXNumberOfVisitorsBarChart = Metrics.findOne({graphType: SegmentMetric.Graph.DayXNumOfVisitorLineChart});
      var percentageOtherSegmentChart = Metrics.findOne({graphType: SegmentMetric.Graph.VisitorOtherSegmentsBarChart});
      var averageDwellTimeXNumberOfVisitorsChart = Metrics.findOne({graphType: SegmentMetric.Graph.AverageDwellTimeBucketXNumOfVisitorHistogram});
      var averageDwellTimePunchCard = Metrics.findOne({graphType: SegmentMetric.Graph.DwellTimePunchCard});
      var numberOfVisitsXNumberOfVisitorsBarChart = Metrics.findOne({graphType: SegmentMetric.Graph.NumberOfVisitXNumberOfVisitorsBarChart});
      var enteredAtPunchCard = Metrics.findOne({graphType: SegmentMetric.Graph.EnteredAtPunchCard});
      var exitedAtPunchCard = Metrics.findOne({graphType: SegmentMetric.Graph.ExitedAtPunchCard});

      data = {
        from: this.params.query.from,
        to: this.params.query.to ? this.params.query.to : moment().valueOf(),
        segmentId: segment._id,
        name: segment.name,
        criteria: segment.criteria,
        list: listMetric.data,
        dateXNumberOfVisitorsBarChart: dateXNumberOfVisitorsBarChart.data,
        percentageOtherSegmentChart : percentageOtherSegmentChart.data,
		averageDwellTimeXNumberOfVisitorsChart : averageDwellTimeXNumberOfVisitorsChart.data,
        averageDwellTimePunchCard: averageDwellTimePunchCard.data,
        numberOfVisitsXNumberOfVisitorsBarChart : numberOfVisitsXNumberOfVisitorsBarChart.data,
        enteredAtPunchCard: enteredAtPunchCard.data,
        exitedAtPunchCard: exitedAtPunchCard.data
      };
      return _.extend({}, getCompanyHeaderData(), data);
    }


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
  return {
    company: company
  }
};
