SegmentGraphs = new Meteor.Collection("segmentGraphs", {
    transform: function(doc) {
        doc.segment = new Segment(doc.segment);
        if (doc.graphType === SegmentGraphBase.Graph.List) {
            return new SegmentGraphList(doc.segment, doc.from, doc.to, doc.data);

        } else if (doc.graphType === SegmentGraphBase.Graph.DistributionDwellEnter) {
            return new SegmentGraphDistributionDwell(doc.segment, doc.from, doc.to, SegmentGraphBase.Enter, doc.data);

        } else if (doc.graphType === SegmentGraphBase.Graph.DistributionDwellExit) {
            return new SegmentGraphDistributionDwell(doc.segment, doc.from, doc.to, SegmentGraphBase.Exit, doc.data);

        } else if (doc.graphType === SegmentGraphBase.Graph.DistributionVisitsEnter) {
            return new SegmentGraphDistributionVisits(doc.segment, doc.from, doc.to, SegmentGraphBase.Enter, doc.data);

        } else if (doc.graphType === SegmentGraphBase.Graph.DistributionVisitsExit) {
            return new SegmentGraphDistributionVisits(doc.segment, doc.from, doc.to, SegmentGraphBase.Exit, doc.data);

        } else if (doc.graphType === SegmentGraphBase.Graph.OtherSegments) {
            return new SegmentGraphOtherSegments(doc.segment, doc.from, doc.to, doc.data);

        } else if (doc.graphType === SegmentGraphBase.Graph.TopLocationsDwell) {
            return new SegmentGraphTopLocationsDwell(doc.segment, doc.from, doc.to, doc.data);

        } else if (doc.graphType === SegmentGraphBase.Graph.TopLocationsVisitors) {
            return new SegmentGraphTopLocationsVisitors(doc.segment, doc.from, doc.to, doc.data);

        } else if (doc.graphType === SegmentGraphBase.Graph.TopLocationsVisits) {
            return new SegmentGraphTopLocationsVisits(doc.segment, doc.from, doc.to, doc.data);

        } else if (doc.graphType === SegmentGraphBase.Graph.VisitorsXDates) {
            return new SegmentGraphVisitorsXDates(doc.segment, doc.from, doc.to, doc.data);

        } else if (doc.graphType === SegmentGraphBase.Graph.VisitorsXDwell) {
            return new SegmentGraphVisitorsXDwell(doc.segment, doc.from, doc.to, doc.data);

        } else if (doc.graphType === SegmentGraphBase.Graph.VisitorsXVisits) {
            return new SegmentGraphVisitorsXVisits(doc.segment, doc.from, doc.to, doc.data);

        } else {
            console.warn('[SegmentGraphs] Unsupported graph type, have you added "' + doc.graphType + '" to transform()?')
        }
    }
});