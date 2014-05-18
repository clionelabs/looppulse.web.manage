Visitors = new Meteor.Collection('visitors');

Visitor = function(visitor_uuid) {
  this.uuid = visitor_uuid;
}

Visitor.prototype.save = function() {
  Visitors.upsert(this, this);
  this._id = Visitors.findOne(this)._id;
  return this._id;
}
