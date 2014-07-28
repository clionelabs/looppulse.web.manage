Beacons = new Meteor.Collection('beacons');

Beacon = function(uuid, major, minor) {
  this.uuid = uuid;
  this.major = major;
  this.minor = minor;
}

Beacon.prototype.save = function() {
  Beacons.upsert(this, this);
  this._id = Beacons.findOne(this)._id;
  return this._id;
}
