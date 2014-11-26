SegmentGraphVisitorsXDates.prototype.prepareData = function(visitsEngine) {
  var bucketCount = visitsEngine.queryVisitorsCountXBucketSeries(); 
  var bucketStart = visitsEngine.queryBucketsStartSeries();

  if (bucketCount.length !== bucketStart.length) {
    console.error("[SegmentGraphVisitorsXDates] invalid data. bucketCount: ", bucketCount, ", bucketStart: ", bucketStart);
    return;
  }

  this.data = [];
  for (var i = 0; i < bucketCount.length; i++) {
      this.data.push({"date": bucketStart[i].format("YYYY-MM-DD"), "number of visitors": bucketCount[i]});
  }
}
