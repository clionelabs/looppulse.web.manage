/*
 * The main objective of this class is to construct a convenient data structure that supports efficient queries on computing graphs metrics.
 *
 * Terminologies:
 *   visit: A logical group of multiple encounters, which we considered are generated from the same customer visit in a physical locations
 *     i) visit duration = sum of all encounters duration
 *     ii) visit entered time = earliest entered time among all encounters
 *     iii) visit exited time = latest exited time among all encounters 
 *
 *   bucket: A bucket is the unit of time period, in which all encounters fall into a single visit
 *   bucketSize: Similarly, bucketSize is the period length of a bucket
 *     i) A typical bucket example would be a single day of operation, and bucketSize would then be the operating duration of a day
 *     ii) If single day of opeartion is the bucket, then it means all encounters of a particular visitor within a single day would be considered as a single visit
 *        The main reason for taking this assumption is that we have no way to obtain the real correlation between visit and encounter.
 *        For one thing, we aren't sure whether a visitor has left a place or not. **Tackle this challenge if you can!**
 *
 * Overview::
 *   The high level idea is to convert the list of "encounters" into list of "visits". Each visitors would have a list of "visits", each corresponding to one bucket.
 *   Sample Data Structure:
 *   {
 *     visitor1: {
 *       bucket1: {enteredAt: xxx, exitedAt: yyy, duration},
 *       bucket2: {enteredAt: xxx, exitedAt: yyy, duration},
 *       ...
 *     },
 *     visitor2: ...,
 *     visitor3: ...
 *   }
 *
 *   With the new data structure, queries like average duration can be carried out effectively.
 *
 * @param {Moment} periodFrom Start time of the period
 * @param {Moment} periodTo End time of the period
 * @param {Moment Unit} bucketSize Size of each bucket, e.g. 'd'
 */
VisitsEngine = function(periodFrom, periodTo, bucketSize) {
  this.data = {};
  this.periodFrom = periodFrom;
  this.periodTo = periodTo;
  this.bucketSize = bucketSize;
};

/*
 * Construct the described data strcuture from encounters.
 *
 * @params {Encounter[]} encounters List of encounters
 */
VisitsEngine.prototype.build = function(encounters) {
  var self = this;
  self.data = {};
  _.each(encounters, function(encounter) {
    var vid = encounter.visitorId;
    var bucket = encounter.enteredAt.diff(self.periodFrom, self.bucketSize);
    self.data[vid] = self.data[vid] || {};
    self.data[vid][bucket] = self.data[vid][bucket] || {enteredAt: null, exitedAt: null, duration: 0};
    if (self.data[vid][bucket]['enteredAt'] === null || self.data[vid][bucket]['enteredAt'].isAfter(encounter.enteredAt)) {
      self.data[vid][bucket]['enteredAt'] = encounter.enteredAt;
    }
    if (self.data[vid][bucket]['exitedAt'] === null || self.data[vid][bucket]['exitedAt'].isBefore(encounter.enteredAt)) {
      self.data[vid][bucket]['exitedAt'] = encounter.exitedAt;
    }
    self.data[vid][bucket].duration += encounter.duration; 
  });
};

/*
 * Returns average duration
 * Two-steps average:
 *   1) per each visitor, compute an average
 *   2) compute overall average among all visitors
 */
VisitsEngine.prototype.queryAverageDuration = function() {
  var self = this;
  var sum = _.reduce(this.data, function(memo, item) {
    return memo + self.queryVisitorAverageDuration(item);
  }, 0); 
  var cnt = Object.keys(this.data).length;
  var avg = cnt > 0? sum / cnt: 0;
  return avg;
};

/*
 * Returns total number of visitors
 */
VisitsEngine.prototype.queryTotalVisitorsCount = function() {
  return Object.keys(this.data).length;
};

/*
 * Returns number of visitors with repeated visits 
 */
VisitsEngine.prototype.queryRepeatedVisitorsCount = function() {
  var sum = _.reduce(this.data, function(memo, item) {
    return memo + (Object.keys(item).length > 1? 1: 0);
  }, 0);
  return sum;
};

/*
 * Returns total number of visits
 */
VisitsEngine.prototype.queryTotalVisitsCount = function() {
  var sum = _.reduce(this.data, function(memo, item) {
    return memo + Object.keys(item).length;
  }, 0);
  return sum;
};

/*
 * Returns repeated visits percentage
 */
VisitsEngine.prototype.queryRepeatedVisitsPercentage = function() {
  return this.queryRepeatedVisitorsCount() / this.queryTotalVisitorsCount(); 
};


/*
 *  @param {"Enter"|"Exit"} by Group according to enteredAt or exitedAt
 *  @return {[][]} 7x24 array, each correspond to the average dwell time of a particular hour on a particular weekday
 *                 e.g. [0][0] corresponds to 00:00 - 01:00 on Sunday. [6][12] corresponds to 12:00-13:00 on Saturday
 */
