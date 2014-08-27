LocationMetrics = {};

LocationMetrics.find = function(selector) {
  // FIXME replace dummyData with real implementation
  var dummyData = [];
  Locations.find().forEach(function(location) {
    dummyData.push(new LocationMetric({
      locationId: location._id,
      visitCount: 100,
      dwellTimeAverage: 30,
      repeatedVisitCount: 10,
      visitPercentageChangeSinceLastWeek: 10
    }));
  });
  return dummyData;
};

LocationMetrics.findOne = function(selector) {
  // FIXME replace dummyData with real implementation
  return new LocationMetric({
    locationId: location._id,
    visitCount: Metrics.find().count(),
    dwellTimeAverage: 30,
    repeatedVisitCount: 10,
    visitPercentageChangeSinceLastWeek: 10,
    dwellTimeAveragePercentageChangeSinceLastWeek: -10,
    repeatedVisitPercentageChangeSinceLastWeek: 10
  });
};

LocationMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = LocationMetric.type;
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
