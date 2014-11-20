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
 * TODO refactor
 * @param segment
 * @param from
 * @param to
 */
SegmentMetric.generateListGraph = function(segment, from, to) {
    console.log("[SegmentMetric] generating segment " + segment._id + " metric data from " + from + " to " + to);
    var atTime = moment().valueOf();
    var visitorIds = SegmentVisitorFlows.getSegmentVisitorIdList(segment._id, atTime);
    var encounters = Encounters.findClosedByVisitorsInTimePeriod(visitorIds, from, to).fetch();

    var visitsEngine = new VisitsEngine(moment(from), moment(to), 'd');
    visitsEngine.build(visitorIds, encounters);
    var listData = SegmentMetric.prepareListData(visitsEngine); 

    var collectionMeta = new Metric.CollectionMeta(segment._id, Metric.CollectionMeta.Type.Segment);
    var listMetricSelector = {
        companyId: segment.companyId,
        collectionMeta: collectionMeta,
        from: from,
        to: to,
        graphType: SegmentMetric.Graph.List
    };
    var listMetric = new Metric(segment.companyId, collectionMeta, from, to, SegmentMetric.Graph.List, listData);
    Metrics.upsert(listMetricSelector, listMetric);
}

/**
 * TODO refactor to a better abstraction for the Metrics.upsert
 * @param segment {Segment}
 * @param from {Unix Timestamp} Use timestamp because the moment cannot be passed
 * @param to {Unix Timestamp}
 */
