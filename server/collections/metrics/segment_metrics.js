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
 *
 * @param segment
 * @param from timestamp as the moment cannot be passed
 * @param to
 */
SegmentMetric.generateAllGraph = function(segment, from, to) {
    console.log("[SegmentMetric] generating segment " + segment._id + " metric data");
    var atTime = moment().valueOf();
    var visitorIds = SegmentVisitorFlows.getSegmentVisitorIdList(segment, atTime);
    var encounters = Encounters.findClosedByVisitorsInTimePeriod(visitorIds, from, to).fetch();
    //TODO get visitors: [segmentIds] kim's work
    var visitorInSegmentsHash = {};
    //TODO get visitors: [tags]
    var visitorHasTagsHash = {};

    //list
    var numberOfVisitors = visitorIds.length;
    var listData = SegmentMetric.prepareListData(encounters, numberOfVisitors);
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

    SegmentMetric.prepareVisitorsTagsBarChartData(visitorHasTagsHash);

    //TODO dynamic gen bucket
    var averageDwellTimeXNumberOfVisitorHistogramData = SegmentMetric.prepareAverageDwelTimeBucketXNumOfVisitorHistogramData(encounters);
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
        graphType: SegmentMetric.Graph.DwellTimeInTimeFrameBubble
    };
    var dwellTimePunchCardMetrics = new Metric(
        segment.companyId,
        collectionMeta,
        from,
        to,
        SegmentMetric.Graph.DwellTimeInTimeFrameBubble,
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

    SegmentMetric.prepareNumberOfVisitsInTimeFrameBubbleData(encounters);

};

