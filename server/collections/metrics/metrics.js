Metric.generateAllSegmentRelated = function(userId, from, to) {
    var companyId = Companies.findOne({ownedByUserIds : userId })._id;
    Segments.find({companyId: companyId}).map(function(segment) {
        SegmentMetric.generateAllGraph(segment, from, to);
    });
};

Metrics.removeAllFromCompany = function(companyId) {
    Metrics.remove({companyId: companyId});
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
