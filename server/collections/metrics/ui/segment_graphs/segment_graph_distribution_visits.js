SegmentGraphDistributionVisits.prototype.prepareData = function(visitsEngine) {
  var result = visitsEngine.queryVisitsCountWeeklyHourlySeries(this.by);
  this.data = this.format7X24ToFrontend(result);
}


