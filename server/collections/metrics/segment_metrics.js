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

SegmentMetric.generateAllGraph = function(segment, from, to) {
    var visitorIds = segment.getVisitorIdList(moment().valueOf());
    var encounters = Encounters.findClosedByVisitorsInTimePeriod(visitorIds, from, to);
    //TODO get visitors: [segmentIds] kim's work
    var visitorInSegmentsHash = {};
    //TODO get visitors: [tags]
    var visitorHasTagsHash = {};

    var listData = SegmentMetric.prepareListData(encounters);
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


    SegmentMetric.prepareTimeBucketXNumOfVisitorHistogramData(SegmentMetric.TimeBucket.Week, encounters);
    SegmentMetric.prepareVisitorOtherSegmentsBarChartData(visitorInSegmentsHash);
    SegmentMetric.prepareVisitorsTagsBarChartData(visitorHasTagsHash);

    SegmentMetric.prepareAverageDwelTimeBucketXNumOfVisitorHistogramData(encounters);
    SegmentMetric.prepareDwellTimeInTimeFrameBubbleData(encounters);

    SegmentMetric.prepareNumberOfVisitXNumberOfVisitorsHistogramData(encounters);
    SegmentMetric.prepareNumberOfVisitsInTimeFrameBubbleData(encounters);

};

SegmentMetric.prepareListData = function(encounters) {
    console.log("[SegmentMetric] generating list view data");
    var listData = {
        numberOfVisitors : 0,
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

SegmentMetric.prepareTimeBucketXNumOfVisitorHistogramData = function(bucketSize, encounters) {
    console.log("[SegmentMetric] generating time bucket against number of visitors histogram");
    //TODO add impl
};

SegmentMetric.prepareVisitorOtherSegmentsBarChartData = function(visitorInSegmentsHash) {
    console.log("[SegmentMetric] generating other segment percentage var chart");
    //TODO add impl
};

SegmentMetric.prepareVisitorsTagsBarChartData = function(visitorHasTagsHash) {
    console.log("[SegmentMetric] generating visitors tag percentage bar chart");
    //TODO add impl
};

SegmentMetric.prepareAverageDwelTimeBucketXNumOfVisitorHistogramData = function(encounters) {
    console.log("[SegmentMetric] preparing average dwell time again number of Visitors histogram");
    //TODO add impl

};

SegmentMetric.prepareDwellTimeInTimeFrameBubbleData = function(encounters) {
    console.log("[SegmentMetric] preparing dwell time in time frame bubble data");
    //TODO add impl
};

SegmentMetric.prepareNumberOfVisitXNumberOfVisitorsHistogramData = function(encounters) {
    console.log("[SegmentMetric] preparing number of visit against number of visitors");
    //TODO add impl
};

SegmentMetric.prepareNumberOfVisitsInTimeFrameBubbleData = function(encounters) {
    console.log("[SegmentMetric] preparing number of visits in time frame bubble data");
    //TODO add impl
};
