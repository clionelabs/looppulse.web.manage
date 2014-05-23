Beacons = new Meteor.Collection('beacons');

Beacon = function(uuid, major, minor, productId, locationId) {
  this.uuid = uuid;
  this.major = major;
  this.minor = minor;
  this.productId = productId;
  this.locationId = locationId;
}

Beacon.prototype.save = function() {
  Beacons.upsert(this, this);
  this._id = Beacons.findOne(this)._id;
  return this._id;
}
