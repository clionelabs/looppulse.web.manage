FloorMetrics = {};

/**
 * Reuse stored {@link InstallationMetric}
 *
 * @param selector  - must filter by locationId
 * @returns FloorMetric[]
 *
 */
FloorMetrics.find = function(selector) {
  var locationId = selector.locationId;
  var installationSelector = {
    locationId: locationId,
    type: InstallationMetric.type
  };

  var floorMetrics = [];
  Floors.find().forEach(function(floor) {
    var doc = {
      floorId: floor._id,
      visitCount: 0,
      dwellTime: 0,
      repeatedVisitCount: 0,
      locationId: floor.locationId
    };

    Metrics.find(installationSelector).forEach(function(installationMetric) {
      doc.visitCount += installationMetric.visitCount;
      doc.dwellTime += installationMetric.dwellTime;
      doc.repeatedVisitCount += installationMetric.repeatedVisitCount;
    });

    floorMetrics.push(new FloorMetric(doc));
  });

  return floorMetrics;
};

/**
 *
 * @param doc
 * @constructor
 *
 * @property floorId
 * @property visitCount
 * @property dwellTime
 * @property repeatedVisitCount
 * @property locationId  - Denormalized from Floor
 */
FloorMetric = function(doc) {
  BaseMetric.call(this, doc);
  this.type = FloorMetric.type;
};

FloorMetric.prototype = Object.create(BaseMetric.prototype);
FloorMetric.prototype.constructor = FloorMetric;

FloorMetric.prototype.dwellTimeInMinutes = function() {
  return this.dwellTime / 60;
};

FloorMetric.prototype.repeatedVisitPercentage = function() {
  return BaseMetric.calculatePercentage(this.repeatedVisitCount, this.visitCount);
};

FloorMetric.type = "floor";
