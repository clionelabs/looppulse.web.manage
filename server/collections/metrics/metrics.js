Metric.generateAllSegmentRelated = function(userId, from, to) {
    var companyId = Companies.findOne({ownedByUserIds : userId })._id;
    Segments.find({companyId: companyId}).map(function(segment) {
        SegmentMetric.generateAllGraph(segment, from, to);
    });
};

Metrics.removeAllFromUser = function(userId) {
    Metrics.remove({userId: userId});
};

var handleSegmentRemoved = function(segment) {
  console.log("[Metrics] Removing Metric", {collectionMeta:{"id": segment._id, "type": "segment"}});
  Metrics.remove({collectionMeta:{"id": segment._id, "type": "segment"}});
};

Metrics.startup = function () {
  Segments.find().observe({
    _suppress_initial: true,
    "removed": handleSegmentRemoved
  });
};
