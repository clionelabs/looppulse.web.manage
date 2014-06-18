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
  var obj = Funnels.findOne(attributes);
  var instance =  (obj) ? new Funnel(obj.metricId, obj.installationId, obj.productVisitors, obj.cashierVisitors) :  new Funnel() ;
  instance._id = (obj) ? obj._id : "";
  return instance;
}