SegmentMetric.generateAllGraph = function(segment, from, to) {
    console.log("[SegmentMetric] generating segment " + segment._id + " metric data from " + from + " to " + to);
    var atTime = moment().valueOf();
    var visitorIds = SegmentVisitorFlows.getSegmentVisitorIdList(segment._id, atTime);
    var encounters = Encounters.findClosedByVisitorsInTimePeriod(visitorIds, from, to).fetch();

    var visitsEngine = new VisitsEngine(moment(from), moment(to), 'd');
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

    var collectionMeta = new Metric.CollectionMeta(segment._id, Metric.CollectionMeta.Type.Segment);

    var dateXNumberOfVisitorsBarChartData = SegmentMetric.prepareNumOfVisitorXTimeBucketLineChartData(visitsEngine);
    var dateXNumberOfVisitorsBarChartMetricSelector = {
        companyId: segment.companyId,
        collectionMeta: collectionMeta,
        from: from,
        to: to,
        graphType: SegmentMetric.Graph.DayXNumOfVisitorLineChart
    };
    var dateXNumberOfVisitorsBarChartMetric = new Metric(
        segment.companyId,
        collectionMeta,
        from,
        to,
        SegmentMetric.Graph.DayXNumOfVisitorLineChart,
        dateXNumberOfVisitorsBarChartData);
    Metrics.upsert(dateXNumberOfVisitorsBarChartMetricSelector, dateXNumberOfVisitorsBarChartMetric);

    var otherSegmentChartData = SegmentMetric.prepareVisitorOtherSegmentsBarChartData(atTime, segment, visitorIds);
    var otherSegmentChartSelector = {
        companyId: segment.companyId,
        collectionMeta: collectionMeta,
        from: from,
        to: to,
        graphType: SegmentMetric.Graph.VisitorOtherSegmentsBarChart
    };
    var otherSegmentChartMetrics = new Metric(
        segment.companyId,
        collectionMeta,
        from,
        to,
        SegmentMetric.Graph.VisitorOtherSegmentsBarChart,
        otherSegmentChartData);
    Metrics.upsert(otherSegmentChartSelector, otherSegmentChartMetrics);

    var averageDwellTimeXNumberOfVisitorHistogramData = SegmentMetric.prepareAverageDwellTimeBucketXNumOfVisitorHistogramData(visitsEngine);
    var averageDwellTimeXNumberOfVisitorHistogramSelector = {
        companyId: segment.companyId,
        collectionMeta: collectionMeta,
        from: from,
        to: to,
        graphType: SegmentMetric.Graph.AverageDwellTimeBucketXNumOfVisitorHistogram
    };
    var averageDwellTimeXNumberOfVisitorHistogramMetrics = new Metric(
        segment.companyId,
        collectionMeta,
        from,
        to,
        SegmentMetric.Graph.AverageDwellTimeBucketXNumOfVisitorHistogram,
        averageDwellTimeXNumberOfVisitorHistogramData
    );
    Metrics.upsert(averageDwellTimeXNumberOfVisitorHistogramSelector, averageDwellTimeXNumberOfVisitorHistogramMetrics);

    var dwellTimePunchCardData = SegmentMetric.prepareDwellTimeInTimeFrameBubbleData(visitsEngine);
    var dwellTimePunchCardSelector = {
        companyId: segment.companyId,
        collectionMeta: collectionMeta,
        from: from,
        to: to,
        graphType: SegmentMetric.Graph.DwellTimePunchCard
    };
    var dwellTimePunchCardMetrics = new Metric(
        segment.companyId,
        collectionMeta,
        from,
        to,
        SegmentMetric.Graph.DwellTimePunchCard,
        dwellTimePunchCardData
    );
    Metrics.upsert(dwellTimePunchCardSelector, dwellTimePunchCardMetrics);

    var numberOfVisitsXNumberOfVisitorsBarChartData = SegmentMetric.prepareNumberOfVisitorsXNumberOfVisitsHistogramData(visitsEngine);
    var numberOfVisitsXNumberOfVisitorsBarChartSelector = {
        companyId: segment.companyId,
        collectionMeta: collectionMeta,
        from: from,
        to: to,
        graphType: SegmentMetric.Graph.NumberOfVisitXNumberOfVisitorsBarChart
    }
    var numberOfVisitsXNumberOfVisitorsBarChartMetric = new Metric(
        segment.companyId,
        collectionMeta,
        from,
        to,
        SegmentMetric.Graph.NumberOfVisitXNumberOfVisitorsBarChart,
        numberOfVisitsXNumberOfVisitorsBarChartData);
    Metrics.upsert(numberOfVisitsXNumberOfVisitorsBarChartSelector, numberOfVisitsXNumberOfVisitorsBarChartMetric);

    var enteredAtPunchCardData = SegmentMetric.prepareNumberOfVisitsPunchCardData(visitsEngine, 'ENTER');
    var enteredAtPunchCardSelector = {
        companyId: segment.companyId,
        collectionMeta: collectionMeta,
        from: from,
        to: to,
        graphType: SegmentMetric.Graph.EnteredAtPunchCard
    }
    var enteredAtPunchCardMetric = new Metric(
        segment.companyId,
        collectionMeta,
        from,
        to,
        SegmentMetric.Graph.EnteredAtPunchCard,
        enteredAtPunchCardData);
    Metrics.upsert(enteredAtPunchCardSelector, enteredAtPunchCardMetric);

    var exitedAtPunchCardData = SegmentMetric.prepareNumberOfVisitsPunchCardData(visitsEngine, 'EXIT');
    var exitedAtPunchCardSelector = {
        companyId: segment.companyId,
        collectionMeta: collectionMeta,
        from: from,
        to: to,
        graphType: SegmentMetric.Graph.ExitedAtPunchCard
    }
    var exitedAtPunchCardMetric = new Metric(
        segment.companyId,
        collectionMeta,
        from,
        to,
        SegmentMetric.Graph.ExitedAtPunchCard,
        exitedAtPunchCardData);
    Metrics.upsert(exitedAtPunchCardSelector, exitedAtPunchCardMetric);

    var visitorTopLocationsBarChartData = SegmentMetric.prepareVisitorTopLocationsBarChartData(installationVisitsEngines);
    var visitorTopLocationsBarChartSelector = {
        companyId: segment.companyId,
        collectionMeta: collectionMeta,
        from: from,
        to: to,
        graphType: SegmentMetric.Graph.VisitorTopLocationsBarChart
    }
    var visitorTopLocationsBarChartMetric = new Metric(
        segment.companyId,
        collectionMeta,
        from,
        to,
        SegmentMetric.Graph.VisitorTopLocationsBarChart,
        visitorTopLocationsBarChartData);
    Metrics.upsert(visitorTopLocationsBarChartSelector, visitorTopLocationsBarChartMetric);

    var dwellTimeTopLocationsBarChartData = SegmentMetric.prepareDwellTimeTopLocationsBarChartData(installationVisitsEngines);
    var dwellTimeTopLocationsBarChartSelector = {
        companyId: segment.companyId,
        collectionMeta: collectionMeta,
        from: from,
        to: to,
        graphType: SegmentMetric.Graph.DwellTimeTopLocationsBarChart
    }
    var dwellTimeTopLocationsBarChartMetric = new Metric(
        segment.companyId,
        collectionMeta,
        from,
        to,
        SegmentMetric.Graph.DwellTimeTopLocationsBarChart,
        dwellTimeTopLocationsBarChartData);
    Metrics.upsert(dwellTimeTopLocationsBarChartSelector, dwellTimeTopLocationsBarChartMetric);

    var numberOfVisitTopLocationsBarChartData = SegmentMetric.prepareNumberOfVisitTopLocationsBarChartData(installationVisitsEngines);
    var numberOfVisitTopLocationsBarChartSelector = {
        companyId: segment.companyId,
        collectionMeta: collectionMeta,
        from: from,
        to: to,
        graphType: SegmentMetric.Graph.NumberOfVisitTopLocationsBarChart
    }
    var numberOfVisitTopLocationsBarChartMetric = new Metric(
        segment.companyId,
        collectionMeta,
        from,
        to,
        SegmentMetric.Graph.NumberOfVisitTopLocationsBarChart,
        numberOfVisitTopLocationsBarChartData);
    Metrics.upsert(numberOfVisitTopLocationsBarChartSelector, numberOfVisitTopLocationsBarChartMetric);
};

