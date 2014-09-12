// Helpers

/**
  All helpers need to get something from db should go to here
  context: this = `Location`
*/
Template.dashboard_home.helpers({
  engagementMetrics: function(){
    console.log("Querying EngagementMetric in Location", this._id);
    return EngagementMetrics.find({ locationId: this._id });
  },
  productMetrics: function(){
    console.log("Querying ProductMetric in Location", this._id);
    return ProductMetrics.find({ locationId: this._id }).fetch();
  },
  locationMetric: function() {
    var locationId = Session.get("currentLocation") || this._id;
    return LocationMetrics.findOneForThisWeek({ locationId: locationId });
  },
  totalVisits: function(period){
    // this = with context = cursor
    /*
    var data = this || []; //(this.data) ? this.data.fetch() : ProductMetrics.find({ locationId: this._id }).fetch();
    var sum = 0;
    data.forEach(function(m){
      sum += (!isNaN(m.visitors.length)) ? m.visitors.length : 0;
      console.log(sum, m,  m.visitors.length)
    })
    return { number:sum, diff:"+10%", field:"Total Visits", duration:"1 week ago" }
    */

    var locationMetric = this;
    console.log(locationMetric)

    //check the sign
    var diff = locationMetric.visitPercentageChangeSinceLastWeek;

    return {
      number: locationMetric.visitCount,
      diff: locationMetric.visitPercentageChangeSinceLastWeek,
      field:"Total Visits",
      duration:"1 week ago"
    };
  },
  avgDwellTime: function(period){
    /*
    var data = this || []; //(this.data) ? this.data.fetch() : ProductMetrics.find({ locationId: this._id }).fetch();
    var sum = 0;
    data.forEach(function(m){
      var avg = 0;
      avg = (!isNaN(m.visitors.length)) ? m.dwellTime/m.visitors.length: 0;
      sum += Math.round(avg);
      console.log(avg, sum)
    })
    var time = (data.length > 0) ? ((sum/1000)/60)/data.length:0;
    time = (time).toFixed(1)
    return { number:time, unit:"min", diff:"-10%", field:"Avg Time", duration:"1 week ago" }
    */

    var locationMetric = this;

    return {
      number:locationMetric.dwellTimeAverageInMinutes(),
      unit:"min",
      diff: locationMetric.dwellTimeAveragePercentageChangeSinceLastWeek,
      field:"Avg Time",
      duration:"1 week ago"
    };
  },
  repeatedVisits: function(period){
    var locationMetric = this;

    return {
      number:locationMetric.repeatedVisitPercentage(),
      unit: "%",
      diff: locationMetric.repeatedVisitPercentageChangeSinceLastWeek,
      field:"Repeat Visits",
      duration:"1 week ago"
    }
  },
  performances: function(){
    //fit something reactive here should trigger the graph update.
    var locationId = Session.get("currentLocation");
    var data = FloorMetrics.findHourly({
      locationId: locationId,
      startTime: { $gte: MetricsHelper.nHoursAgoTruncatedTime(new Date(), 24) }
    }).map(function(floorMetric) {
      var floor = floorMetric.getFloor();
      var date = new Date(floorMetric.startTime);
      var visits = floorMetric.visitedCount;
      // FIXME d3 hate zeros
      visits = visits ? visits : 0.1;
      return {
        hour: date.getHours().toString(),
        floor: floor.name,
        visits: visits
      }
    });
    // FIXME remove dummy data
    return data ? data : [
      { hour: '1000', floor: '6/F', visits: 1000 },
      { hour: '1100', floor: '6/F', visits: 2000 },
      { hour: '1200', floor: '6/F', visits: 5000 },
      { hour: '1300', floor: '6/F', visits: 4000 },
      { hour: '1400', floor: '6/F', visits: 3000 },
      { hour: '1500', floor: '6/F', visits: 2000 },
      { hour: '1600', floor: '6/F', visits: 1000 },
      { hour: '1700', floor: '6/F', visits: 2000 },
      { hour: '1800', floor: '6/F', visits: 6000 },
      { hour: '1900', floor: '6/F', visits: 7000 },
      { hour: '2000', floor: '6/F', visits: 5000 },
      { hour: '2100', floor: '6/F', visits: 4000 },
      { hour: '1000', floor: '7/F', visits: 2000 },
      { hour: '1100', floor: '7/F', visits: 1000 },
      { hour: '1200', floor: '7/F', visits: 6000 },
      { hour: '1300', floor: '7/F', visits: 3000 },
      { hour: '1400', floor: '7/F', visits: 1000 },
      { hour: '1500', floor: '7/F', visits: 500  },
      { hour: '1600', floor: '7/F', visits: 1000 },
      { hour: '1700', floor: '7/F', visits: 2000 },
      { hour: '1800', floor: '7/F', visits: 7000 },
      { hour: '1900', floor: '7/F', visits: 4000 },
      { hour: '2000', floor: '7/F', visits: 3000 },
      { hour: '2100', floor: '7/F', visits: 1000 },
      { hour: '1000', floor: '8/F', visits: 3000 },
      { hour: '1100', floor: '8/F', visits: 2000 },
      { hour: '1200', floor: '8/F', visits: 5000 },
      { hour: '1300', floor: '8/F', visits: 3000 },
      { hour: '1400', floor: '8/F', visits: 2000 },
      { hour: '1500', floor: '8/F', visits: 1000 },
      { hour: '1600', floor: '8/F', visits: 2000 },
      { hour: '1700', floor: '8/F', visits: 3000 },
      { hour: '1800', floor: '8/F', visits: 4000 },
      { hour: '1900', floor: '8/F', visits: 6000 },
      { hour: '2000', floor: '8/F', visits: 3000 },
      { hour: '2100', floor: '8/F', visits: 2000 },
    ];
  },


  /**
  Extract the campaigns data from engagements
  @return Campaigns Data with object \{ _id, name, sent, visited, conversion \}
  **/
  campaigns: function(){
    var collection;

    //@@DEMO: return real stuff or dummy
    //@@WARNING: ORDER IMPORTANTED
    var campaigns = Engagements.find().map(function(engagement) {
      var metric = EngagementMetrics.findOne({ engagementId: engagement._id });
      return {
        _id: engagement._id,
        name: engagement.name,
        desc: engagement.description,
        sent: metric.sentMessageCount,
        viewed: metric.viewedMessageCount,
        visited: metric.visitedCount,
        conversion: metric.conversionRates().sentMessageToVisited,
        startTime: "", endTime: "", traceOffset: 100000
      };
    });

    if (campaigns.length === 0){
      return [
        { _id:"demo0001", name:"Elephant Parade", startTime: "", endTime: "", traceOffset: 100000, desc: "Visit the elephant on UG and a chance to win 2 movie tickets Engage customers when it’s Monday, Wednesday between 7pm to 9pm When they’re entering zone 107", sent:1000, viewed: 900, visited: 600, conversion: 0.6,viewConversion: 0.68  },
        { _id:"demo0002", name:"Super Weekend", startTime: "", endTime: "", traceOffset: 100000, desc: "Lucky Draw on purchase > $500", sent:1200, viewed: 800,  visited: 600, conversion: 0.5, viewConversion: 0.75 },
        { _id:"demo0003", name:"Summer Festival", startTime: "", endTime: "", traceOffset: 100000, desc: "10% off for everything", sent:2000, viewed: 1200, visited: 400, conversion: 0.2,  viewConversion: 0.33 }
      ]
    }
    return campaigns;
  }
});


