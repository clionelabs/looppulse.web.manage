SegmentMetrics = {};

SegmentMetrics.findList = function() {
    var companyId = Companies.findOne({ownedByUserId : this.userId});
    return Metrics.find({type: "segment", companyId : companyId, graphType : GraphDataParser.Type.List});
};

SegmentMetric = {};

SegmentMetric.Graph = {};
SegmentMetric.Graph.List = "list";

SegmentMetric.Graph.TimeBucketXNumOfVisitorHistogram = "timeBucketXNumberOfVisitorHistogram";
SegmentMetric.Graph.VisitorOtherSegmentsBarChart = "visitorOtherSegmentsBarChart";
SegmentMetric.Graph.VisitorsTagsBarChartData = "visitorsTagsBarChart";

SegmentMetric.Graph.AverageDwellTimeBucketXNumOfVisitorHistogram = "averageDwellTimeBucketXNumOfVisitorHistogram";
SegmentMetric.Graph.DwellTimeInTimeFrameBubble = "dwellTimeInTimeFrameBubble";

SegmentMetric.Graph.NumberOfVisitXNumberOfVisitorsHistogram = "numberOfVisitXNumberOfVisitorsHistogram";
SegmentMetric.Graph.NumberOfVisitInTimeFrameBubble = "numberOfVisitInTimeFrameBubble";

SegmentMetric.TimeBucket = {};
SegmentMetric.TimeBucket.Hour = "hour";
SegmentMetric.TimeBucket.Day = "day";
SegmentMetric.TimeBucket.Week = "week";
SegmentMetric.TimeBucket.Month = "month";

SegmentMetric.generateAllGraph = function(segmentId, from, to) {
    //TODO get visitorIds from kim's work
    var visitorIds = [];
    var encounters = Encounters.findClosedByVisitors(visitorIds);
    //TODO get visitors: [segmentIds] kim's work
    var visitorInSegmentsHash = {};
    //TODO get visitors: [tags]
    var visitorHasTagsHash = {};

    prepareListData(encounters);

    prepareTimeBucketXNumOfVisitorHistogramData(SegmentMetric.TimeBucket.Week, encounters);
    prepareVisitorOtherSegmentsBarChartData(visitorInSegmentsHash);
    prepareVisitorsTagsBarChartData(visitorHasTagsHash);

    prepareAverageDwelTimeBucketXNumOfVisitorHistogramData(encounters);
    prepareDwellTimeInTimeFrameBubbleData(encounters);

    prepareNumberOfVisitXNumberOfVisitorsHistogramData(encounters);
    prepareNumberOfVisitsInTimeFrameBubbleData(encounters);

}

var prepareListData = function(encounters) {
    console.log("[SegmentMetric] generating list view data");
    var grpByVisitors = _.groupBy(encounters, function(e) {
        return e.visitorId;
    });
    console.log(JSON.stringify(grpByVisitors));
    //TODO add impl
}

var prepareTimeBucketXNumOfVisitorHistogramData = function(bucketSize, encounters) {
    console.log("[SegmentMetric] generating time bucket against number of visitors histogram");
    //TODO add impl
}

var prepareVisitorOtherSegmentsBarChartData = function(visitorInSegmentsHash) {
    console.log("[SegmentMetric] generating other segment percentage var chart");
    //TODO add impl
}

var prepareVisitorsTagsBarChartData = function(visitorHasTagsHash) {
    console.log("[SegmentMetric] generating visitors tag percentage bar chart");
    //TODO add impl
}

var prepareAverageDwelTimeBucketXNumOfVisitorHistogramData = function(encounters) {
    console.log("[SegmentMetric] preparing average dwell time again number of Visitors histogram");
    //TODO add impl

}

var prepareDwellTimeInTimeFrameBubbleData = function(encounters) {
    console.log("[SegmentMetric] preparing dwell time in time frame bubble data");
    //TODO add impl
}

var prepareNumberOfVisitXNumberOfVisitorsHistogramData = function(encounters) {
    console.log("[SegmentMetric] preparing number of visit against number of visitors");
    //TODO add impl
}

var prepareNumberOfVisitsInTimeFrameBubbleData = function(encounters) {
    console.log("[SegmentMetric] preparing number of visits in time frame bubble data");
    //TODO add impl
}