LocationMetrics = new Meteor.Collection(null);

LocationMetrics.findOne = function(locationId) {
  var selector = {
    locationId: locationId,
    type: InstallationMetric.type
  };

  var doc = {
    locationId: locationId,
    visitCount: 0,
    dwellTime: 0,
    repeatedVisitCount: 0
  };
  Metrics.find(selector).forEach(function(installationMetric) {
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
