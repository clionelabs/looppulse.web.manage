SegmentGraphs.findList = function(from, to, segmentId) {
    return SegmentGraphs.findByGraphType(from, to, segmentId, SegmentGraphBase.Graph.List);
};

SegmentGraphs.findByGraphType = function(from, to, segmentId, type) {
    var selector = {
        from : from,
        to : to
    };
    if (segmentId) {
        _.extend(selector, {'segment._id' : segmentId});
    }
    if (type) {
        _.extend(selector, {'graphType' : type });
    }
    console.log("[SegmentGraph] subsribed json = " + JSON.stringify(selector));
    return SegmentGraphs.find(selector, { sort : { "segment.createdAt" : -1 }});
}


SegmentGraphs.removeAllFromCompany = function(companyId) {
    console.log("Removing segment metrics from company " + companyId);
    SegmentGraphs.remove({companyId: companyId});
};

var handleSegmentRemoved = function(segment) {
    console.log("[SegmentGraphs] Removing SegmentGraph ", segment._id);
    SegmentGraphs.remove({"segment._id": segment._id});
};

SegmentGraphs.startup = function () {
    Segments.find().observe({
        _suppress_initial: true,
        "removed": handleSegmentRemoved
    });
};
