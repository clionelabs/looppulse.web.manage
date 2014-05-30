Visitors = new Meteor.Collection('visitors');

Visitor = function(uuid) {
  this.uuid = uuid;
}

Visitor.prototype.save = function() {
  Visitors.upsert(this, this);
  this._id = Visitors.findOne(this)._id;
  return this._id;
}

Visitor.ensureIndex = function() {
  Visitors._ensureIndex({uuid: 1});
}