/**
 * @param visitsEngine {VisitsEngine}
 *
 * @return {Object} example: {numberOfVisitors: 10, averageDwellTime: 1000, repeatedVisitorPercentage: 0.25}. Note: averageDwellTime in ms
 */
SegmentMetric.prepareListData = function(visitsEngine) {
    var result = {
        numberOfVisitors: visitsEngine.queryTotalVisitorsCount(),
        averageDwellTime: visitsEngine.queryAverageDuration(),
        repeatedVisitorPercentage: visitsEngine.queryRepeatedVisitsPercentage()
    };
    return result;
};

/**
 * @param visitsEngine {VisitsEngine}
 *
 * @return {Object[]} List of objects, each of the format {'date': xxx, 'number of visitors': yyy}
 */
SegmentMetric.prepareNumOfVisitorXTimeBucketLineChartData = function(visitsEngine) {
    var bucketCount = visitsEngine.queryVisitorsCountXBucketSeries(); 
    var bucketStart = visitsEngine.queryBucketsStartSeries();

    // Transform the resultNumber into a frontend-friendly format.
    var result = [];
    for (var i = 0; i < bucketCount.length; i++) {
        result.push({"date": bucketStart[i].format("YYYY-MM-DD"), "number of visitors": bucketCount[i]});
    }
    return result;
}

/**
 *  Performance: O(|SegmentVisitorFlows|);
 *
 *  @param to {Moment} EndDate of period
 *  @param thisSegment {Segment} current segment under calculation
 *  @param visitorIds {String[]} list of visitor ids of thisSegment
 *
 *  @return {Object[]} List of segmentName-percent pairs (sorted by percentage desc) e.g. [{'segmentName': 'Foodie', 'percent': 50}, {'segmentName': 'Shopper', 'percent': 20}]
 */
SegmentMetric.prepareVisitorOtherSegmentsBarChartData = function(to, thisSegment, visitorIds) {

    var thisVisitorIdSet = {};
    _.each(visitorIds, function(visitorId) {
        thisVisitorIdSet[visitorId] = true;
    });
    var result = [];
    var skippedIds = [thisSegment._id, Segments.findEveryVisitorSegment(thisSegment.companyId)._id];
    Segments.findByCompany(thisSegment.companyId, {_id: {$nin: skippedIds}}).map(function(segment) {
        var visitorIdList = SegmentVisitorFlows.getSegmentVisitorIdList(segment._id, to.valueOf());
        var cnt = 0;
        _.each(visitorIdList, function(visitorId) {
            if (thisVisitorIdSet[visitorId] !== undefined) {
                cnt++;
            }
        });
        if (cnt > 0) {
            result.push({segmentName: segment.name, percent: cnt/visitorIds.length});
            }
        });
    result = _.sortBy(result, function(item) {
        return -1 * item['percent'];
    });

    return result;
};

/**
 * Average dwell time is per visitor across different days. For example, if visitor 1 have
 * two encounters on day 1, with duration 10s and 20s. and he comes again on day 2 with duration 30s.
 * The average dwell time for him would be ((10+20) + 30) / 2 = 30
 *
 * @param visitsEngine {VisitsEngine}
 *
 * @return {Object[]} List of result object of the form: {duration: xxx, nuber of visitors: yyy}.
 */
