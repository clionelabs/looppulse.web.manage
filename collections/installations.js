Installations = new Meteor.Collection('installations');

Installation = function(locationId, beaconId, physicalId, type) {
  this.locationId = locationId;
  this.beaconId = beaconId;
  this.physicalId = physicalId;
  this.type = type;
}

Installation.prototype.save = function() {
  Installations.upsert(this, this);
  this._id = Installations.findOne(this)._id;
  return this._id;
}
