Visitors = new Meteor.Collection('visitors');

Visitor = function(uuid) {
  this.uuid = uuid;
}

Visitor.prototype.save = function() {
  Visitors.upsert(this, this);
  this._id = Visitors.findOne(this)._id;
  return this._id;
}

// Given the time range specified by the metric,
// trace all the encounters by this visitor
Visitor.prototype.subPaths = function(metric) {
  var self = this;
  var encounters = Encounters.find({visitorId: self._id,
                                    enteredAt: {$gte: metric.enteredAt},
                                    exitedAt: {$lte: metric.exitedAt}},
                                   {sort: {enteredAt: 1}});
  var visit = new Visit(encounters);
  return visit.subPaths();
}

Visitor.ensureIndex = function() {
  Visitors._ensureIndex({uuid: 1});
}
