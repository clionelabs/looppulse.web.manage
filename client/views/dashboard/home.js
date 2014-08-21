// Helpers

/**
  All helpers need to get something from db should go to here
*/
Template.dashboard_home.helpers({
  /**
  Extract the campaigns data from engagements
  @return Campaigns Data with object \{ _id, name, sent, visited, conversion \}
  **/
  campaigns: function(){
    var campaigns = [];
    var collection;

    /* TODO: extract the campaign data from engagement
    collection = {}.find({})
    collection.map(function(){
      return {
      _id: _id,
      name: "",
      sent: 0,
      visited: 0,
      conversion: 0
      }
    })
    campaigns = collection
    return campaigns;
    */

    //return dummy
    //@@WARNING: ORDER IMPORTANTED
    return [
      { _id:"demo0001", name:"campaigns 1", desc: "Visit the elephant on UG and a chance to win 2 movie tickets Engage customers when it’s Monday, Wednesday between 7pm to 9pm When they’re entering zone 107", sent:1000, viewed: 900, visited: 600, conversion: 0.6,viewConversion: 0.68  },
      { _id:"demo0002", name:"campaigns 2", desc: "Lucky Draw on purchase > $500", sent:1200, viewed: 800,  visited: 600, conversion: 0.5, viewConversion: 0.75 },
      { _id:"demo0003", name:"campaigns 3", desc: "10% off for everything",sent:2000, viewed: 1200, visited: 400, conversion: 0.2,  viewConversion: 0.33 }
    ]
  },
  totalVisits: function(period){
    return { number:"10000", diff:"+10", field:"Total Visits", duration:"1 week" }
  },
  avgDwellTime: function(period){
    return { number:"10min", diff:"+10", field:"Avg Dwell Time", duration:"1 week" }
  },
  repeatedVisits: function(period){
    return { number:"10%", diff:"+10", field:"Revisits", duration:"1 week" }
  },
  performances: function(){
    //fit something reactive here should trigger the graph update.
    return [
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
  }
});

Template.dashboard_campaign_list.helpers({
  getStat: function(){
    var campaign = this;
    var c = {};
    c._id = this._id;
    c.name = this.name;
    c.conversion = this.conversion;
    c.viewConversion = this.conversion;


    c.stat = {
      sent: this.sent,
      viewed: this.viewed,
      visited: this.visited,
    };

    return c;
  }
})

// Autorun & Graph setup
Template.dashboard_campaign_summary_chart.rendered = function(){
  var self = this;
  var campaign = this.data;
  var id = campaign._id
  // var name = campaign.name;
  // var conversion = campaign.conversion;
  // var viewConversion = campaign.viewConversion;
  var columnChart = d4.charts.column()
      .x(function(x) {
          x.key('key')
      })
      .y(function(y){
          y.key('value');
      });


  //autorun will run at least once.
  self.handle =  Deps.autorun(function () {
    console.log("[Autorun] Chart Updating: "+id)
    var data = d3.entries(campaign.stat)

    d3.select('.campaign-summary-chart[data-id="'+id+'"]')
      .datum(data)
      .call(columnChart);
  })

  //redraw();
};
Template.dashboard_campaign_summary_chart.destroyed = function(){
  this.handle && this.handle.stop();
}
Template.dashboard_performance_chart.rendered = function(){
  var self = this;
  var chart = d4.charts.line()
    .outerWidth($('main .charting').width())
    .x(function(x){
      x.key('hour');
    })
    .y(function(y){
      y.key('visits');
    });
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
    var data = Template.dashboard_home.performances();
    var parsedData = parser(data);

    d3.select('main .charting')
    .datum(parsedData.data)
    .call(chart);
  })

}

Template.dashboard_performance_chart.destroyed = function () {
  this.handle && this.handle.stop();
};