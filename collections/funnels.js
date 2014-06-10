Funnels = new Meteor.Collection("funnels");

Funnel = function(metricId, installationId) {
  this.metricId = metricId;
  this.installationId = installationId;

  // Do not initialize these as we would over write the exisiting
  // if this particular funnel exists before.
  // this.productVisits = 0;
  // this.cashiersVisits = 0;
}

Funnel.prototype.save = function() {
  Funnels.upsert(this, this);
  this._id = Funnels.findOne(this)._id;
  return this._id;
}

Funnel.prototype.markClosed = function(visitorId) {
  var self = this;
  Funnels.update({_id: self._id},
                 {$addToSet: {productVisitors: visitorId,
                              cashierVisitors: visitorId}});
  console.log("Funnel#markClosed("+visitorId+"): "+JSON.stringify(Funnels.findOne({_id:self._id})));
}

Funnel.prototype.markOpen = function(visitorId) {
  var self = this;
  Funnels.update({_id: self._id},
                 {$addToSet: {productVisitors: visitorId},
                  $pull:     {cashierVisitors: visitorId}});
  console.log("Funnel#markOpen("+visitorId+"): "+JSON.stringify(Funnels.findOne({_id:self._id})));
}

Funnel.prototype.productVisits = function() {
  return this.productVisitors.length;
}

Funnel.prototype.cashierVisits = function() {
  return this.cashierVisitors.length;
}

Funnel.load = function(id) {
  var json = Funnels.findOne({_id: id});
  var loaded = new Funnel(json.metricId, json.installationId);
  loaded._id = json._id;
  return loaded;
}
