Metrics = new Meteor.Collection("metrics", {
    transform: function(doc) {
                return new Metric(  doc.companyId, doc.collectionMeta,
                    doc.from, doc.to, doc.graphType, doc.data);
    }
});



/**
 *
 * @param companyId
 * @param collectionMeta Metric.CollectionMeta
 * @param from
 * @param to
 * @param data
 * @param graphType
 * @constructor
 */
Metric = function(companyId, collectionMeta, from, to, graphType, data) {
    this.companyId = companyId;
    this.collectionMeta = collectionMeta;
    this.from = from;
    this.to = to;
    this.data = data;
    this.graphType = graphType;
};

/**
 *
 * @param id
 * @param type
 * @constructor
 */
Metric.CollectionMeta = function(id, type) {
    this.id = id;
    this.type = type;
};

Metric.CollectionMeta.Type = {};
Metric.CollectionMeta.Type.Segment = "segment";

SegmentMetric = {};

SegmentMetric.Graph = {};
SegmentMetric.Graph.List = "list";

SegmentMetric.Graph.DayXNumOfVisitorLineChart = "timeBucketXNumberOfVisitorHistogram";
SegmentMetric.Graph.VisitorOtherSegmentsBarChart = "visitorOtherSegmentsBarChart";
SegmentMetric.Graph.VisitorsTagsBarChartData = "visitorsTagsBarChart";

SegmentMetric.Graph.AverageDwellTimeBucketXNumOfVisitorHistogram = "averageDwellTimeBucketXNumOfVisitorHistogram";
SegmentMetric.Graph.DwellTimeInTimeFrameBubble = "dwellTimeInTimeFrameBubble";

SegmentMetric.Graph.NumberOfVisitXNumberOfVisitorsHistogram = "numberOfVisitXNumberOfVisitorsHistogram";
SegmentMetric.Graph.NumberOfVisitInTimeFrameBubble = "numberOfVisitInTimeFrameBubble";

SegmentMetric.TimeBucket = {};
SegmentMetric.TimeBucket.Hour = "h";
SegmentMetric.TimeBucket.Day = "d";
SegmentMetric.TimeBucket.Week = "w";
SegmentMetric.TimeBucket.Month = "m";

SegmentMetric.TimeBucketMomentShortHands = {};
SegmentMetric.TimeBucketMomentShortHands[SegmentMetric.TimeBucket.Hour] = 'MM-DD HH';
SegmentMetric.TimeBucketMomentShortHands[SegmentMetric.TimeBucket.Day] = 'YYYY-MM-DD';
SegmentMetric.TimeBucketMomentShortHands[SegmentMetric.TimeBucket.Week] = 'wo';
SegmentMetric.TimeBucketMomentShortHands[SegmentMetric.TimeBucket.Month] = 'MMM';
