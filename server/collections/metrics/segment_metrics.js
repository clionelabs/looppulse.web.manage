SegmentMetrics = {};

SegmentMetrics.findListView = function(from, to, segmentId) {
    return SegmentMetrics.find(from, to, segmentId, SegmentMetric.Graph.List);
};

SegmentMetrics.find = function(from, to, segmentId, type) {
    var companyId = Companies.findOne({ownedByUserId : this.userId})._id;
    var selector = {
        'collectionMeta.type': "segment",
        companyId : companyId,
        from : from,
        to : to
    };
    if (segmentId) {
        console.log("[SegmentMetrics] segmentId = " + segmentId);
        _.extend(selector, {'collectionMeta.id' : segmentId});
    }
    if (type) {
        _.extend(selector, {'graphType' : type });
    }
    console.log("[SegmentMetric] companyId=" + companyId);
    return Metrics.find(selector);
}

/**
 * @param segment
 * @param from {Unix Timestamp} Use timestamp because the moment cannot be passed
 * @param to {Unix Timestamp}
 */
SegmentMetric.generateListGraph = function(segment, from, to) {
    console.log("[SegmentMetric] generating segment " + segment._id + " metric data from " + from + " to " + to);
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
SegmentMetric.generateAllGraph = function(segment, from, to) {
    console.log("[SegmentMetric] generating segment " + segment._id + " metric data from " + from + " to " + to);
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

    // find visitor ids for all segments for the otherSegments graph
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
