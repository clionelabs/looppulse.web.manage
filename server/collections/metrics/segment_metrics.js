SegmentMetrics = {};

SegmentMetrics.findList = function() {
    var companyId = Companies.findOne({ownedByUserId : this.userId})._id;
    console.log("[SegmentMetric] companyId=" + companyId);
    return Metrics.find({'collectionMeta.type': "segment", companyId : companyId, graphType : SegmentMetric.Graph.List});
};

SegmentMetric = {};

SegmentMetric.Graph = {};
SegmentMetric.Graph.List = "list";

SegmentMetric.Graph.TimeBucketXNumOfVisitorHistogram = "timeBucketXNumberOfVisitorHistogram";
SegmentMetric.Graph.VisitorOtherSegmentsBarChart = "visitorOtherSegmentsBarChart";
SegmentMetric.Graph.VisitorsTagsBarChartData = "visitorsTagsBarChart";

SegmentMetric.Graph.AverageDwellTimeBucketXNumOfVisitorHistogram = "averageDwellTimeBucketXNumOfVisitorHistogram";
SegmentMetric.Graph.DwellTimeInTimeFrameBubble = "dwellTimeInTimeFrameBubble";

SegmentMetric.Graph.NumberOfVisitXNumberOfVisitorsHistogram = "numberOfVisitXNumberOfVisitorsHistogram";
SegmentMetric.Graph.NumberOfVisitInTimeFrameBubble = "numberOfVisitInTimeFrameBubble";

SegmentMetric.TimeBucket = {};
SegmentMetric.TimeBucket.Hour = "hour";
SegmentMetric.TimeBucket.Day = "day";
SegmentMetric.TimeBucket.Week = "week";
SegmentMetric.TimeBucket.Month = "month";

SegmentMetric.TimeBucketMomentShortHands = {};
SegmentMetric.TimeBucketMomentShortHands[SegmentMetric.TimeBucket.Hour] = 'h';
SegmentMetric.TimeBucketMomentShortHands[SegmentMetric.TimeBucket.Day] = 'd';
SegmentMetric.TimeBucketMomentShortHands[SegmentMetric.TimeBucket.Week] = 'w';
SegmentMetric.TimeBucketMomentShortHands[SegmentMetric.TimeBucket.Month] = 'M';

SegmentMetric.generateAllGraph = function(segment, from, to) {
    console.log("[SegmentMetric] generating segment " + segment._id + " metric data");
    var atTime = moment().valueOf();
    var visitorIds = segment.getVisitorIdList(atTime);
    var encounters = Encounters.findClosedByVisitorsInTimePeriod(visitorIds, from, to).fetch();
    //TODO get visitors: [segmentIds] kim's work
    var visitorInSegmentsHash = {};
    //TODO get visitors: [tags]
    var visitorHasTagsHash = {};

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


    SegmentMetric.prepareTimeBucketXNumOfVisitorHistogramData(from, to, SegmentMetric.TimeBucket.Week, encounters);
    SegmentMetric.prepareVisitorOtherSegmentsBarChartData(atTime, segment, visitorIds);
    SegmentMetric.prepareVisitorsTagsBarChartData(visitorHasTagsHash);

    SegmentMetric.prepareAverageDwelTimeBucketXNumOfVisitorHistogramData(encounters, 1 * 1000);
    SegmentMetric.prepareDwellTimeInTimeFrameBubbleData(encounters);

    SegmentMetric.prepareNumberOfVisitXNumberOfVisitorsHistogramData(encounters, 1);
    SegmentMetric.prepareNumberOfVisitsInTimeFrameBubbleData(encounters);

};

