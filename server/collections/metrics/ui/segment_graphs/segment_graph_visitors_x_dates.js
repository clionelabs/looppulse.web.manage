SegmentGraphVisitorsXDates.prototype.prepareData = function(visitsEngine) {
  var bucketCount = visitsEngine.queryVisitorsCountXBucketSeries(); 
  var bucketStart = visitsEngine.queryBucketsStartSeries();

  this.data = [];
  for (var i = 0; i < bucketCount.length; i++) {
      this.data.push({"date": bucketStart[i].format("YYYY-MM-DD"), "number of visitors": bucketCount[i]});
  }
}
