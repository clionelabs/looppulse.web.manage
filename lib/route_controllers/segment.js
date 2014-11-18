SegmentListController = RouteController.extend({
  template: 'segmentList',
  waitOn: function () {

    ensureCurrentCompanyIdInSession();

    var companyId = Session.get('currentCompanyId');

    var from = DateHelper.getFromTimestampFromSession();
    var to = DateHelper.getToTimestampFromSession();

    Meteor.call("genSegmentListData", from, to, function(err, res){
      if (err) {
        console.log(err);
      }
    });

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

    var self = this;

    if (self.ready()) {

      var companyId = Session.get('currentCompanyId');
      var segments = Segments.find({companyId: companyId}).fetch();
      var segmentMetrics = Metrics.find().fetch();
      console.log("companyId", companyId)

      var segmentResult = segmentMetrics.map(function (segmentMetric) {
        var segmentId = segmentMetric.collectionMeta.id;
        var relatedSegments = _.where(segments, {_id: segmentId});
        if (relatedSegments && relatedSegments.length > 0) {
          return _.extend(segmentMetric, {name: relatedSegments[0].name});
        } else {
          return segmentMetric
        }
      });

      return _.extend({}, getCompanyHeaderData(), {
        companyId: companyId,
        segments: segmentResult,
        from: DateHelper.getFromTimestampFromSession(),
        to: DateHelper.getToTimestampFromSession()
      });
    }
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
      Meteor.subscribe('companyProducts', companyId),
      Meteor.subscribe('companyLocationsFloors', companyId)
    ];
  },
  onBeforeAction: function (pause) {
    var self = this;
    AccountsHelper.signInAsAdmin(self, pause);
  },
  data: function () {
    var self = this;
    if (self.ready()) {
      var companyId = Session.get('currentCompanyId');

      return _.extend({}, getCompanyHeaderData(), {
        companyId: companyId,
        locations: Locations.find({companyId: companyId})
      });
    }
  }
});

SegmentDetailController = RouteController.extend({
  template: 'segmentDetail',
  waitOn: function () {
    var segmentId = this.params.segmentId;

    ensureCurrentCompanyIdInSession();

    var companyId = Session.get('currentCompanyId');

    var from = DateHelper.getFromTimestampFromSession();
    var to = DateHelper.getToTimestampFromSession();

    Meteor.call("genSegmentData", segmentId, from, to, function(err, res){
      if (err) {
        console.log(err);
      }
    });

    return [
      Meteor.subscribe('companies'),
      Meteor.subscribe('companySegments', companyId),
      Meteor.subscribe('companyLocations', companyId),
      Meteor.subscribe('segmentMetrics', from , to, segmentId)
    ];
  },
  onBeforeAction: function (pause) {
    AccountsHelper.signInAsAdmin(this, pause);
  },

  data: function () {

    var self = this;

    var data = {};
    data.from = DateHelper.getFromTimestampFromSession();
    data.to = DateHelper.getToTimestampFromSession();

    if (self.ready()) {
      var selector = {from : data.from, to : data.to};
      var segment = Segments.findOne({_id : self.params.segmentId});
      var listMetric = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.List}));
      var dateXNumberOfVisitorsBarChart = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.DayXNumOfVisitorLineChart}));
      var percentageOtherSegmentChart = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.VisitorOtherSegmentsBarChart}));
      var averageDwellTimeXNumberOfVisitorsChart = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.AverageDwellTimeBucketXNumOfVisitorHistogram}));
      var averageDwellTimePunchCard = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.DwellTimePunchCard}));
      var numberOfVisitsXNumberOfVisitorsBarChart = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.NumberOfVisitXNumberOfVisitorsBarChart}));
      var enteredAtPunchCard = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.EnteredAtPunchCard}));
      var exitedAtPunchCard = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.ExitedAtPunchCard}));
      var visitorTopLocationsBarChart = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.VisitorTopLocationsBarChart}));
      var dwellTimeTopLocationsBarChart = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.DwellTimeTopLocationsBarChart}));
      var numberOfVisitTopLocationsBarChart = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.NumberOfVisitTopLocationsBarChart}));

      var percentageOtherSegmentChartData = {
        header: {col1: "Segments", col2: "Percentage"},
        items: _.map(percentageOtherSegmentChart.data, function(item) {
          return {col1: item.segmentName, col2: FormatHelper.formatPercent(item.percent), barWidth: FormatHelper.formatPercent(item.percent)}
        })
      };

      var maxItems = 10;
      var max = _.reduce(visitorTopLocationsBarChart.data, function(memo, item) {
        return memo + item.count;
      }, 0);
      visitorTopLocationsBarChart.data = visitorTopLocationsBarChart.data.slice(0, maxItems);
      visitorTopLocationsBarChartData = {
        header: {col1: "Locations", col2: "Count"},
        items: _.map(visitorTopLocationsBarChart.data, function(item) {
          return {col1: item.installationName, col2: item.count, barWidth: FormatHelper.formatPercent(item.count/max)}
        })
      };

      var max = _.reduce(dwellTimeTopLocationsBarChart.data, function(memo, item) {
        return memo + item.duration;
      }, 0);
      dwellTimeTopLocationsBarChart.data = dwellTimeTopLocationsBarChart.data.slice(0, maxItems);
      dwellTimeTopLocationsBarChartData = {
        header: {col1: "Locations", col2: "Duration"},
        items: _.map(dwellTimeTopLocationsBarChart.data, function(item) {
          return {col1: item.installationName, col2: FormatHelper.formatDurationToMin(item.duration), barWidth: FormatHelper.formatPercent(item.duration/max)}
        })
      };

      var max = _.reduce(numberOfVisitTopLocationsBarChart.data, function(memo, item) {
        return memo + item.count;
      }, 0);
      numberOfVisitTopLocationsBarChart.data = numberOfVisitTopLocationsBarChart.data.slice(0, maxItems);
      numberOfVisitTopLocationsBarChartData = {
        header: {col1: "Locations", col2: "Count"},
        items: _.map(numberOfVisitTopLocationsBarChart.data, function(item) {
          return {col1: item.installationName, col2: item.count, barWidth: FormatHelper.formatPercent(item.count/max)}
        })
      };

      var locationOperatingTime = Locations.findOne().operatingTime;

      data = _.extend(data, {
        segmentId: segment._id,
        name: segment.name,
        criteria: segment.criteria,
        isDeletable: !segment.isEveryVisitor(),
        list: listMetric.data,
        dateXNumberOfVisitorsBarChart: dateXNumberOfVisitorsBarChart.data,
        percentageOtherSegmentChart : percentageOtherSegmentChartData,
        averageDwellTimeXNumberOfVisitorsChart : averageDwellTimeXNumberOfVisitorsChart.data,
        averageDwellTimePunchCard: averageDwellTimePunchCard.data,
        numberOfVisitsXNumberOfVisitorsBarChart : numberOfVisitsXNumberOfVisitorsBarChart.data,
        enteredAtPunchCard: enteredAtPunchCard.data,
        exitedAtPunchCard: exitedAtPunchCard.data,
        visitorTopLocationsBarChart: visitorTopLocationsBarChartData,
        dwellTimeTopLocationsBarChart: dwellTimeTopLocationsBarChartData,
        numberOfVisitTopLocationsBarChart: numberOfVisitTopLocationsBarChartData,
        operatingTime: locationOperatingTime
      });
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
