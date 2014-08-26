// Helpers

/**
  All helpers need to get something from db should go to here
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
      { _id:"demo0001", name:"Elephant Parade", desc: "Visit the elephant on UG and a chance to win 2 movie tickets Engage customers when it’s Monday, Wednesday between 7pm to 9pm When they’re entering zone 107", sent:1000, viewed: 900, visited: 600, conversion: 0.6,viewConversion: 0.68  },
      { _id:"demo0002", name:"Super Weekend", desc: "Lucky Draw on purchase > $500", sent:1200, viewed: 800,  visited: 600, conversion: 0.5, viewConversion: 0.75 },
      { _id:"demo0003", name:"Summer Festival", desc: "10% off for everything",sent:2000, viewed: 1200, visited: 400, conversion: 0.2,  viewConversion: 0.33 }
    ]
  },
  totalVisits: function(period){
    // this = with context = cursor
    var data = this || []; //(this.data) ? this.data.fetch() : ProductMetrics.find({ locationId: this._id }).fetch();
    var sum = 0;
    data.forEach(function(m){
      sum += (!isNaN(m.visitors.length)) ? m.visitors.length : 0;
      console.log(sum, m,  m.visitors.length)
    })
    return { number:sum, diff:"+10%", field:"Total Visits", duration:"1 week ago" }
  },
  avgDwellTime: function(period){
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
  },
  repeatedVisits: function(period){
    return { number:"10%", diff:"+10%", field:"Repeat Visits", duration:"1 week ago" }
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
    var c = this;

    c.stat = {
      sent: this.sent,
      viewed: this.viewed,
      visited: this.visited,
    };

    return c;
  }
})

Template.dashboard_card.helpers({
  setSign: function(diff){
    var res = diff.match(/^([\+\-])/)
    var sign = (res.length > 0) ? res[0]:"";
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
      value: diff
    }
  }
})

Template.dashboard_campaign_list.events({
  "click .data-row": function(e, tmpl){ //e.currentTarget = .data-row, tmpl= this in template helpers and methods, this = tmple.data
    //console.log("click",e,this,tmpl)
    var self = tmpl;
    var campaign = this;
    var id = campaign._id
    if (!id) { return false; }

    var toStop = function(self, id){
      var last = null;
      var isLive = false;
      self.handle && self.handle[id] && self.handle[id].stop();
      d3.select('.campaign-summary.chart-row[data-id="'+id+'"] .campaign-summary-chart .charting-area').remove();
      last = jQuery('.campaign-summary.chart-row[data-id="'+id+'"]')
      jQuery('.campaign-summary-chart', last).append("<div class='charting-area'></div>")
      jQuery(last).removeClass("live")
      delete self.handle[id]
    }

    if (self.handle && self.handle[id]) {
      console.log("Handle for `"+id+"` found, leave it to be.")
      return true;
    }
    // var name = campaign.name;
    // var conversion = campaign.conversion;
    // var viewConversion = campaign.viewConversion;
    var columnChart = d4.charts.column()
        .x(function(x) {
            x.key('key')
        })
        .y(function(y){
            y.key('value');
        })
        .outerWidth(320)
        .outerHeight(220)
        .mixout('yAxis');


    //autorun will run at least once.
    if (!self.handle) { self.handle = [] }

    self.handle[id] =  Deps.autorun(function () {
      console.log("[Autorun] Chart Updating: "+id)
      var data = d3.entries(campaign.stat)
      var suffix = '[data-id="'+id+'"]';
      jQuery('.campaign-summary.chart-row'+suffix+"").addClass("live");
      d3.select('.campaign-summary.chart-row'+suffix+' .campaign-summary-chart .charting-area')
        .datum(data)
        .call(columnChart);
    })

    //redraw();
  }
});

// Autorun & Graph setup
Template.dashboard_performance_chart.rendered = function(){
  var self = this;
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
Template.dashboard_campaign_list.destroyed = function(){
  this.handle.forEach(function(h){
    h.stop();
  })
}