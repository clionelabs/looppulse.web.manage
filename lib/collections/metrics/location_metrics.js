LocationMetrics = {};

LocationMetrics.findOne = function(selector) {
  var locationId = (typeof selector === 'string') ? selector : selector.locationId;

  var installationSelector = {
    locationId: locationId
  };
  var doc = {
    locationId: locationId,
    visitCount: 0,
    dwellTime: 0,
    repeatedVisitCount: 0
  };
  InstallationMetrics.find(installationSelector).forEach(function(installationMetric) {
    doc.visitCount += installationMetric.visitCount || 0;
    doc.dwellTime += installationMetric.dwellTime || 0;
    doc.repeatedVisitCount += installationMetric.repeatedVisitCount || 0;
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

  this.dwellTimeAverage = this.dwellTime / this.visitCount;

  // FIXME replace dummyData with real implementation
  this.visitPercentageChangeSinceLastWeek = 10;
  this.dwellTimeAveragePercentageChangeSinceLastWeek = -10;
  this.repeatedVisitPercentageChangeSinceLastWeek = 0;
};

LocationMetric.prototype = Object.create(BaseMetric.prototype);
LocationMetric.prototype.constructor = LocationMetric;

LocationMetric.prototype.dwellTimeAverageInMinutes = function() {
  return this.dwellTimeAverage / 60;
};

LocationMetric.prototype.repeatedVisitPercentage = function() {
  return BaseMetric.calculatePercentage(this.repeatedVisitCount, this.visitCount);
};

LocationMetric.type = "location";
