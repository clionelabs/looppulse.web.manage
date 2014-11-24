/**
 * Abstract base class of segment metric graphs
 */
SegmentGraphBase = function(segment, from, to) {
  this.segment = segment;
  this.from = from;
  this.to = to;
  this.graphType = null; // subclass should implement
  this.data = null; // subclass should implement
} 

SegmentGraphBase.Graph = {};
SegmentGraphBase.Graph.List = "list";
SegmentGraphBase.Graph.VisitorsXDates = "visitorsXDates";
SegmentGraphBase.Graph.VisitorsXDwell = "visitorsXDwell";
SegmentGraphBase.Graph.VisitorsXVisits = "visitorsXVisits";
SegmentGraphBase.Graph.TopLocationsVisitors = "topLocationsVisitors";
SegmentGraphBase.Graph.TopLocationsDwell = "topLocationsDwell";
SegmentGraphBase.Graph.TopLocationsVisits = "topLocationsVisits";
SegmentGraphBase.Graph.DistributionDwellEnter = "distributionDwellEnter";
SegmentGraphBase.Graph.DistributionDwellExit = "distributionDwellExit";
SegmentGraphBase.Graph.DistributionVisitsEnter = "distributionVisitsEnter";
SegmentGraphBase.Graph.DistributionVisitsExit = "distributionVisitsExit";
SegmentGraphBase.Graph.OtherSegments = "otherSegments";


SegmentGraphBase.Enter = 'ENTER';
SegmentGraphBase.Exit = 'EXIT';
