LocationMetrics = {};

LocationMetrics.findOneForThisWeek = function(selector) {
  var locationId = (typeof selector === 'string') ? selector : selector.locationId;
  var now = new Date();
  var startTime = MetricsHelper.nDaysAgoTruncatedTime(now, 7);

  var installationSelector = {
    locationId: locationId,
    startTime: { $gte: startTime }
  };
  var doc = {
    locationId: locationId,
    startTime: startTime,
    visitCount: 0,
    dwellTime: 0,
    repeatedVisitCount: 0
  };
  InstallationMetrics.findDaily(installationSelector).map(function(installationMetric) {
    doc.visitCount += installationMetric.visitCount;
    doc.dwellTime += installationMetric.dwellTime;
    doc.repeatedVisitCount += installationMetric.repeatedVisitCount;
  });

  {
    var installationSelector = {
      locationId: locationId,
      startTime: { $gte: MetricsHelper.nDaysAgoTruncatedTime(now, 14), $lt: startTime }
    };
    var docLastWeek = {
      locationId: locationId,
      startTime: startTime,
      visitCount: 0,
      dwellTime: 0,
      repeatedVisitCount: 0
    };
    InstallationMetrics.findDaily(installationSelector).map(function(installationMetric) {
      docLastWeek.visitCount += installationMetric.visitCount;
      docLastWeek.dwellTime += installationMetric.dwellTime;
      docLastWeek.repeatedVisitCount += installationMetric.repeatedVisitCount;
    });

    var visitCountLastWeek = docLastWeek.visitCount,
      dwellTimeLastWeek = docLastWeek.dwellTime,
      repeatedVisitLastWeek = doc.repeatedVisitCount;
    doc.visitPercentageChangeSinceLastWeek = BaseMetric.calculatePercentage(
        doc.visitCount - visitCountLastWeek, visitCountLastWeek);
    doc.dwellTimeAveragePercentageChangeSinceLastWeek = BaseMetric.calculatePercentage(
        doc.dwellTimeAverage - dwellTimeLastWeek, dwellTimeLastWeek);
    doc.repeatedVisitPercentageChangeSinceLastWeek = BaseMetric.calculatePercentage(
        doc.repeatedVisitCount - repeatedVisitLastWeek, repeatedVisitLastWeek);
  }

  return new LocationMetric(doc);
};

/**
 *
 * @param doc
 * @constructor
 *
 * @property type
 * @property startTime
 * @property locationId
 * @property visitCount
 * @property dwellTime
 * @property repeatedVisitCount
 * @property visitPercentageChangeSinceLastWeek
 * @property dwellTimeAveragePercentageChangeSinceLastWeek
 * @property repeatedVisitPercentageChangeSinceLastWeek
 */
LocationMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = LocationMetric.type;

  this.dwellTimeAverage = this.visitCount ? this.dwellTime / this.visitCount : 0;
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
