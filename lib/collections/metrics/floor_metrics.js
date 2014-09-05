FloorMetrics = {};

/**
 * Reuse stored {@link InstallationMetric}
 *
 * @param selector  - must filter by locationId
 *
 */
FloorMetrics.find = function(selector) {
  var locationId = selector.locationId;

  return Floors.find({locationId: locationId}).map(function(floor) {
    var doc = {
      type: FloorMetric.type,
      floorId: floor._id,
      visitCount: 0,
      dwellTime: 0,
      repeatedVisitCount: 0,
      locationId: floor.locationId,
      floor: floor
    };

    var installationIds = floor.installations().map(function(installation) {
      return installation._id;
    });

    InstallationMetrics.findDaily({
      locationId: locationId,
      installationId: { $in: installationIds }
    }).map(function(installationMetric) {
      doc.visitCount += installationMetric.visitCount;
      doc.dwellTime += installationMetric.dwellTime;
      doc.repeatedVisitCount += installationMetric.repeatedVisitCount;
    });

    return new FloorMetric(doc);
  });
};

/**
 *
 * @param selector  - must have locationId, startTime.$gte, and startTime.$gte will truncated to hour
 */
FloorMetrics.findHourly = function(selector) {
  var locationId = selector.locationId;
  var startTime = selector.startTime.$gte;

  return _.flatten(MetricsHelper.hourlyStartTimeSince(new Date(startTime)).map(function(startTime) {
    return Floors.find({locationId: locationId}).map(function(floor) {
      var installationSelector = {
        "coord.z": floor.level,
        locationId: locationId,
        resolution: "hourly",
        startTime: startTime
      };
      var doc = {
        type: FloorMetric.type,
        floorId: floor._id,
        locationId: locationId,
        visitCount: 0,
        dwellTime: 0,
        repeatedVisitCount: 0,
        startTime: startTime,
        floor: floor
      };
      InstallationMetrics.findHourly(installationSelector).map(function(installationMetric) {
        doc.visitCount += installationMetric.visitCount;
        doc.dwellTime += installationMetric.dwellTime;
        doc.repeatedVisitCount += installationMetric.repeatedVisitCount;
      });

      return new FloorMetric(doc);
    });
  }), true);
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

  this.dwellTimeAverage = this.visitCount ? this.dwellTime / this.visitCount : 0;
};

FloorMetric.prototype = Object.create(BaseMetric.prototype);
FloorMetric.prototype.constructor = FloorMetric;

FloorMetric.prototype.getFloor = function() {
  if (!this.floor) {
    this.floor = Floors.findOne(this.floorId);
  }
  return this.floor;
};

FloorMetric.prototype.dwellTimeAverageInMinutes = function() {
  return BaseMetric.convertMillisecondsToMinutes(this.dwellTimeAverage);
};

FloorMetric.prototype.repeatedVisitPercentage = function() {
  return BaseMetric.calculatePercentage(this.repeatedVisitCount, this.visitCount);
};

FloorMetric.type = "floor";