VisitsEngine.prototype.queryAverageDurationWeeklyHourlySeries = function(by) {
  if (by !== "ENTER" && by !== "EXIT") {
    console.error("[VisitsEngine] Invalid input 'by': ", by);
    return;
  }
  var self = this;
  var slotDurations = this.constructZero2DArray(7, 24);
  var slotCount = this.constructZero2DArray(7, 24);
  _.each(this.data, function(vData, vid) {
    _.each(vData, function(item, b) {
      var at = (by === SegmentGraphBase.Graph.Data.Enter) ? item.enteredAt : item.exitedAt;
      slotDurations[at.day()][at.hour()] += item.duration;
      slotCount[at.day()][at.hour()]++;
    });
  });
  for (var i = 0; i < 7; i++) {
    for (var j = 0; j < 24; j++) {
      slotDurations[i][j] = slotCount[i][j] == 0? 0: slotDurations[i][j] / slotCount[i][j];
    }
  }
  return slotDurations;
}

/*
 *  @param {"Enter"|"Exit"} by Group according to enteredAt or exitedAt
 *  @return {[][]} 7x24 array, each correspond to the number of visits of a particular hour on a particular weekday
 *                 e.g. [0][0] corresponds to 00:00 - 01:00 on Sunday. [6][12] corresponds to 12:00-13:00 on Saturday
 */
VisitsEngine.prototype.queryVisitsCountWeeklyHourlySeries = function(by) {
  if (by !== "ENTER" && by !== "EXIT") {
    console.error("[VisitsEngine] Invalid input 'by': ", by);
    return;
  }
  var self = this;
  var slotCount = this.constructZero2DArray(7, 24);
  _.each(this.data, function(vData, vid) {
    _.each(vData, function(item, b) {
      var at = (by === SegmentGraphBase.Graph.Data) ? item.enteredAt : item.exitedAt;
      slotCount[at.day()][at.hour()]++;
    });
  });
  return slotCount;
}

/*
 * Return list of visitors count of each interval of duration
 * @param {Number} interval Interval in milliseconds
 * @return {Number[]}
 */
VisitsEngine.prototype.queryVisitorCountsXDurationIntervalSeries = function(interval) {
  var self = this;
  var counts = [];
  _.each(this.data, function(vData, vid) {
    var avg = self.queryVisitorAverageDuration(vData);
    var index = Math.floor(avg/interval);
    counts[index] = (counts[index] || 0) + 1;
  });
  var result = _.map(Array.apply(null, counts), function(item) {
    return _.isUndefined(item)? 0: item;
  });
  return result; 
};

/*
 * Return list of visitors count of against # of visits
 * @return {Number[]}
 */
VisitsEngine.prototype.queryVisitorCountsXVisitsSeries = function() {
  var counts = [];
  _.each(this.data, function(vData, vid) {
    var n = Object.keys(vData).length;
    counts[n] = (counts[n] || 0) + 1;
  });
  var result = _.map(Array.apply(null, counts), function(item) {
    return _.isUndefined(item)? 0: item;
  });
  return result;
}

/*
 * Returns list of visitors count of each buckets
 * @return {Number[]}
 */
VisitsEngine.prototype.queryVisitorsCountXBucketSeries = function() {
  var nBuckets = this.periodTo.diff(this.periodFrom, this.bucketSize);
  var bucketsCount = Array.apply(null, new Array(nBuckets)).map(Number.prototype.valueOf, 0);
  _.each(this.data, function(vData, vid) {
    _.each(vData, function(item, b) {
      bucketsCount[b]++;
    });
  });
  return bucketsCount;
};

/*
 * Return list of start time of each buckets
 * @return {Moment[]}
 */
VisitsEngine.prototype.queryBucketsStartSeries = function() {
  var self = this;
  var nBuckets = this.periodTo.diff(this.periodFrom, this.bucketSize);
  var result = _.map(_.range(nBuckets), function(item) {
    return moment(self.periodFrom).add(item, self.bucketSize);
  });
  return result;
};

/*
 * Returns average duration of a visitor
 * @private
 */
VisitsEngine.prototype.queryVisitorAverageDuration = function(vData) {
  var sum = _.reduce(vData, function(memo, item) {
    return memo + item.duration;
  }, 0); 
  var cnt = Object.keys(vData).length;
  var avg = cnt > 0? sum / cnt: 0;
  return avg;
};

/*
 * Construct an empty NxM arrays with zeroes
 * @private
 */
VisitsEngine.prototype.constructZero2DArray = function(row, col) {
  var arr = _.map(Array.apply(null, new Array(row)), function(item) {
    return _.map(Array.apply(null, new Array(col)), function(item2) {
      return 0
    });
  });
  return arr;
}
