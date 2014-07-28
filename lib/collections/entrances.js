Entrances = new Meteor.Collection('entrances');

Entrance = function(name) {
  this.name = name;
}

Entrance.prototype.save = function() {
  Entrances.upsert(this, this);
  this._id = Entrances.findOne(this)._id;
  return this._id;
}
