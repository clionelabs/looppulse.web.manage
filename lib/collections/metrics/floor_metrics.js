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
  var floorMetrics = [];

  Floors.find().forEach(function(floor) {
    var doc = {
      floorId: floor._id,
      visitCount: 0,
      dwellTime: 0,
      repeatedVisitCount: 0,
      locationId: floor.locationId
    };

    var installationIds = [];
    Installations.find({ "coord.z": floor.level }).forEach(function(installation) {
      installationIds.push(installation._id);
    });
    var installationSelector = {
      locationId: locationId,
      installationIds: { $in: installationIds }
    };

    InstallationMetrics.find(installationSelector).forEach(function(installationMetric) {
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

  this.dwellTimeAverage = this.dwellTime / this.visitCount;
};

FloorMetric.prototype = Object.create(BaseMetric.prototype);
FloorMetric.prototype.constructor = FloorMetric;

FloorMetric.prototype.dwellTimeAverageInMinutes = function() {
  return BaseMetric.convertMillisecondsToMinutes(this.dwellTimeAverage);
};

FloorMetric.prototype.repeatedVisitPercentage = function() {
  return BaseMetric.calculatePercentage(this.repeatedVisitCount, this.visitCount);
};

FloorMetric.type = "floor";
