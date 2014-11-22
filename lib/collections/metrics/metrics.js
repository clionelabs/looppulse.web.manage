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
SegmentMetric.Graph.VisitorsXDates = "visitorsXDates";
SegmentMetric.Graph.VisitorsXDwell = "visitorsXDwell";
SegmentMetric.Graph.VisitorsXVisits = "visitorsXVisits";
SegmentMetric.Graph.TopLocationsVisitors = "topLocationsVisitors";
SegmentMetric.Graph.ToplocationsDwell = "topLocationsDwell";
SegmentMetric.Graph.TopLocationsVisits = "topLocationsVisits";
SegmentMetric.Graph.DistributionDwellEnter = "distributionDwellEnter";
SegmentMetric.Graph.DistributionDwellExit = "distributionDwellExit";
SegmentMetric.Graph.DistributionVisitsEnter = "distributionVisitsEnter";
SegmentMetric.Graph.DistributionVisitsExit = "distributionVisitsExit";
SegmentMetric.Graph.OtherSegments = "otherSegments";
