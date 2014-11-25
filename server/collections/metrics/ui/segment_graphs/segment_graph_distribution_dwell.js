SegmentGraphDistributionDwell.prototype.prepareData = function(visitsEngine) {
  var durations = visitsEngine.queryAverageDurationWeeklyHourlySeries(this.by);
  this.data = this.format7X24ToFrontend(durations);
}
