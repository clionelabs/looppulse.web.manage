SegmentGraphVisitorsXDwell.prototype.prepareData = function(visitsEngine) {
  var interval = 10 * 60 * 1000; // 10 minutes. TODO: dynamic interval depending on data
  var intervalCounts = visitsEngine.queryVisitorCountsXDurationIntervalSeries(interval);
  var intervalNames = _.map(_.range(intervalCounts.length), function(index) {
    return index * 10; 
  }); 

  this.data = [];
  for (var i = 0; i < intervalCounts.length; i++) {
      this.data.push({"duration": intervalNames[i], "number of visitors": intervalCounts[i]});
  }
}