Template.dashboard_card.helpers({
  setSign: function(diff){
    var sign = (diff > 0) ? "+" :
                                  (diff < 0) ? "-": "" ;
    var klass = ""; //class of expected result
    var sybmol = "";
    switch (sign){
      case "+":
        klass = "up";
        break;
      case "-":
        klass = "down";
        break;
      default:
        klass = "unchange";

    }
    //process the number before it reach the frontend
    return {
      klass: "arrow-"+klass,
      value: diff,
      unit: "%"
    }
  }
})


Template.dashboard_performance_chart.helpers({
  showChart: function(){
    return Session.get("view-chart")
  },
  showGrid: function(){
    return Session.get("view-grid")
  },
  showFloor: function(){
    return Session.get("view-building")
  },
  transform: function(){
    return { klass:"dashboard-performance-chart", data: this }
  }
});
Template.dashboard_performance_chart.events({
  "click .widget-nav a": function(e, tmpl){
    e.preventDefault();
    e.stopPropagation()
    var target = $(e.currentTarget)
    var prop = target.data("session-target")

    var active = $(".widget-nav li.active a",e.delegateTarget)
    var prev = active.data("session-target")

    Session.set(prev, false)
    Session.set(prop, true)

    active.parent().removeClass("active")
    target.parent().addClass("active")

    console.log("Change from", prev, " to ", prop, "Element ", active.parent(), " & ", target.parent())

    return false;
  }
})

