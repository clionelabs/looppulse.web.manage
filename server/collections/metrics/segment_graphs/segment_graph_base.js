SegmentGraphBase.prototype.save = function() {
  if (this.graphType === null) {
    console.error("[SegmentGraphBase]: subclass needs to implement graphType");
    return;
  }
  if (this.data === null) {
    console.error("[SegmentGraphBase]: subclass needs to provide data");
    return;
  }

  var selector = {
    'segment._id' : this.segment._id,
    from: this.from,
    to: this.to,
    graphType: this.graphType
  };

  SegmentGraphs.upsert(selector, this);
}

SegmentGraphBase.prototype.prepareData = function() {
  console.warn("[SegmentGraphBase] missing prepareData implementation in subclass");
}

SegmentGraphBase.prototype.format7X24ToFrontend = function(array) {
    //TODO start refactor to better encapsulate, perhaps pass to d3?
    var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var result = [];
    for (var i = 0; i < 7; i++) {
        for (var j = 0; j < 24; j++) {
            result.push([weekdays[i], j, array[i][j]]);
        }
    }
    return result;
}


/**
 * @param segment
 * @param from {Unix Timestamp} Use timestamp because the moment cannot be passed
 * @param to {Unix Timestamp}
 */
SegmentGraphBase.generateListGraph = function(segment, from, to) {
    console.log("[SegmentGraph] generating segment " + segment._id + " metric data from " + from + " to " + to);
    var atTime = moment().valueOf();
    var visitorIds = SegmentVisitorFlows.getSegmentVisitorIdList(segment._id, atTime);
    var encounters = Encounters.findClosedByVisitorsInTimePeriod(visitorIds, from, to).fetch();

    var visitsEngine = new VisitsEngine(moment(from), moment(to), 'days');
    visitsEngine.build(visitorIds, encounters);

    var graph = new SegmentGraphList(segment, from, to);
    graph.prepareData(visitsEngine);
    graph.save();
}

/**
 * @param segment {Segment}
 * @param from {Unix Timestamp} Use timestamp because the moment cannot be passed
 * @param to {Unix Timestamp}
 */
SegmentGraphBase.generateAllGraph = function(segment, from, to) {
    console.log("[SegmentGraph] generating segment " + segment._id + " metric data from " + from + " to " + to);
    var atTime = moment().valueOf();
    var visitorIds = SegmentVisitorFlows.getSegmentVisitorIdList(segment._id, atTime);
    var encounters = Encounters.findClosedByVisitorsInTimePeriod(visitorIds, from, to).fetch();

    // build visitsEngine with encounters for most graphs
    var visitsEngine = new VisitsEngine(moment(from), moment(to), 'days');
    visitsEngine.build(visitorIds, encounters);

    // build visitsEngine for each installation separately for those topLocations graph
    var installationEncounters = {};
    _.each(encounters, function(encounter) {
        var iid = encounter.installationId;
        installationEncounters[iid] = installationEncounters[iid] || [];
        installationEncounters[iid].push(encounter);
    });
    var installationVisitsEngines = {};
    _.each(installationEncounters, function(iEncounters, iid) {
        var iVisitorIds = _.uniq(_.reduce(iEncounters, function(memo, encounter) {
            memo.push(encounter.visitorId);
            return memo;
        }, []));
        installationVisitsEngines[iid] = new VisitsEngine(moment(from), moment(to), 'd');
        installationVisitsEngines[iid].build(iVisitorIds, iEncounters);
    });
    var installationNames = {};
    _.each(installationEncounters, function(iEncounters, iid) {
        var installation = Installations.findOne(iid);
        installationNames[iid] = installation.name;
    });

    // findByGraphType visitor ids for all segments for the otherSegments graph
    var otherSegmentVisitorIds = {};
    var otherSegmentNames = {};
    var skippedIds = [segment._id, Segments.findEveryVisitorSegment(segment.companyId)._id];
    Segments.findByCompany(segment.companyId, {_id: {$nin: skippedIds}}).map(function(seg) {
        otherSegmentVisitorIds[seg._id] = SegmentVisitorFlows.getSegmentVisitorIdList(seg._id, atTime);
        otherSegmentNames[seg._id] = seg.name;
    });

    // build graphs
    var graph = new SegmentGraphList(segment, from, to);
    graph.prepareData(visitsEngine);
    graph.save();

    var graph = new SegmentGraphVisitorsXDates(segment, from, to);
    graph.prepareData(visitsEngine);
    graph.save();

    var graph = new SegmentGraphOtherSegments(segment, from, to);
    graph.prepareData(visitorIds, otherSegmentVisitorIds, otherSegmentNames);
    graph.save();

    var graph = new SegmentGraphVisitorsXDwell(segment, from, to);
    graph.prepareData(visitsEngine);
    graph.save();

    var graph = new SegmentGraphDistributionDwell(segment, from, to, 'ENTER');
    graph.prepareData(visitsEngine);
    graph.save();

    var graph = new SegmentGraphVisitorsXVisits(segment, from, to);
    graph.prepareData(visitsEngine);
    graph.save();

    var graph = new SegmentGraphDistributionVisits(segment, from, to, 'ENTER');
    graph.prepareData(visitsEngine);
    graph.save();

    var graph = new SegmentGraphDistributionVisits(segment, from, to, 'EXIT');
    graph.prepareData(visitsEngine);
    graph.save();

    var graph = new SegmentGraphTopLocationsVisitors(segment, from, to);
    graph.prepareData(installationVisitsEngines, installationNames);
    graph.save();

    var graph = new SegmentGraphTopLocationsDwell(segment, from, to);
    graph.prepareData(installationVisitsEngines, installationNames);
    graph.save();

    var graph = new SegmentGraphTopLocationsVisits(segment, from, to);
    graph.prepareData(installationVisitsEngines, installationNames);
    graph.save();
};

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
