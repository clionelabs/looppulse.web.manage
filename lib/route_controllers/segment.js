SegmentListController = RouteController.extend({
  template: 'segmentList',
  waitOn: function () {

    ensureCurrentCompanyIdInSession();

    var companyId = Session.get('currentCompanyId');

    var from = DateHelper.getFromTimestampFromSession();
    var to = DateHelper.getToTimestampFromSession();
    this.from = from;
    this.to = to;
    return [
      Meteor.subscribe('companies'),
      Meteor.subscribe('companySegments', companyId),
      Meteor.subscribe('listSegmentGraphs', from, to)
    ];
  },
  onBeforeAction: function (pause) {
    AccountsHelper.signInAsAdmin(this, pause);
  },
  onStop: function(){
    console.log("clearing timer", this.pollingTimer)
    Meteor.clearInterval(this.pollingTimer)
  },
  action: function () {
    var self = this;
    if (this.ready()) {
      var polling = function(){
        console.log("Re-calculating List...");
        Meteor.call("genSegmentListData", self.from, self.to, function(err, res){
          if (err) {
            console.log("Segment List Error",err);
          }
        });
      }
      this.pollingTimer = Meteor.setInterval(polling, 30*1000)
      console.log("setup timer", this.pollingTimer)
      polling();
      this.render();
    } else {
      this.render('Loading');
    }
  },
  data: function () {

    var self = this;

    if (self.ready()) {

      var companyId = Session.get('currentCompanyId');
      var segmentGraphs = SegmentGraphs.find().fetch();

      return _.extend({}, getCompanyHeaderData(), {
        companyId: companyId,
        segmentGraphs: segmentGraphs,
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
    return [
      Meteor.subscribe('companies'),
      Meteor.subscribe('companySegments', companyId),
      Meteor.subscribe('companyLocations', companyId),
      Meteor.subscribe('segmentGraphs', from , to, segmentId)
    ];
  },
  onBeforeAction: function (pause) {
    AccountsHelper.signInAsAdmin(this, pause);
  },

  onStop: function(){
    console.log("clearing timer", this.pollingTimer)
    Meteor.clearInterval(this.pollingTimer)
  },
  action: function () {
    var self = this;
    var segmentId = this.params.segmentId;
    if (this.ready()) {
      var polling = function(){
        console.log("Re-calculating Graph...");
        Meteor.call("genSegmentData", segmentId, self.from, self.to, function(err, res){
          if (err) {
            console.log("Segment Graph Error",err);
          }
        });
      }
      this.pollingTimer = Meteor.setInterval(polling, 30*1000)
      console.log("setup timer", this.pollingTimer)
      polling();
      this.render();
    } else {
      this.render('Loading');
    }
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
      var graphListData = SegmentGraphs.findOne(_.extend({}, selector, {graphType: SegmentGraphBase.Graph.List}));
      var graphVisitorsXDatesData = SegmentGraphs.findOne(_.extend({}, selector, {graphType: SegmentGraphBase.Graph.VisitorsXDates}));
      var graphVisitorsXDwellData = SegmentGraphs.findOne(_.extend({}, selector, {graphType: SegmentGraphBase.Graph.VisitorsXDwell}));
      var graphVisitorsXVisitsData = SegmentGraphs.findOne(_.extend({}, selector, {graphType: SegmentGraphBase.Graph.VisitorsXVisits}));
      var graphDistributionDwellEnterData = SegmentGraphs.findOne(_.extend({}, selector, {graphType: SegmentGraphBase.Graph.DistributionDwellEnter}));
      var graphDistributionVisitsEnterData = SegmentGraphs.findOne(_.extend({}, selector, {graphType: SegmentGraphBase.Graph.DistributionVisitsEnter}));
      var graphDistributionVisitsExitData = SegmentGraphs.findOne(_.extend({}, selector, {graphType: SegmentGraphBase.Graph.DistributionVisitsExit}));
      var graphTopLocationsVisitorsData = SegmentGraphs.findOne(_.extend({}, selector, {graphType: SegmentGraphBase.Graph.TopLocationsVisitors}));
      var graphTopLocationsDwellData = SegmentGraphs.findOne(_.extend({}, selector, {graphType: SegmentGraphBase.Graph.TopLocationsDwell}));
      var graphTopLocationsVisitsData = SegmentGraphs.findOne(_.extend({}, selector, {graphType: SegmentGraphBase.Graph.TopLocationsVisits}));
      var graphOtherSegmentsData = SegmentGraphs.findOne(_.extend({}, selector, {graphType: SegmentGraphBase.Graph.OtherSegments}));


      var graphData = {
        graphListData: graphListData ? graphListData.data : null,
        graphVisitorsXDatesData: graphVisitorsXDatesData ? graphVisitorsXDatesData.data : null,
        graphVisitorsXDwellData: graphVisitorsXDwellData ? graphVisitorsXDwellData.data : null,
        graphVisitorsXVisitsData: graphVisitorsXVisitsData ? graphVisitorsXVisitsData.data : null,
        graphDistributionDwellEnterData: graphDistributionDwellEnterData ? graphDistributionDwellEnterData.data : null,
        graphDistributionVisitsEnterData: graphDistributionVisitsEnterData ? graphDistributionVisitsEnterData.data : null,
        graphDistributionVisitsExitData: graphDistributionVisitsExitData ? graphDistributionVisitsExitData.data : null,
        graphTopLocationsVisitorsData: graphTopLocationsVisitorsData ? graphTopLocationsDwellData.data : null,
        graphTopLocationsDwellData: graphTopLocationsDwellData ? graphTopLocationsDwellData.data : null,
        graphTopLocationsVisitsData: graphTopLocationsVisitsData ? graphTopLocationsVisitsData.data : null,
        graphOtherSegmentsData: graphOtherSegmentsData ? graphOtherSegmentsData.data : null
      };

      // Transform otherSegments graph to more template-friendly
      if (graphData.graphOtherSegmentsData) {
        graphData.graphOtherSegmentsData = {
          header: {col1: "Segments", col2: "Percentage"},
          items: _.map(graphData.graphOtherSegmentsData, function (item) {
            return {
              col1: item.segmentName,
              col2: FormatHelper.formatPercent(item.percent),
              barWidth: FormatHelper.formatPercent(item.percent)
            }
          })
        };
      }

      var maxItems = 10;

      // Transform topLocations graph to more template-friendly
      if (graphData.graphTopLocationsVisitorsData) {

        var max = _.reduce(graphData.graphTopLocationsVisitorsData, function (memo, item) {
          return memo + item.count;
        }, 0);
        graphData.graphTopLocationsVisitorsData = graphData.graphTopLocationsVisitorsData.slice(0, maxItems);
        graphData.graphTopLocationsVisitorsData = {
          header: {col1: "Locations", col2: "Count"},
          items: _.map(graphData.graphTopLocationsVisitorsData, function (item) {
            return {
              col1: item.installationName,
              col2: item.count,
              barWidth: FormatHelper.formatPercent(item.count / max)
            }
          })
        };
      }

      if (graphData.graphTopLocationsDwellData) {
        var max = _.reduce(graphData.graphTopLocationsDwellData, function (memo, item) {
          return memo + item.duration;
        }, 0);
        graphData.graphTopLocationsDwellData = graphData.graphTopLocationsDwellData.slice(0, maxItems);
        graphData.graphTopLocationsDwellData = {
          header: {col1: "Locations", col2: "Duration"},
          items: _.map(graphData.graphTopLocationsDwellData, function (item) {
            return {
              col1: item.installationName,
              col2: FormatHelper.formatDurationToMin(item.duration),
              barWidth: FormatHelper.formatPercent(item.duration / max)
            }
          })
        };
      }

      if (graphData.graphTopLocationsVisitsData) {
        var max = _.reduce(graphData.graphTopLocationsVisitsData, function (memo, item) {
          return memo + item.count;
        }, 0);
        graphData.graphTopLocationsVisitsData = graphData.graphTopLocationsVisitsData.slice(0, maxItems);
        graphData.graphTopLocationsVisitsData = {
          header: {col1: "Locations", col2: "Count"},
          items: _.map(graphData.graphTopLocationsVisitsData, function (item) {
            return {
              col1: item.installationName,
              col2: item.count,
              barWidth: FormatHelper.formatPercent(item.count / max)
            }
          })
        };
      }


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

// TODO GH265
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
