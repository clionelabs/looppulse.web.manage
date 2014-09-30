
Template.dashboard_campaign_list.helpers({
  getStat: function(){
    console.log("stat",this)
    var campaign = this;
    var c = {};

    c = {
      sent: this.sent,
      viewed: this.viewed,
      visited: this.visited,
    };

    return c;
  },
  getMetrics: function(t, offset){
    if (!t) { t = this.startTime || 0; }
    if (!offset) { offset = this.traceOffset || 0 }
    //Return location Metric base on the time with/without offset
    //Due to the nature of the range query better return the range
    return [{
      stat: {
        totalVisits: "1000",
        avgDwellTime: "10",
        repeatedVisits: "100"
      },
      startTime: t
    },{
      stat: {
        totalVisits: "1900",
        avgDwellTime: "18",
        repeatedVisits: "1000"
      },
      startTime: t + offset
    }]
  },
  context: function(){
    return this.currentContext ? this.currentContext : "Campaign";
  },
  fields: function(){
    return ["sent", "visited", "conversion"]
  }
})


Template.dashboard_campaign_list.events({
  "click .data-row": function(e, tmpl){ //e.currentTarget = .data-row, tmpl= this in template helpers and methods, this = tmple.data
    console.log("click",e,this,tmpl)
    var self = tmpl;
    var campaign = this;
    var id = campaign._id;
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
    var mainColumnChart = d4.charts.column()
        .x(function(x) {
            x.key('key')
        })
        .y(function(y){
            y.key('value');
        })
        .outerWidth(320)
        .outerHeight(220)
        .mixout('yAxis');


    var miniColumnChart = d4.charts.column()
        .x(function(x) {
            x.key('key')
        })
        .y(function(y){
            y.key('value');
        })
        .outerWidth(220)
        .outerHeight(220)
        .mixout('yAxis');

    //autorun will run at least once.
    if (!self.handle) { self.handle = [] }
    if (!self.locationHandle) { self.locationHandle = [] }


    var suffix = '[data-id="'+id+'"]';
    jQuery('.campaign-summary.chart-row'+suffix+"").addClass("live");

    self.handle[id] =  Deps.autorun(function () {
      console.log("[Autorun] Chart Updating: "+id)
      var data = d3.entries(campaign.stat)
      d3.select('.campaign-summary.chart-row'+suffix+' .campaign-summary-chart .charting-area')
        .datum(data)
        .call(mainColumnChart);
    })

    self.locationHandle[id] =  Deps.autorun(function () {
      console.log("[Autorun] Chart Updating: "+id)
      var prefix = '.campaign-summary.chart-row'+suffix+' .campaign-comparsion-chart .charting-area'
      var orders = ["totalVisits", "avgDwellTime","repeatedVisits"]
      orders.forEach(function(f){
        console.log(campaign.m)
        var data = [{
          key: "now",
          value: campaign.m[0].stat[f]
        },
        {
          key: "past",
          value: campaign.m[1].stat[f]
        }]
        d3.select(prefix+"[data-entity='"+f+"']")
          .datum(data)
          .call(
            miniColumnChart.using('xAxis', function(axis){
              console.log(axis)
              axis.align('bottom').title(f)
            })
          );
        })
    })

    //redraw();
  }
});

Template.dashboard_campaign_list.destroyed = function(){
  if(this.handle){
    this.handle.forEach(function(h){
      h.stop();
    })
  }
  if(this.locationHandle){
    this.locationHandle.forEach(function(h){
      h.stop();
    })
  }
}