Template.dashboard_home.rendered = function(){
  var graphData = [];

  for (var i = 25; i > 0; i--) {
    graphData.push({
      x: i,
      y: i
    });
  }

  var chart = d4.charts.column();
  d3.select('main .charting')
    .datum(graphData)
    .call(chart);
}