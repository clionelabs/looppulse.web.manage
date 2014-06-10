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

Metric.prototype.entranceVisits = function() {
  return this.entranceVisitors.length;
}

Metric.prototype.updateEntrances = function(entrances, visitorId) {
  // We actually only count once.
  var self = this;
  var times = 0;
  if (entrances.length > 0) {
    times = 1;
  }
  _(times).times(function(n) {
    Metrics.update({_id: self._id},
                   {entranceVisitors: {$add: visitorId}});
  });
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
}
