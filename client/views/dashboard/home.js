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