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

    Benchmark.time(function() {
      var graph = new SegmentGraphList(segment, from, to);
      graph.prepareData(visitsEngine);
      graph.save();
    }, segment.name + '-SegmentGraphList');
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
    Benchmark.time(function() {
      visitsEngine.build(visitorIds, encounters);
    }, 'Build visitsEngine'); 

    // build visitsEngine for each installation separately for those topLocations graph
    var installationVisitsEngines = {};
    var installationNames = {};
    Benchmark.time(function() {
      var installationEncounters = {};
      _.each(encounters, function(encounter) {
          var iid = encounter.installationId;
          installationEncounters[iid] = installationEncounters[iid] || [];
          installationEncounters[iid].push(encounter);
      });
      _.each(installationEncounters, function(iEncounters, iid) {
          var iVisitorIds = _.uniq(_.reduce(iEncounters, function(memo, encounter) {
              memo.push(encounter.visitorId);
              return memo;
          }, []));
          installationVisitsEngines[iid] = new VisitsEngine(moment(from), moment(to), 'd');
          installationVisitsEngines[iid].build(iVisitorIds, iEncounters);
      });
      _.each(installationEncounters, function(iEncounters, iid) {
          var installation = Installations.findOne(iid);
          installationNames[iid] = installation.name;
      });
    }, 'Build installation visitsEngines'); 

    // findByGraphType visitor ids for all segments for the otherSegments graph
    var otherSegmentVisitorIds = {};
    var otherSegmentNames = {};
    Benchmark.time(function() {
      var skippedIds = [segment._id, Segments.findEveryVisitorSegment(segment.companyId)._id];
      Segments.findByCompany(segment.companyId, {_id: {$nin: skippedIds}}).map(function(seg) {
          otherSegmentVisitorIds[seg._id] = SegmentVisitorFlows.getSegmentVisitorIdList(seg._id, atTime);
          otherSegmentNames[seg._id] = seg.name;
      });
    }, 'Build segment visitors'); 

    // build graphs
    Benchmark.time(function() {
      var graph = new SegmentGraphList(segment, from, to);
      graph.prepareData(visitsEngine);
      graph.save();
    }, segment.name + '-SegmentGraphList');

    Benchmark.time(function() {
    var graph = new SegmentGraphVisitorsXDates(segment, from, to);
    graph.prepareData(visitsEngine);
    graph.save();
    }, segment.name + '-SegmentGraphVisitorsXDates');

    Benchmark.time(function() {
    var graph = new SegmentGraphOtherSegments(segment, from, to);
    graph.prepareData(visitorIds, otherSegmentVisitorIds, otherSegmentNames);
    graph.save();
    }, segment.name + '-SegmentGraphOtherSegments');

    Benchmark.time(function() {
    var graph = new SegmentGraphVisitorsXDwell(segment, from, to);
    graph.prepareData(visitsEngine);
    graph.save();
    }, segment.name + '-SegmentGraphVisitorsXDwell');

    Benchmark.time(function() {
    var graph = new SegmentGraphDistributionDwell(segment, from, to, SegmentGraphBase.Graph.Data.Enter);
    graph.prepareData(visitsEngine);
    graph.save();
    }, segment.name + '-SegmentGraphDistributionDwell');

    Benchmark.time(function() {
    var graph = new SegmentGraphVisitorsXVisits(segment, from, to);
    graph.prepareData(visitsEngine);
    graph.save();
    }, segment.name + '-SegmentGraphVisitorsXVisits');

    Benchmark.time(function() {
    var graph = new SegmentGraphDistributionVisits(segment, from, to, SegmentGraphBase.Graph.Data.Enter);
    graph.prepareData(visitsEngine);
    graph.save();
    }, segment.name + '-SegmentGraphDistributionVists');

    Benchmark.time(function() {
    var graph = new SegmentGraphDistributionVisits(segment, from, to, SegmentGraphBase.Graph.Data.Exit);
    graph.prepareData(visitsEngine);
    graph.save();
    }, segment.name + '-SegmentGraphDistributionVisits');

    Benchmark.time(function() {
    var graph = new SegmentGraphTopLocationsVisitors(segment, from, to);
    graph.prepareData(installationVisitsEngines, installationNames);
    graph.save();
    }, segment.name + '-SegmentGraphTopLocationsVisitors');

    Benchmark.time(function() {
    var graph = new SegmentGraphTopLocationsDwell(segment, from, to);
    graph.prepareData(installationVisitsEngines, installationNames);
    graph.save();
    }, segment.name + '-SegmentGraphTopLocationsDwell');

    Benchmark.time(function() {
    var graph = new SegmentGraphTopLocationsVisits(segment, from, to);
    graph.prepareData(installationVisitsEngines, installationNames);
    graph.save();
    }, segment.name + '-SegmentGraphTopLocationsVisits');
};
