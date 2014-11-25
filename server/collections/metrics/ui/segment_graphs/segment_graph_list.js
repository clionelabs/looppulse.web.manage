SegmentGraphList.prototype.prepareData = function(visitsEngine) {
  this.data = {
      numberOfVisitors: visitsEngine.queryTotalVisitorsCount(),
      averageDwellTime: visitsEngine.queryAverageDuration(),
      repeatedVisitorPercentage: visitsEngine.queryRepeatedVisitsPercentage()
  };
}
