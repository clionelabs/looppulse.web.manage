Installations = new Meteor.Collection('installations');

Installation = function(type, locationId, beaconId, physicalId) {
  this.type = type;
  this.locationId = locationId;
  this.beaconId = beaconId;
  this.physicalId = physicalId;
}

Installation.prototype.save = function() {
  Installations.upsert(this, this);
  this._id = Installations.findOne(this)._id;
  return this._id;
}

Installation.ensureIndex = function() {
  Installations._ensureIndex({locationId:1, type:1, physicalId:1})
}
