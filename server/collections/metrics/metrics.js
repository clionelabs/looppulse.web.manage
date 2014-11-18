Metric.generateAllSegmentsGraph = function (userId, from, to) {
    var companyId = Companies.findOne({ownedByUserIds : userId })._id;
    Segments.find({companyId: companyId}).map(function(segment) {
        SegmentMetric.generateAllGraph(segment, from, to);
    });
};

Metric.generateAllGraph = function(userId, segmentId, from, to) {
    var companyId = Companies.findOne({ownedByUserIds : userId })._id;
    var segment = new Segment(Segments.findOne({companyId: companyId, _id : segmentId}));

    SegmentMetric.generateAllGraph(segment, from, to);

}

Metrics.removeAllFromCompany = function(companyId) {
    console.log("Removing segment metrics from company " + companyId);
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
