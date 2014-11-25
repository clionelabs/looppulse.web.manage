SegmentGraphVisitorsXVisits.prototype.prepareData = function(visitsEngine) {
  var counts = visitsEngine.queryVisitorCountsXVisitsSeries();
  this.data = [];
  for (var i = 0; i < counts.length; i++) {
    this.data.push({"count": i, "number of visitors": counts[i]});
  }
}