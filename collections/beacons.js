Beacons = new Meteor.Collection('beacons');

Beacon = function(uuid, major, minor, product_id, location_id) {
  this.uuid = uuid;
  this.major = major;
  this.minor = minor;
  this.product_id = product_id;
  this.location_id = location_id;
}

Beacon.prototype.save = function() {
  Beacons.upsert(this, this);
  this._id = Beacons.findOne(this)._id;
  return this._id;
}
