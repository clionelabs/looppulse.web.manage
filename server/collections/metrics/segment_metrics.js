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

    //list
    var listData = SegmentMetric.prepareListData(encounters, visitorIds);
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

    //line chart
    var dateXNumberOfVisitorsBarChartData = SegmentMetric.prepareNumOfVisitorXTimeBucketLineChartData(from, to, SegmentMetric.TimeBucket.Day, encounters);
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

    var interval = 10 * 60 * 1000; // 10 minutes. TODO: dynamic gen bucket
    var averageDwellTimeXNumberOfVisitorHistogramData = SegmentMetric.prepareAverageDwelTimeBucketXNumOfVisitorHistogramData(encounters, interval);
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

    var dwellTimePunchCardData = SegmentMetric.prepareDwellTimeInTimeFrameBubbleData(encounters);
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

    var numberOfVisitsXNumberOfVisitorsBarChartData = SegmentMetric.prepareNumberOfVisitorsXNumberOfVisitsHistogramData(encounters, 1);
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

    var enteredAtPunchCardData = SegmentMetric.prepareEnteredAtPunchCardData(encounters);
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

    var exitedAtPunchCardData = SegmentMetric.prepareExitAtPunchCardData(encounters);
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

};

/**
 * @param encounters {Encounter[]} List of encounters
 * @param visitorIds {Number[]} List of visitor Ids
 *
 * @return {Object} example: {numberOfVisitors: 10, averageDwellTime: 1000, repeatedVisitorPercentage: 0.25}. Note: averageDwellTime in ms
 */
SegmentMetric.prepareListData = function(encounters, visitorIds) {
    console.log("[SegmentMetric] generating list view data");
    var visitorSumDurations = {};
    var visitorDateCount = {};
    var visitorDateSet = {};
    _.each(encounters, function(encounter) {
        var vid = encounter.visitorId;
        var dateStr = encounter.enteredAt.format("YYYY-MM-DD");
        visitorSumDurations[vid] = (visitorSumDurations[vid] || 0) + encounter.duration;
        visitorDateSet[vid] = visitorDateSet[vid] || {};
        if (!visitorDateSet[vid][dateStr]) {
            visitorDateSet[vid][dateStr] = true;
            visitorDateCount[vid] = (visitorDateCount[vid] || 0) + 1;
        }
    });

    var sumAverage = 0;
    _.each(visitorSumDurations, function(sumDuration, visitorId) {
        sumAverage += (sumDuration / visitorDateCount[visitorId]);
    });
    var repeatedCnt = 0;
    _.each(visitorDateCount, function(dateCount, visitorId) {
        if (dateCount > 1) repeatedCnt++;
    });

    var nVisitors = visitorIds.length;
    var result = {
        numberOfVisitors: nVisitors,
        averageDwellTime: nVisitors > 0? sumAverage / nVisitors: 0,
        repeatedVisitorPercentage: nVisitors > 0? repeatedCnt / nVisitors: 0
    };
    return result;
}

/**
 * Performance = O(|encounters|)
 * @param from {Unix Timestamp} startTime of the graph
 * @param to {Unix Timestamp} endTime of the graph
 * @param bucketSize {SegmentMetric.TimeBucket} interval of x axis in terms of "Hours", "Days", "Weeks" and "Months
 * @param encounters {Encounter[]} List of encounters
 *
 * @return {Object[]} List of objects, each of the format {'date': xxx, 'number of visitors': yyy}
 */
SegmentMetric.prepareNumOfVisitorXTimeBucketLineChartData = function(from, to, bucketSize, encounters) {
    console.log("[SegmentMetric] generating number of visitors against time bucket histogram");
    from = moment(moment(from).format("YYYY-MM-DD"));
    to = to? moment(to): moment();
    var format = SegmentMetric.TimeBucketMomentShortHands[bucketSize];

    // resultNumber {Number[]} List of number corresponds to the y-value at each bucket
    var visitorSet = [];
    var resultNumber = {};
    _.each(encounters, function(encounter) {
        var index = encounter.enteredAt.format(format);
        visitorSet[index] = visitorSet[index] || {};
        if (!visitorSet[index][encounter.visitorId]) {
            visitorSet[index][encounter.visitorId] = true;
            resultNumber[index] = (resultNumber[index] || 0) + 1;
        }
    });
    var maxLength = to.diff(from, bucketSize);
    for (var i = 1; i <= maxLength; i++ ) {
        var index = moment(from).add(i, bucketSize).format(format);
        resultNumber[index] = resultNumber[index] ? resultNumber[index] : 0;
    }

    // Transform the resultNumber into a frontend-friendly format.
    var result = [];
    _.each(resultNumber, function(value, key) {
        result.push({"date": key, "number of visitors": value});
    });
    return result;
};

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
    console.log("[SegmentMetric] generating other segment percentage var chart");

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

    return result;
};

