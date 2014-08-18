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
      { _id:"demo0001", name:"campaigns 1", sent:1000, viewed: 900, visited: 600, conversion: 0.6,viewConversion: 0.68  },
      { _id:"demo0002", name:"campaigns 2", sent:1200, viewed: 800,  visited: 600, conversion: 0.5, viewConversion: 0.75 },
      { _id:"demo0003", name:"campaigns 3", sent:2000, viewed: 1200, visited: 400, conversion: 0.2,  viewConversion: 0.33 }
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
  }
});


// Autorun & Graph setup
Template.dashboard_campaign_summary_chart.rendered = function(campaign){
  if (!campaign) { campaign = this.data; }
  var id = campaign._id
  var name = campaign.name;
  var conversion = campaign.conversion;
  var viewConversion = campaign.viewConversion;
  delete campaign._id;
  delete campaign.name;
  delete campaign.conversion;
  delete campaign.viewConversion;

  var data = d3.entries(campaign);
  var columnChart = d4.charts.column()
      .x(function(x) {
          x.key('key')
      })
      .y(function(y){
          y.key('value');
      });

  console.log("Rendering ", '.campaign-summary-chart[data-id="'+id+'"]', d3.select('.campaign-summary-chart[data-id="'+id+'"]'))

  d3.select('.campaign-summary-chart[data-id="'+id+'"]')
    .datum(data)
    .call(columnChart);
};
Template.dashboard_home.rendered = function(){
  var data = [
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
    var parsedData =
    d4.parsers.nestedGroup()
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
      })(data);

    var chart =
    d4.charts.line()
      .outerWidth($('main .charting').width())
      .x(function(x){
        x.key('hour');
      })
      .y(function(y){
        y.key('visits');
      });

    d3.select('main .charting')
    .datum(parsedData.data)
    .call(chart);

}