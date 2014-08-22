Metrics = new Meteor.Collection("metrics", {
  transform: function (doc) {
    if (doc.type === EngagementMetric.type) {
      return new EngagementMetric(doc);
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
}

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

Metric.prototype.missedOpportunities = function() {
  // Go thru all the funnels at this location
  // and calculate the non converted visits
  var missed = 0;
  Funnels.find({metricId: this._id}).forEach(function(loaded) {
    var funnel = Funnel.load(loaded);
    missed += funnel.productVisits() - funnel.cashierVisits();
  });
  return missed;
}

Metric.prototype.updateEntrances = function(entrances, visitorId) {
  // Only count one entrance per visitor within the given Metric's time range
  if (entrances.length > 0) {
    Metrics.update({_id: this._id},
                   {$addToSet: {entranceVisitors: visitorId}});
  }
}

Metric.prototype.updateClosedFunnels = function(closed, visitorId) {
  var self = this;
  _.each(closed, function(installation) {
    var funnel = new Funnel(self._id, installation._id);
    funnel.save();
    funnel.markClosed(visitorId);
  });
}

Metric.prototype.updateOpenFunnels = function(open, visitorId) {
  var self = this;
  _.each(open, function(installation) {
    var funnel = new Funnel(self._id, installation._id);
    funnel.save();
    funnel.markOpen(visitorId);
  });
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

Metric.update = function(location, encounter, visitor) {
  var timeRange = Metric.timeRange(location, encounter);
  var metric = new Metric(location._id, timeRange.enteredAt, timeRange.exitedAt);
  metric.save();

  var subPaths = visitor.subPaths(metric);
  _.each(subPaths, function(subPath) {
    // Associate with the corresponding funnel
    var visitorId = visitor._id;
    metric.updateEntrances(subPath.entrances, visitorId);
    metric.updateClosedFunnels(subPath.closed, visitorId);
    metric.updateOpenFunnels(subPath.open, visitorId);
  });
  return metric;
}
