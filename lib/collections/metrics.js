Metrics = new Meteor.Collection("metrics", {
  transform: function (doc) {
    if (doc.type === EngagementMetric.type) {
      return new EngagementMetric(doc);
    } else if (doc.type === InstallationMetric.type) {
      return new InstallationMetric(doc);
    } else if (doc.type === ProductMetric.type) {
      return new ProductMetric(doc);
    } else {
      // TODO remove usage Metric and rename BaseMetric to Metric
      var obj = new Metric(doc.locationId, doc.enteredAt, doc.exitedAt, doc.entranceVisitors);
      _.extend(obj, doc);
      return obj;
    }
  }
});

/**
 * - belongs to a {@link Location}
 *
 * @param locationId
 * @param enteredAt
 * @param exitedAt
 * @param entranceVisitors
 * @constructor
 *
 * @property locationId
 * @property enteredAt
 * @property exitedAt
 * @property entranceVisitors
 */
Metric = function(locationId, enteredAt, exitedAt, entranceVisitors) {
  this.locationId = locationId;
  this.enteredAt = enteredAt;
  this.exitedAt = exitedAt;
  if (entranceVisitors) {
    this.entranceVisitors = entranceVisitors;
  }
};

Metric.daily = "daily";
Metric.hourly = "hourly";

Metric.prototype.save = function() {
  var self = this;
  var attributes = function() {
    return {
      locationId: self.locationId,
      enteredAt: self.enteredAt,
      exitedAt: self.exitedAt };
  };
  var modifiers = function() {
    return {$set: attributes()};
  };
  var result = Metrics.upsert(attributes(), modifiers());
  if (result.insertedId) {
    self._id = result.insertedId;
  } else {
    self._id = Metrics.findOne(attributes())._id;
  }
  return self._id;
}

Metric.load = function(attributes) {
  var obj = Metrics.findOne(attributes);
  var instance = (obj) ? new Metric(obj.locationId, obj.enteredAt, obj.exitedAt, obj.entranceVisitors) : new Metric();
  instance._id = (obj) ? obj._id : "";
  return instance;
}

Metric.prototype.entranceVisits = function() {
  return (this.entranceVisitors||[]).length;
}

// Based on the operating hours of the given location, determine
// the proper time range to observe.
Metric.timeRange = function(Location, encounter) {
  var exitedAt = new Date(encounter.exitedAt);
  var year = exitedAt.getFullYear();
  var month= exitedAt.getMonth();
  var date  = exitedAt.getDate();
  var start = new Date(year, month, date);
  var end   = new Date(year, month, date + 1);

  return { enteredAt: start.getTime(), exitedAt: end.getTime()};
}