SegmentMetric.prepareListData = function(encounters, numberOfVisitors) {
    console.log("[SegmentMetric] generating list view data");
    console.log(JSON.stringify(encounters));
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
        console.log("1 " + JSON.stringify(grpByVisitors));
        console.log("");
        grpByVisitors = _.map(grpByVisitors, function(visitors, id) {
            var result = {};
            var groupedEncounters = _.groupBy(visitors, function(encounter) {
                return moment(encounter.enteredAt).format("YYYY-MM-DD");
            });
            result[id.toString()] = groupedEncounters;
            return result;
        });
        console.log("1.5 " + JSON.stringify(grpByVisitors));
        console.log("");
        //convert back to hash
        grpByVisitors = _.reduce(grpByVisitors, function(memo, visitor) {
            return _.extend(memo, visitor);
        }, {});
        console.log("2 " + JSON.stringify(grpByVisitors));

        listData.numberOfVisitors =  _.size(grpByVisitors);
        console.log("After calculating number of visitors: " + JSON.stringify(listData));

        var getRepeated = function(encountersByDate) {
            return _.size(encountersByDate) > 1;
        };
        var numberOfRepeatedVisitor = _.size(_.filter(grpByVisitors, getRepeated));
        listData.repeatedVisitorPercentage = numberOfRepeatedVisitor / listData.numberOfVisitors;
        console.log("After calculating percentage of repeated visit" + JSON.stringify(listData));

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
 * substitue the null value of an array by zero
 */
SegmentMetric.padArray = function(arr, size) {
    var result = [];
    for (var i = 0; i < size; i++) {
        result[i] = arr[i]? arr[i]: 0;
    }
    return result;
}

/**
 * Create an empty 24 x 7 array with zero
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
 * @param from startTime (moment object) of the graph
 * @param to endTime (moment object) of the graph
 * @param bucketSize interval of x axis
 * @param encounters List of encounters
 * return List of numbers of corresponding to the values on the y-axis, e.g. [1, 2, 0, 0, 1]
 */
SegmentMetric.prepareTimeBucketXNumOfVisitorHistogramData = function(from, to, bucketSize, encounters) {
    console.log("[SegmentMetric] generating time bucket against number of visitors histogram");
    interval = SegmentMetric.TimeBucketMomentShortHands[bucketSize];

    var visitorSet = [];
    var result = [];
    _.each(encounters, function(encounter) {
        var index = encounter.enteredAt.diff(from, interval);
        visitorSet[index] = visitorSet[index] || {};
        if (!visitorSet[index][encounter.visitorId]) {
            visitorSet[index][encounter.visitorId] = true;
            result[index] = (result[index] || 0) + 1;
        }
    });
    result = SegmentMetric.padArray(result, to === null? result.length: to.diff(from, interval));
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
    var segmentsCount = {};
    var totalCount = 0;
    _.each(visitorIds, function(visitorId) {
        var segmentIdList = Visitors.findOne({_id: visitorId}).getSegmentIdList(to.valueOf());
        _.each(segmentIdList, function(id) {
            if (id === thisSegment._id) return;
            totalCount++;
            segmentsCount[id] = (segmentsCount[id] || 0) + 1;
        });
    });
    var result = [];
    _.each(segmentsCount, function(cnt, segmentId) {
        result.push({segmentName: Segments.findOne({_id: segmentId}).name, percent: cnt/totalCount});
    });
    console.log("[SegmentMetric] result: ", JSON.stringify(result));
    return result;
};

SegmentMetric.prepareVisitorsTagsBarChartData = function(visitorHasTagsHash) {
    console.log("[SegmentMetric] generating visitors tag percentage bar chart");
    //TODO add impl
};

/**
 * @param encounters List of encounters
 * @param interval Interval of the x-axis (unit of ms)
 * return List of numbers of corresponding to the values on the y-axis, e.g. [1, 2, 0, 0, 1]
 */
SegmentMetric.prepareAverageDwelTimeBucketXNumOfVisitorHistogramData = function(encounters, interval) {
    console.log("[SegmentMetric] preparing average dwell time again number of Visitors histogram");

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
    var result = [];
    _.each(visitorSumDurations, function(sumDuration, visitorId) {
        var index = Math.floor(sumDuration / visitorDateCount[visitorId] / interval);
        result[index] = (result[index] || 0) + 1;
    });
    result = SegmentMetric.padArray(result, result.length); 
    console.log("[SegmentMetric] result: ", JSON.stringify(result));
    return result;
};

/**
 *  Performance: O(|encounters|)
 *
 *  @param encounters List of encounters
 *  @return 24x7 array corresponding to the values on the bubble graph. e.g. result[0][0] means the value of Sunday 00:00 - 01:00, result[6][13] means Saturday 13:00-:14:00 
 */
SegmentMetric.prepareDwellTimeInTimeFrameBubbleData = function(encounters) {
    console.log("[SegmentMetric] preparing dwell time in time frame bubble data");
    var avgDurations = SegmentMetric.createEmptyBubbleArray();
    var cntDurations = SegmentMetric.createEmptyBubbleArray();
    _.each(encounters, function(encounter) {
        avgDurations[encounter.enteredAt.day()][encounter.enteredAt.hour()] += encounter.duration;
        cntDurations[encounter.enteredAt.day()][encounter.enteredAt.hour()] ++;
    });
    for (var i = 0; i < 7; i++) {
        for (var j = 0; j < 24; j++) {
            if (avgDurations[i][j] !== 0) {
                avgDurations[i][j] /= cntDurations[i][j];
            }  
        }
    }
    console.log("[SegmentMetric] result: ", JSON.stringify(avgDurations));
    return avgDurations;
};

/**
 * performance: O(|Encounters| + |Visitors|)
 *
 * @param encounters
 * @param interval Interval of x-axis (in # of days)
 */
SegmentMetric.prepareNumberOfVisitXNumberOfVisitorsHistogramData = function(encounters, interval) {
    console.log("[SegmentMetric] preparing number of visit against number of visitors");
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
    var result = [];
    _.each(visitorDateCount, function(dateCount, visitorId) {
        var index = Math.floor(dateCount/ interval);
        result[index] = (result[index] || 0) + 1;
    });
    result = SegmentMetric.padArray(result, result.length); 
    console.log("[SegmentMetric] result: ", JSON.stringify(result));
    return result;
};

/**
 *  Performance: O(|encounters|)
 *
 *  @param encounters List of encounters
 *  @return 24x7 array corresponding to the values on the bubble graph. e.g. result[0][0] means the value of Sunday 00:00 - 01:00, result[6][13] means Saturday 13:00-:14:00 
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
