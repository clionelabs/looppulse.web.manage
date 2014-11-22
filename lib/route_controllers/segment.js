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
      var locationOperatingTime = Locations.findOne().operatingTime;

      // Construct graph data
      var graphListData = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.List})).data;
      var graphVisitorsXDatesData = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.VisitorsXDates})).data;
      var graphVisitorsXDwellData = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.VisitorsXDwell})).data;
      var graphVisitorsXVisitsData = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.VisitorsXVisits})).data;
      var graphDistributionDwellEnterData = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.DistributionDwellEnter})).data;
      var graphDistributionVisitsEnterData = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.DistributionVisitsEnter})).data;
      var graphDistributionVisitsExitData = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.DistributionVisitsExit})).data;
      var graphTopLocationsVisitorsData = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.TopLocationsVisitors})).data;
      var graphTopLocationsDwellData = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.TopLocationsDwell})).data;
      var graphTopLocationsVisitsData = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.TopLocationsVisits})).data;
      var graphOtherSegmentsData = Metrics.findOne(_.extend({}, selector, {graphType: SegmentMetric.Graph.OtherSegments})).data;

      // Transform otherSegments graph to more template-friendly
      var graphOtherSegmentsData = {
        header: {col1: "Segments", col2: "Percentage"},
        items: _.map(graphOtherSegmentsData, function(item) {
          return {col1: item.segmentName, col2: FormatHelper.formatPercent(item.percent), barWidth: FormatHelper.formatPercent(item.percent)}
        })
      };

      // Transform topLocations graph to more template-friendly
      var maxItems = 10;
      var max = _.reduce(graphTopLocationsVisitorsData, function(memo, item) {
        return memo + item.count;
      }, 0);
      graphTopLocationsVisitorsData = graphTopLocationsVisitorsData.slice(0, maxItems);
      graphTopLocationsVisitorsData = {
        header: {col1: "Locations", col2: "Count"},
        items: _.map(graphTopLocationsVisitorsData, function(item) {
          return {col1: item.installationName, col2: item.count, barWidth: FormatHelper.formatPercent(item.count/max)}
        })
      };

      var max = _.reduce(graphTopLocationsDwellData, function(memo, item) {
        return memo + item.duration;
      }, 0);
      graphTopLocationsDwellData = graphTopLocationsDwellData.slice(0, maxItems);
      graphTopLocationsDwellData = {
        header: {col1: "Locations", col2: "Duration"},
        items: _.map(graphTopLocationsDwellData, function(item) {
          return {col1: item.installationName, col2: FormatHelper.formatDurationToMin(item.duration), barWidth: FormatHelper.formatPercent(item.duration/max)}
        })
      };

      var max = _.reduce(graphTopLocationsVisitsData, function(memo, item) {
        return memo + item.count;
      }, 0);
      graphTopLocationsVisitsData = graphTopLocationsVisitsData.slice(0, maxItems);
      graphTopLocationsVisitsData = {
        header: {col1: "Locations", col2: "Count"},
        items: _.map(graphTopLocationsVisitsData, function(item) {
          return {col1: item.installationName, col2: item.count, barWidth: FormatHelper.formatPercent(item.count/max)}
        })
      };

      var graphData = {
        graphListData: graphListData,
        graphVisitorsXDatesData: graphVisitorsXDatesData,
        graphVisitorsXDwellData: graphVisitorsXDwellData,
        graphVisitorsXVisitsData: graphVisitorsXVisitsData,
        graphDistributionDwellEnterData: graphDistributionDwellEnterData,
        graphDistributionVisitsEnterData: graphDistributionVisitsEnterData,
        graphDistributionVisitsExitData: graphDistributionVisitsExitData,
        graphTopLocationsVisitorsData: graphTopLocationsVisitorsData,
        graphTopLocationsDwellData: graphTopLocationsDwellData,
        graphTopLocationsVisitsData: graphTopLocationsVisitsData,
        graphOtherSegmentsData: graphOtherSegmentsData
      };

      _.extend(data, {
        segmentId: segment._id,
        name: segment.name,
        criteria: segment.criteria,
        isDeletable: !segment.isEveryVisitor(),
        operatingTime: locationOperatingTime
      });
      _.extend(data, graphData);
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