SegmentMetric.prepareListData = function(encounters, numberOfVisitors) {
    console.log("[SegmentMetric] generating list view data");
    //console.log(JSON.stringify(encounters));
    var listData = {
        numberOfVisitors : numberOfVisitors,
        averageDwellTime : 0,
        repeatedVisitorPercentage : 0
    };

    if (!encounters.length) {
        return listData;
    } else {
        var grpByVisitors = _.groupBy(encounters, function (e) {
        return e.visitorId;
        });
        //console.log("1 " + JSON.stringify(grpByVisitors));
        grpByVisitors = _.map(grpByVisitors, function(visitors, id) {
            var result = {};
            var groupedEncounters = _.groupBy(visitors, function(encounter) {
                return moment(encounter.enteredAt).format("YYYY-MM-DD");
            });
            result[id.toString()] = groupedEncounters;
            return result;
        });
        //convert back to hash
        grpByVisitors = _.reduce(grpByVisitors, function(memo, visitor) {
            return _.extend(memo, visitor);
        }, {});
        //console.log("2 " + JSON.stringify(grpByVisitors));

        listData.numberOfVisitors =  _.size(grpByVisitors);
        //console.log("After calculating number of visitors: " + JSON.stringify(listData));

        var getRepeated = function(encountersByDate) {
            return _.size(encountersByDate) > 1;
        };
        var numberOfRepeatedVisitor = _.size(_.filter(grpByVisitors, getRepeated));
        listData.repeatedVisitorPercentage = numberOfRepeatedVisitor / listData.numberOfVisitors;
        //console.log("After calculating percentage of repeated visit" + JSON.stringify(listData));

        var getTotalDwellTime = function(encounters) {
            return _.reduce(encounters, function(memo, encounter) {
                return memo + encounter.duration;
            }, 0);
        };
        var getAverageDwellTimePerDay = function(encountersByDate) {
            return _.reduce(encountersByDate, function (memo, encounters) {
               return memo + getTotalDwellTime(encounters);
            }, 0) / _.size(encountersByDate);
        }
        var getAverageDwellTimePerVisitor = function(visitorEncountersByDate) {
            return _.reduce(visitorEncountersByDate, function (memo, encountersByDate) {
                    return memo + getAverageDwellTimePerDay(encountersByDate);
                }, 0) / _.size(visitorEncountersByDate);
        }
        listData.averageDwellTime = getAverageDwellTimePerVisitor(grpByVisitors);
        console.log(JSON.stringify(listData));

        return listData;
    }
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
 * Performance = O(|encounters|)
 * @param from startTime (timestamp) of the graph
 * @param to endTime (timestamp) of the graph
 * @param bucketSize interval of x axis
 * @param encounters List of encounters
 * return List of numbers of corresponding to the values on the y-axis, e.g. [1, 2, 0, 0, 1]
 */
SegmentMetric.prepareNumOfVisitorXTimeBucketLineChartData = function(from, to, bucketSize, encounters) {
    console.log("[SegmentMetric] generating number of visitors against time bucket histogram");
    from = moment(moment(from).format("YYYY-MM-DD"));
    var format = SegmentMetric.TimeBucketMomentShortHands[bucketSize];

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
    var tto = null;
    if (!to) {
        tto = moment();
    } else {
        tto = moment(to);
    }

    var result = [];

    var maxLength = tto.diff(from, bucketSize);
    for (var i = 1; i <= maxLength; i++ ) {
        var index = moment(from).add(i, bucketSize).format(format);
        resultNumber[index] = resultNumber[index] ? resultNumber[index] : 0;
        result.push({ "date" : index, "number of visitors" : resultNumber[index]});
    }

    console.log("[SegmentMetric] result: ", JSON.stringify(result));
    return result;
};

/**
 *  Performance: O(|SegmentVisitorFlows|);
 *
 *  @param to EndDate (moment object) of period
 *  @param thisSegment current segment under calculation
 *  @param visitorIds list of visitor ids of thisSegment
 *  @return List of segmentName, percent pairs as dictionary. e.g. [{'segmentName': 'Foodie', 'percent': 50}, {'segmentName': 'Shopper', 'percent': 20}] 
 */
SegmentMetric.prepareVisitorOtherSegmentsBarChartData = function(to, thisSegment, visitorIds) {
    console.log("[SegmentMetric] generating other segment percentage var chart");

    var thisVisitorIdSet = {};
    _.each(visitorIds, function(visitorId) {
        thisVisitorIdSet[visitorId] = true;
    });
    var result = [];
    Segments.find().map(function(segment) {
        if (segment._id === thisSegment._id) return;
        var visitorIdList = SegmentVisitorFlows.getSegmentVisitorIdList(segment, to.valueOf());
        var cnt = 0;
        _.each(visitorIdList, function(visitorId) {
            if (thisVisitorIdSet[visitorId] !== undefined) {
                cnt++;
            }
        });
        result.push({segmentName: segment.name, percent: cnt/visitorIds.length});
    });
    console.log("[SegmentMetric] result: ", JSON.stringify(result));
    return result;
};

SegmentMetric.prepareVisitorsTagsBarChartData = function(visitorHasTagsHash) {
    console.log("[SegmentMetric] generating visitors tag percentage bar chart");
    //TODO add impl
};

/**
 * Performance: O(|encounters|)
 *
 * Average dwell time is per visitor across different days. For example, if visitor 1 have
 * two encounters on day 1, with duration 10s and 20s. and he comes again on day 2 with duration 30s.
 * The average dwell time for him would be ((10+20) + 30) / 2 = 30
 *
 * @param encounters List of encounters
 * @param interval Interval of the x-axis (unit of ms)
 * return List of numbers of corresponding to the values on the y-axis, e.g. [1, 2, 0, 0, 1]
 */
SegmentMetric.prepareAverageDwelTimeBucketXNumOfVisitorHistogramData = function(encounters) {

    console.log("[SegmentMetric] preparing average dwell time again number of Visitors histogram");

    var interval = 10 * 60 * 1 * 1000; //TODO dynamic

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

    var from = 0;
    var to = from + 10; //TODO dynamic
    var result = [];
    _.each(resultNumber, function(r) {
        result.push({
            duration : from,
            "number of visitors" : r
        });
        from = to;
        to = from + 10;
    })
    console.log("[SegmentMetric] result: ", JSON.stringify(result));
    return result;
};

/**
 *  Performance: O(|encounters|)
 *
 *  @param encounters List of encounters
 *  @return 7x24 array corresponding to the values on the bubble graph. e.g. result[0][0] means the value of Sunday 00:00 - 01:00, result[6][13] means Saturday 13:00-:14:00 
 */
SegmentMetric.prepareDwellTimeInTimeFrameBubbleData = function(encounters) {
    console.log("[SegmentMetric] preparing dwell time in time frame bubble data");

    var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    var avgDurations = SegmentMetric.createEmptyBubbleArray();
    var cntDurations = SegmentMetric.createEmptyBubbleArray();
    _.each(encounters, function(encounter) {
        avgDurations[encounter.enteredAt.day()][encounter.enteredAt.hour()] += encounter.duration;
        cntDurations[encounter.enteredAt.day()][encounter.enteredAt.hour()] ++;
    });

    var result = [];

    for (var i = 0; i < 7; i++) {
        for (var j = 0; j < 24; j++) {
            if (avgDurations[i][j] !== 0) {
                avgDurations[i][j] /= cntDurations[i][j];
            }
            result.push([weekdays[i], j, avgDurations[i][j]]);
        }
    }
    console.log("[SegmentMetric] result: ", JSON.stringify(result));



    return result;
};

/**
 * performance: O(|Encounters| + |Visitors|)
 *
 * Note: multiple encounters of a visitor on the same day doesn't count as repeated visits
 *
 * @param encounters
 * @param interval Interval of x-axis (in # of days)
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

    var result = [];
    _.each(resultNumber, function(resultCount, count) {
        result.push({ "count" : count, "number of visitors" : resultCount});
    })
    console.log("[SegmentMetric] result: ", JSON.stringify(result));
    return result;
};

/**
 *  Performance: O(|encounters|)
 *
 *  @param encounters List of encounters
 *  @return 7x24 array corresponding to the values on the bubble graph. e.g. result[0][0] means the value of Sunday 00:00 - 01:00, result[6][13] means Saturday 13:00-:14:00 
 */
SegmentMetric.prepareNumberOfVisitsInTimeFrameBubbleData = function(encounters) {
    console.log("[SegmentMetric] preparing number of visits in time frame bubble data");
    var result = SegmentMetric.createEmptyBubbleArray();
    _.each(encounters, function(encounter) {
        result[encounter.enteredAt.day()][encounter.enteredAt.hour()]++;
    });
    console.log("[SegmentMetric] result: ", JSON.stringify(result));
    return result;
};