// Autorun & Graph setup
Template.dashboard_performance_chart.created = function(){
  Session.set("view-chart", true)
  Session.set("view-grid", false)
  Session.set("view-building", false)
}
Template.dashboard_performance_chart.destroyed = function () {
  this.handle && this.handle.stop();
  //Clear Session
};

Template.dashboard_performance_charting.rendered = function(){
  var self = this;
  console.log("re-rendering",this)
  var chart = d4.charts.line()
    .outerWidth($('main .charting').width())
    .x(function(x){
      x.key('hour');
    })
    .y(function(y){
      y.key('visits');
    })
    .mixin({name : 'grid', feature : d4.features.grid, index: 0 });
  var parser = d4.parsers.nestedGroup()
      .x(function(){
        return 'hour';
      })
      .nestKey(function(){
        return 'floor';
      })
      .y(function(){
        return 'visits';
      })
      .value(function(){
        return 'visits';
      })

  self.handle =  Deps.autorun(function () {
    var data = self.data;
    var parsedData = parser(data);

    d3.select('main .charting')
    .datum(parsedData.data)
    .call(chart);
  })

}


Template.dashboard_performance_floor.helpers({
    datum: function(key) {
      // `key` = 'floor', should be appear in first column
      var locationId = Session.get("currentLocation");
      var data = FloorMetrics.find({ locationId: locationId }).map(function(floorMetric) {
        var floor = floorMetric.getFloor();
        return {
          floor: floor.name,
          totalVisits: floorMetric.visitCount,
          avgDwellTime: floorMetric.dwellTimeAverage,
          repeatedVisits: floorMetric.repeatedVisitCount
        }
      });
      // FIXME remove dummy data
      return data ? data : [
          { 'floor': "1/F", 'totalVisits': 9000, 'avgDwellTime': 30, 'repeatedVisits': 0.6 },
          { 'floor': "2/F", 'totalVisits': 8000, 'avgDwellTime': 30, 'repeatedVisits': 0.5 },
          { 'floor': "3/F", 'totalVisits': 7000, 'avgDwellTime': 32, 'repeatedVisits': 0.2 },
          { 'floor': "4/F", 'totalVisits': 6000, 'avgDwellTime': 20, 'repeatedVisits': 0.4 },
          { 'floor': "5/F", 'totalVisits': 5000, 'avgDwellTime': 45, 'repeatedVisits': 0.6 },
          { 'floor': "6/F", 'totalVisits': 4000, 'avgDwellTime': 40, 'repeatedVisits': 0.3 },
          { 'floor': "7/F", 'totalVisits': 7000, 'avgDwellTime': 120, 'repeatedVisits': 0.3 },
          { 'floor': "8/F", 'totalVisits': 3000, 'avgDwellTime': 90, 'repeatedVisits': 0.2 }
        ]
    },
    settings: function() {
        return {
            rowsPerPage: 10,
            showFilter: true,
            fields: ['totalVisits', 'avgDwellTime', 'repeatedVisits'],
            key: "floor"
        };
    }
});