SegmentMetric.prepareAverageDwellTimeBucketXNumOfVisitorHistogramData = function(visitsEngine) {
  var interval = 10 * 60 * 1000; // 10 minutes. TODO: dynamic interval depending on data
  var intervalCounts = visitsEngine.queryVisitorCountsXDurationIntervalSeries(interval);
  var intervalNames = _.map(_.range(intervalCounts.length), function(index) {
    return index * 10; 
  }); 

  // Transform the resultNumber into a frontend-friendly format.
  var result = [];
  for (var i = 0; i < intervalCounts.length; i++) {
      result.push({"duration": intervalNames[i], "number of visitors": intervalCounts[i]});
  }
  return result;
};

/*
 * @param visitsEngine {VisitsEngine}
 *
 * @return {[][]} List of list, each of the format [weekday, hour, value] corresponding to the value of a particular hour on a particular weekday.
 *                 Sample output: [['Sunday', 0, 100], ['Sunday', 1, 200], ..., ..., ['Saturday', 23, 1000]]
 */
SegmentMetric.prepareDwellTimeInTimeFrameBubbleData = function(visitsEngine) {
    var durations = visitsEngine.queryAverageDurationWeeklyHourlySeries("ENTER");
    // Transform the resultNumber into a frontend-friendly format.
    var result = SegmentMetric.format7X24ToFrontend(durations, function(ele) {
      return ele && ele.count ? ele.totalDuration / ele.count : 0;
    });
    return result;
};

/*
 * @param visitsEngine {VisitsEngine}
 */
SegmentMetric.prepareNumberOfVisitorsXNumberOfVisitsHistogramData = function(visitsEngine) {
    var counts = visitsEngine.queryVisitorCountsXVisitsSeries();
    var result = [];
    for (var i = 0; i < counts.length; i++) {
        result.push({"count": i, "number of visitors": counts[i]});
    }
    return result;
};

/*
 *  @param {"Enter"|"Exit"} by Group according to enteredAt or exitedAt
 */
SegmentMetric.prepareNumberOfVisitsPunchCardData = function(visitsEngine, by) {
    result = visitsEngine.queryVisitsCountWeeklyHourlySeries(by)
    result = SegmentMetric.format7X24ToFrontend(result);
    return result;
};

/**
 *  @param installationVisitsEngines {Object[]} Dictionary of installationId => visitsEngine
 *
 *  @return {Object[]} List of object, each of the format {installationName: 'xxx', count: yyy}
 */
SegmentMetric.prepareVisitorTopLocationsBarChartData = function(installationVisitsEngines) {
  var result = [];
  _.each(installationVisitsEngines, function(visitsEngine, iid) {
    var installation = Installations.findOne(iid);
    result.push({installationName: installation.name, count: visitsEngine.queryTotalVisitorsCount()});
  });
  result = _.sortBy(result, function(item) {
    return -1 * item['count'];
  });
  return result;
};

/**
 *  @param installationVisitsEngines {Object[]} Dictionary of installationId => visitsEngine
 *
 *  @return {Object[]} List of object, each of the format {installationName: 'xxx', duration: yyy}
 */
SegmentMetric.prepareDwellTimeTopLocationsBarChartData = function(installationVisitsEngines) {
  var result = [];
  _.each(installationVisitsEngines, function(visitsEngine, iid) {
    var installation = Installations.findOne(iid);
    result.push({installationName: installation.name, duration: visitsEngine.queryAverageDuration()});
  });
  result = _.sortBy(result, function(item) {
    return -1 * item['duration'];
  });
  return result;
}

/**
 *  @param installationVisitsEngines {Object[]} Dictionary of installationId => visitsEngine
 *
 *  @return {Object[]} List of object, each of the format {installationName: 'xxx', count: yyy}
 */
SegmentMetric.prepareNumberOfVisitTopLocationsBarChartData = function(installationVisitsEngines) {
  var result = [];
  _.each(installationVisitsEngines, function(visitsEngine, iid) {
    var installation = Installations.findOne(iid);
    result.push({installationName: installation.name, count: visitsEngine.queryTotalVisitsCount()});
  });
  result = _.sortBy(result, function(item) {
    return -1 * item['count'];
  });
  return result;
}

/**
 * Transform 7x24 bubble array into a frontend-frinedly format for chart
 * 
 * @param array {[7][24]} a 7 x 24 array
 * @returns {Objects[]} Array of objects, each of format [$weekday, $timeOfDay, $value]
 */
SegmentMetric.format7X24ToFrontend = function(array) {
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