/**
 * Performance: O(|encounters|)
 *
 * Average dwell time is per visitor across different days. For example, if visitor 1 have
 * two encounters on day 1, with duration 10s and 20s. and he comes again on day 2 with duration 30s.
 * The average dwell time for him would be ((10+20) + 30) / 2 = 30
 *
 * @param encounters {Encounter[]} List of encounters
 * @param interval {Number} interval of x-axis in ms
 *
 *  @return {Object[]} List of result object of the form: {duration: xxx, nuber of visitors: yyy}.
 */
SegmentMetric.prepareAverageDwelTimeBucketXNumOfVisitorHistogramData = function(encounters, interval) {
    console.log("[SegmentMetric] preparing average dwell time again number of Visitors histogram");

    // Compute resultNumber {Number[]} as a List of number corresponds to the y-value at each bucket
    var visitorSumDurations = {};
    var visitorDateCount = {};
    var visitorDateSet = {};
    _.each(encounters, function(encounter) {
        var vid = encounter.visitorId;
        var dateStr = encounter.enteredAt.format("YYYY-MM-DD");
        visitorSumDurations[vid] = (visitorSumDurations[vid] || 0) + encounter.duration;
        visitorDateSet[vid] = visitorDateSet[vid] || {};
        if (!visitorDateSet[vid][dateStr]) {
            visitorDateSet[vid][dateStr] = true;
            visitorDateCount[vid] = (visitorDateCount[vid] || 0) + 1;
        }
    });
    var resultNumber = [];
    _.each(visitorSumDurations, function(sumDuration, visitorId) {
        var index = Math.floor(sumDuration / visitorDateCount[visitorId] / interval);
        resultNumber[index] = (resultNumber[index] || 0) + 1;
    });
    resultNumber = SegmentMetric.padArray(resultNumber, resultNumber.length);

    // Transform the resultNumber into a frontend-friendly format.
    var result = [];
    _.each(resultNumber, function(value, key) {
        // TODO: make more sense for duration to be in ms (agrees with the input param), and then transform it in frontend display
        //       OR change the input param to be in minute
        result.push({'duration': key / (60 * 1000), 'number of visitors': value}); //duration in minutes
    });

    return result;
};

/**
 *  Performance: O(|encounters|)
 *
 *  @param encounters {Encounter[]} List of encounters
 *  @return {[][]} List of list, each of the format [weekday, hour, value] corresponding to the value of a particular hour on a particular weekday.
 *                 Sample output: [['Sunday', 0, 100], ['Sunday', 1, 200], ..., ..., ['Saturday', 23, 1000]]
 */
SegmentMetric.prepareDwellTimeInTimeFrameBubbleData = function(encounters) {
    console.log("[SegmentMetric] preparing dwell time in time frame bubble data");

    // 7x24 array corresponding to the values on the bubble graph. e.g. durations[0][0] means the value of Sunday 00:00 - 01:00, durations[6][13] means Saturday 13:00-:14:00
    var durations = SegmentMetric.createEmptyBubbleArray();
    _.each(encounters, function(encounter) {
        if (!durations[encounter.enteredAt.day()][encounter.enteredAt.hour()]) {
            durations[encounter.enteredAt.day()][encounter.enteredAt.hour()] = {
                totalDuration : 0,
                count : 0
            }
        }
        durations[encounter.enteredAt.day()][encounter.enteredAt.hour()].totalDuration += encounter.duration;
        durations[encounter.enteredAt.day()][encounter.enteredAt.hour()].count++;
    });

    // Transform the resultNumber into a frontend-friendly format.
    var result = SegmentMetric.format7X24ToFrontend(durations, function(ele) {
      return ele && ele.count ? ele.totalDuration / ele.count : 0;
    });
    return result;
};

/**
 * performance: O(|Encounters| + |Visitors|)
 *
 * Note: multiple encounters of a visitor on the same day doesn't count as repeated visits
 *
 * @param encounters {Encounter[]} List of encounters
 * @param interval {Number} Interval of x-axis (in # of days)
 */
