Metrics = new Meteor.Collection("metrics");

Metric = function(locationId, enteredAt, exitedAt) {
  this.locationId = locationId;
  this.enteredAt = enteredAt;
  this.exitedAt = exitedAt;
}

Metric.prototype.save = function() {
  var self = this;
  Metrics.upsert(self, self);
  self._id = Metrics.findOne(self)._id;
  return self._id;
}

Metric.prototype.incrementEntranceVisit = function() {
  // TODO: this is not clear as why we don't need to save again.
  Metrics.update({_id: this._id}, {$inc: {entrancesVisits: 1}});
}

Metric.prototype.incrementProductVisit = function(encounter) {
  var funnel = new Funnel(this._id, encounter.installationId);
  funnel.save();
  funnel.incrementProductVisit(encounter._id);
}

Metric.prototype.incrementCashierVisit = function(encounter) {
  // What other products did this visitor visit before this encounter to cashier?
  // TODO: product encounter exitedAt can happen after visitor enters into
  // a cashier because of the 30 seconds delay from iOS.
  var self = this;
  var encounters = Encounters.find({visitorId: encounter.visitorId,
                                    enteredAt: {$gte: self.enteredAt},
                                    exitedAt:  {$lte: encounter.enteredAt}});
  encounters.forEach(function(encounter) {
    var installation = Installation.load({_id: encounter.installationId});
    if (installation.isProduct()) {
      var funnelId = Funnels.findOne({metricId: self._id, installationId: installation._id})._id;
      var funnel = Funnel.load(funnelId);
      funnel.incrementCashierVisit(encounter._id);
    }
  });
}

// Based on the operating hours of the given location, determine
// the proper time range to observe.
Metric.timeRange = function(Location, encounter) {
  var exitedAt = new Date(encounter.exitedAt);
  var year = exitedAt.getUTCFullYear();
  var month= exitedAt.getUTCMonth();
  var date  = exitedAt.getUTCDate();
  var start = new Date(year, month, date);
  var end   = new Date(year, month, date + 1);

  return { enteredAt: start.getTime(), exitedAt: end.getTime()};
}

Metric.update = function(location, encounter) {
  var timeRange = Metric.timeRange(location, encounter);
  var metric = new Metric(location._id, timeRange.enteredAt, timeRange.exitedAt);
  metric.save();

  // Update metric accordingly.
  var installation = Installation.load({_id: encounter.installationId});
  if (installation.isEntrance()) {
    metric.incrementEntranceVisit();
  } else if (installation.isProduct()) {
    metric.incrementProductVisit(encounter);
  } else if (installation.isCashier()) {
    metric.incrementCashierVisit(encounter);
  }
}
