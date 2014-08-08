Beacons = new Meteor.Collection('beacons');

/**
 *
 * @param uuid
 * @param major
 * @param minor
 * @constructor
 *
 * @property uuid
 * @property major
 * @property minor
 */
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
