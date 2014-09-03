LocationMetrics = {};

LocationMetrics.findOneForThisWeek = function(selector) {
  var locationId = (typeof selector === 'string') ? selector : selector.locationId;

  var installationSelector = {
    locationId: locationId,
    startTime: { $gte: MetricsHelper.nDaysAgoTruncatedTime(new Date(), 7) }
  };

  var doc = {
    locationId: locationId,
    visitCount: 0,
    dwellTime: 0,
    repeatedVisitCount: 0
  };
  InstallationMetrics.findDaily(installationSelector).map(function(installationMetric) {
    doc.visitCount += installationMetric.visitCount;
    doc.dwellTime += installationMetric.dwellTime;
    doc.repeatedVisitCount += installationMetric.repeatedVisitCount;
  });

  return new LocationMetric(doc);
};

/**
 *
 * @param doc
 * @constructor
 *
 * @property type
 * @property locationId
 * @property visitCount
 * @property dwellTime
 * @property repeatedVisitCount
 */
LocationMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = LocationMetric.type;

  this.dwellTimeAverage = this.visitCount ? this.dwellTime / this.visitCount : 0;

  // FIXME replace dummyData with real implementation
  var visitCountLastWeek = 100, dwellTimeLastWeek = 10 * 60, repeatedVisitLastWeek = 10;
  this.visitPercentageChangeSinceLastWeek = BaseMetric.calculatePercentage(
      this.visitCount - visitCountLastWeek, visitCountLastWeek);
  this.dwellTimeAveragePercentageChangeSinceLastWeek = BaseMetric.calculatePercentage(
      this.dwellTimeAverage - dwellTimeLastWeek, dwellTimeLastWeek);
  this.repeatedVisitPercentageChangeSinceLastWeek = BaseMetric.calculatePercentage(
      this.repeatedVisitCount - repeatedVisitLastWeek, repeatedVisitLastWeek);
};

LocationMetric.prototype = Object.create(BaseMetric.prototype);
LocationMetric.prototype.constructor = LocationMetric;

LocationMetric.prototype.dwellTimeAverageInMinutes = function() {
  return BaseMetric.convertMillisecondsToMinutes(this.dwellTimeAverage);
};

LocationMetric.prototype.repeatedVisitPercentage = function() {
  return BaseMetric.calculatePercentage(this.repeatedVisitCount, this.visitCount);
};

LocationMetric.type = "location";
