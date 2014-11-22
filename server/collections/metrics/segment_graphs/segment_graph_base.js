/**
 * Abstract base class of segment metric graphs
 */
SegmentGraphBase = function(segment, from, to) {
  this.segment = segment;
  this.from = from;
  this.to = to;
  this.graphType = null; // subclass should implement
  this.data = null; // subclass should implement
} 

SegmentGraphBase.prototype.save = function() {
  if (this.graphType === null) {
    console.error("[SegmentGraphBase]: subclass needs to implement graphType");
    return;
  }
  if (this.data === null) {
    console.error("[SegmentGraphBase]: subclass needs to provide data");
    return;
  }

  var collectionMeta = new Metric.CollectionMeta(this.segment._id, Metric.CollectionMeta.Type.Segment);
  var metricSelector = {
    companyId: this.segment.companyId,
    collectionMeta: collectionMeta,
    from: this.from,
    to: this.to,
    graphType: this.graphType
  };
  var metric = new Metric(this.segment.companyId, collectionMeta, this.from, this.to, this.graphType, this.data);
  Metrics.upsert(metricSelector, metric); 
}

SegmentGraphBase.prototype.prepareData = function() {
  console.warn("[SegmentGraphBase] missing prepareData implementation in subclass");
}

SegmentGraphBase.prototype.format7X24ToFrontend = function(array) {
    //TODO start refactor to better encapsulate, perhaps pass to d3?
    var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var result = [];
    for (var i = 0; i < 7; i++) {
        for (var j = 0; j < 24; j++) {
            result.push([weekdays[i], j, array[i][j]]);
        }
    }
    return result;
}