SegmentMetric.prepareNumberOfVisitorsXNumberOfVisitsHistogramData = function(encounters, interval) {
    console.log("[SegmentMetric] preparing number of visitors against repeated visits");
    var visitorDateCount = {};
    var visitorDateSet = {};
    _.each(encounters, function(encounter) {
        var vid = encounter.visitorId;
        var dateStr = encounter.enteredAt.format("YYYY-MM-DD");
        visitorDateSet[vid] = visitorDateSet[vid] || {};
        if (!visitorDateSet[vid][dateStr]) {
            visitorDateSet[vid][dateStr] = true;
            visitorDateCount[vid] = (visitorDateCount[vid] || 0) + 1;
        }
    });
    var resultNumber = [];
    _.each(visitorDateCount, function(dateCount, visitorId) {
        var index = Math.floor(dateCount/ interval);
        resultNumber[index] = (resultNumber[index] || 0) + 1;
    });
    resultNumber = SegmentMetric.padArray(resultNumber, resultNumber.length);

    // Transform the resultNumber into a frontend-friendly format.
    var result = [];
    _.each(resultNumber, function(resultCount, count) {
        result.push({ "count" : count, "number of visitors" : resultCount});
    })
    return result;
};

/**
 *  Performance: O(|encounters|)
 *
 *  @param encounters {Encounter[]} List of encounters
 *  @return {[][]} List of list, each of the format [weekday, hour, value] corresponding to the value of a particular hour on a particular weekday.
 *                 Sample output: [['Sunday', 0, 100], ['Sunday', 1, 200], ..., ..., ['Saturday', 23, 1000]]
 */
SegmentMetric.prepareEnteredAtPunchCardData = function(encounters) {
    console.log("[SegmentMetric] preparing number of visits in time frame bubble data");
    // 7x24 array corresponding to the values on the bubble graph. e.g. result[0][0] means the value of Sunday 00:00 - 01:00, result[6][13] means Saturday 13:00-:14:00
    var result = SegmentMetric.createEmptyBubbleArray();
    _.each(encounters, function(encounter) {
        result[encounter.enteredAt.day()][encounter.enteredAt.hour()]++;
    });

    // Transform the resultNumber into a frontend-friendly format.
    result = SegmentMetric.format7X24ToFrontend(result);
    return result;
};

/**
 *  Performance: O(|encounters|)
 *
 *  @param encounters {Encounter[]} List of encounters
 *  @return {[][]} List of list, each of the format [weekday, hour, value] corresponding to the value of a particular hour on a particular weekday.
 *                 Sample output: [['Sunday', 0, 100], ['Sunday', 1, 200], ..., ..., ['Saturday', 23, 1000]]
 */
SegmentMetric.prepareExitAtPunchCardData = function(encounters) {
    console.log("[SegmentMetric] preparing number of visits in time frame bubble data");
    // 7x24 array corresponding to the values on the bubble graph. e.g. result[0][0] means the value of Sunday 00:00 - 01:00, result[6][13] means Saturday 13:00-:14:00
    var result = SegmentMetric.createEmptyBubbleArray();
    _.each(encounters, function(encounter) {
        result[encounter.exitedAt.day()][encounter.exitedAt.hour()]++;
    });

    // Transform the resultNumber into a frontend-friendly format.
    result = SegmentMetric.format7X24ToFrontend(result);
    return result;
};

/**
 * Substitue the null value of an array by zero
 */
SegmentMetric.padArray = function(arr, size) {
    var result = [];
    for (var i = 0; i < size; i++) {
        result[i] = arr[i]? arr[i]: 0;
    }
    return result;
}

/**
 * Create an empty 7 x 24 array with zero
 */
SegmentMetric.createEmptyBubbleArray = function() {
    var result = [];
    for (var i = 0; i < 7; i++) {
        result[i] = [];
        for (var j = 0; j < 24; j++) {
            result[i][j] = 0;
        }
    }
    return result;
}

/**
 * Transform 7x24 bubble array into a frontend-frinedly format for chart
 * 
 * @param array {[7][24]} a 7 x 24 array
 * @param [func] {Function} An optional function to transform the element. If not set, then direct copy the element.
 * @returns {Objects[]} Array of objects, each of format [$weekday, $timeOfDay, $value]
 */
SegmentMetric.format7X24ToFrontend = function(array, func) {
    //TODO start refactor to better encapsulate, perhaps pass to d3?
    var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var result = [];
    for (var i = 0; i < 7; i++) {
        for (var j = 0; j < 24; j++) {
            var r = func? func(array[i][j]): array[i][j];
            result.push([weekdays[i], j, r]);
        }
    }
    //TODO end
    return result;
}

