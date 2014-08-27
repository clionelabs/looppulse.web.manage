FloorMetrics = {};

/**
 * Reuse stored {@link InstallationMetric}
 *
 * @param selector
 * @returns {IMeteorCursor|*}
 *
 */
FloorMetrics.find = function(selector) {
  // FIXME replace dummyData with real implementation
  if (Floors.find().count() === 0) {
    Floors.insert({ name: "1/F" });
    Floors.insert({ name: "2/F" });
    Floors.insert({ name: "3/F" });
  }

  var dummyData = [];
  Floors.find().forEach(function(floor) {
    dummyData.push(new FloorMetric({
      floorId: floor._id,
      visitCount: 563,
      dwellTime: 48 * 60,
      repeatedVisitCount: 10
    }));
  });
  return dummyData;
  /*
  var finalSelector = {type: InstallationMetric.type};
  _.extend(finalSelector, selector);
  return Metrics.find(finalSelector, {
    transform: function(doc) {
      return new FloorMetric(doc);
    }
  });
  */
};

FloorMetric = function(doc) {
  BaseMetric.call(this, doc);
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
