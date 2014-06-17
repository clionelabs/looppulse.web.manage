Funnels = new Meteor.Collection("funnels");

Funnel = function(metricId, installationId, productVisitors, cashierVisitors) {
  this.metricId = metricId;
  this.installationId = installationId;
  if (productVisitors) {
    this.productVisitors = productVisitors;
  }
  if (cashierVisitors) {
    this.cashierVisitors = cashierVisitors;
  }
}

Funnel.prototype.save = function() {
  var self = this;
  var result = Funnels.upsert(self, self);
  if (result.insertedId) {
    self._id = result.insertedId;
  } else {
    self._id = Funnels.findOne(self)._id;
  }
  return self._id;
}

Funnel.prototype.markClosed = function(visitorId) {
  var self = this;
  Funnels.update({_id: self._id},
                 {$addToSet: {productVisitors: visitorId,
                              cashierVisitors: visitorId}});
}

Funnel.prototype.markOpen = function(visitorId) {
  var self = this;
  Funnels.update({_id: self._id},
                 {$addToSet: {productVisitors: visitorId},
                  $pull:     {cashierVisitors: visitorId}});
}

Funnel.prototype.productVisits = function() {
  return (this.productVisitors||[]).length;
}

Funnel.prototype.cashierVisits = function() {
  return (this.cashierVisitors||[]).length;
}

Funnel.load = function(attributes) {
  var json = Funnels.findOne(attributes);
  var loaded = new Funnel(json.metricId, json.installationId,
                          json.productVisitors, json.cashierVisitors);
  loaded._id = json._id;
  return loaded;
}
