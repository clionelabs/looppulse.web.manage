Metric.generateAllSegmentRelated = function(userId, from, to) {
    var companyId = Companies.findOne({ownedByUserIds : userId })._id;
    Segments.find({companyId: companyId}).map(function(segment) {
        SegmentMetric.generateAllGraph(segment, from, to);
    });
};

Metrics.removeAllFromUser = function(userId) {
    Metrics.remove({userId: userId});
};
