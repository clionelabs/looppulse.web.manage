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
SegmentMetric.Graph.DwellTimePunchCard = "dwellTimePunchCard";

SegmentMetric.Graph.NumberOfVisitXNumberOfVisitorsBarChart = "numberOfVisitXNumberOfVisitorsHistogram";
SegmentMetric.Graph.EnteredAtPunchCard = "EnteredAtPunchCard";
SegmentMetric.Graph.ExitedAtPunchCard = "exitedAtPunchCard";

SegmentMetric.Graph.VisitorTopLocationsBarChart = "visitorTopLocationsBarChart";
SegmentMetric.Graph.DwellTimeTopLocationsBarChart = "dwellTimeTopLocationsBarChart";
SegmentMetric.Graph.NumberOfVisitTopLocationsBarChart = "numberOfVisitTopLocationsBarChart";

// Values has to comply with with the moment object shorthand: http://momentjs.com/docs
SegmentMetric.TimeBucket = {};
SegmentMetric.TimeBucket.Hour = "h";
SegmentMetric.TimeBucket.Day = "d";
SegmentMetric.TimeBucket.Week = "w";
SegmentMetric.TimeBucket.Month = "m";

SegmentMetric.TimeBucketDisplayFormat = {};
SegmentMetric.TimeBucketDisplayFormat[SegmentMetric.TimeBucket.Hour] = 'MM-DD HH';
SegmentMetric.TimeBucketDisplayFormat[SegmentMetric.TimeBucket.Day] = 'YYYY-MM-DD';
SegmentMetric.TimeBucketDisplayFormat[SegmentMetric.TimeBucket.Week] = 'wo';
SegmentMetric.TimeBucketDisplayFormat[SegmentMetric.TimeBucket.Month] = 'MMM';
